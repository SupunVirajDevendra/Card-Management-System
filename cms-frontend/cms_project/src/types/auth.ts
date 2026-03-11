export type UserRole = "Admin" | "User" | "Manager";

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    username: string;
    password: string;
    userRole: UserRole;
}

export interface AuthResponse {
    token: string;
    username: string;
    userRole: UserRole;
}

export interface User {
    username: string;
    userRole: UserRole;
    token: string;
}
