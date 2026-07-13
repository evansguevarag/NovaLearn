import { api } from "@/lib/api";

import type {
    AdminCreateUserRequest,
    AdminEmailAvailability,
    AdminUpdateUserRoleRequest,
    AdminUpdateUserStatusRequest,
    AdminUser,
    } from "../types/admin-user.types";

    export async function getAdminUsers(): Promise<AdminUser[]> {
    const response = await api.get<AdminUser[]>("/admin/users");
    return response.data;
    }

    export async function getAdminUserById(
    userId: number
    ): Promise<AdminUser> {
    const response = await api.get<AdminUser>(`/admin/users/${userId}`);
    return response.data;
    }

    export async function createAdminUser(
    request: AdminCreateUserRequest
    ): Promise<AdminUser> {
    const response = await api.post<AdminUser>("/admin/users", request);
    return response.data;
    }

    export async function checkAdminUserEmailAvailability(
    email: string
    ): Promise<AdminEmailAvailability> {
    const response = await api.get<AdminEmailAvailability>(
        "/admin/users/email-availability",
        {
        params: { email },
        }
    );

    return response.data;
    }

    export async function updateAdminUserRole(
    userId: number,
    request: AdminUpdateUserRoleRequest
    ): Promise<AdminUser> {
    const response = await api.patch<AdminUser>(
        `/admin/users/${userId}/role`,
        request
    );

    return response.data;
    }

    export async function updateAdminUserStatus(
    userId: number,
    request: AdminUpdateUserStatusRequest
    ): Promise<AdminUser> {
    const response = await api.patch<AdminUser>(
        `/admin/users/${userId}/status`,
        request
    );

    return response.data;
}
