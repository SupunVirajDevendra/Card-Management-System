import api from "./api";
import type { AuthResponse, LoginCredentials, RegisterData, User } from "../types/auth";

const AUTH_ENDPOINT = import.meta.env.VITE_API_AUTH || "/api/auth";
const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || "auth_token";
const USER_KEY = import.meta.env.VITE_USER_KEY || "auth_user";

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(`${AUTH_ENDPOINT}/login`, credentials);
    return response.data;
}

export async function register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(`${AUTH_ENDPOINT}/register`, data);
    return response.data;
}

export async function logout(): Promise<void> {
    try {
        const token = getToken();
        if (token) {
            await api.post(`${AUTH_ENDPOINT}/logout`);
        }
    } catch {
    } finally {
        clearAuth();
    }
}

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function setAuth(auth: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, auth.token);
    localStorage.setItem(USER_KEY, JSON.stringify({
        username: auth.username,
        userRole: auth.userRole,
    }));
}

export function getUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
        return JSON.parse(userStr) as User;
    } catch {
        return null;
    }
}

export function clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
    return !!getToken();
}
