export type AdminUserRole = "ADMIN" | "INSTRUCTOR" | "STUDENT";

export type AdminUserStatus =
    | "ACTIVE"
    | "INACTIVE"
    | "PENDING_VERIFICATION";

    export interface AdminUser {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: AdminUserRole;
    status: AdminUserStatus;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string | null;
    }

    export interface AdminCreateUserRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: AdminUserRole;
    }

    export interface AdminUpdateUserRoleRequest {
    role: AdminUserRole;
    }

    export interface AdminUpdateUserStatusRequest {
    status: AdminUserStatus;
}