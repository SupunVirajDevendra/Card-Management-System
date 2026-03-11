import axios, { type AxiosError } from "axios";
import { encryptData } from "../utils/crypto";
import toast from "react-hot-toast";
import { getToken, clearAuth } from "./authService";

const ENABLE_ENCRYPTION = import.meta.env.VITE_ENABLE_ENCRYPTION === "true";

class ApiError extends Error {
    statusCode: number | undefined;
    code: string | undefined;

    constructor(message: string, statusCode: number | undefined, code?: string) {
        super(message);
        this.name = "ApiError";
        this.statusCode = statusCode;
        this.code = code;
    }
}

export { ApiError };

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
    maxBodyLength: Infinity,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000,
});

api.interceptors.request.use(async (config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    const isAuthEndpoint = config.url?.includes("/auth/login") || config.url?.includes("/auth/register");
    const isReportEndpoint = config.url?.includes("/reports/");
    
    if (ENABLE_ENCRYPTION && !isAuthEndpoint && !isReportEndpoint && config.data && ["post", "put", "patch"].includes(config.method || "")) {
        try {
            const encrypted = await encryptData(config.data);
            config.data = { payload: encrypted };
            console.log("Payload encrypted successfully");
        } catch (error) {
            console.error("Encryption failed:", error);
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const statusCode = error.response?.status;
        let message = "An unexpected error occurred";

        if (error.response) {
            const data = error.response.data as { message?: string };
            message = data?.message || error.message;
            
            switch (statusCode) {
                case 400:
                    message = data?.message || "Bad request. Please check your input.";
                    break;
                case 401:
                    if (error.config?.url?.includes("/auth/")) {
                        message = data?.message || "Invalid username or password.";
                    } else if (error.config?.url?.includes("/reports/")) {
                        message = data?.message || "Download failed. Please try again.";
                    } else {
                        message = "Session expired. Please log in again.";
                        clearAuth();
                        window.location.href = "/login";
                    }
                    break;
                case 403:
                    message = "Forbidden. You don't have permission for this action.";
                    break;
                case 404:
                    message = "Resource not found.";
                    break;
                case 409:
                    message = data?.message || "Conflict. The resource already exists.";
                    break;
                case 422:
                    message = data?.message || "Validation error.";
                    break;
                case 500:
                    message = "Server error. Please try again later.";
                    break;
                case 502:
                case 503:
                    message = "Service unavailable. Please try again later.";
                    break;
            }
        } else if (error.request) {
            message = "Network error. Please check your connection.";
        }

        toast.error(message);
        return Promise.reject(new ApiError(message, statusCode, error.code));
    }
);

export default api;
