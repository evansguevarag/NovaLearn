export type AdminUserRole = "ADMIN" | "INSTRUCTOR" | "STUDENT";

export type AdminUserStatus =
    | "ACTIVE"
    | "INACTIVE";

    export interface AdminUser {
    id: number;
    firstName: string;
    lastName: string;
    paternalLastName: string | null;
    maternalLastName: string | null;
    email: string;
    role: AdminUserRole;
    status: AdminUserStatus;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string | null;
    }

    export interface AdminCreateUserRequest {
    firstName: string;
    paternalLastName: string;
    maternalLastName: string;
    email: string;
    password: string;
    role: AdminUserRole;
    }

    export interface AdminEmailAvailability {
    email: string;
    available: boolean;
    }

    export interface AdminUpdateUserRoleRequest {
    role: AdminUserRole;
    }

    export interface AdminUpdateUserStatusRequest {
    status: AdminUserStatus;
}
