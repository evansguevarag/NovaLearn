export type UserRole = "ADMIN" | "INSTRUCTOR" | "STUDENT";

export type UserStatus = "ACTIVE" | "INACTIVE" | "PENDING_VERIFICATION";

export interface LoginRequest {
    email: string;
    password: string;
    }

    export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    userId: number;
    email: string;
    role: UserRole;
    status: UserStatus;
}