"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useSyncExternalStore } from "react";

import {
    AUTH_STORAGE_EVENT,
    getAccessToken,
    getAuthUser,
    } from "@/lib/auth-storage";

    type AllowedRole = "ADMIN" | "INSTRUCTOR" | "STUDENT";

    function subscribe(callback: () => void) {
    window.addEventListener("storage", callback);
    window.addEventListener(AUTH_STORAGE_EVENT, callback);

    return () => {
        window.removeEventListener("storage", callback);
        window.removeEventListener(AUTH_STORAGE_EVENT, callback);
    };
    }

    function getSnapshot() {
    const token = getAccessToken();
    const user = getAuthUser();

    return JSON.stringify({
        token,
        user,
    });
    }

    function getServerSnapshot() {
    return JSON.stringify({
        token: null,
        user: null,
    });
    }

    export function useAuthGuard(allowedRoles?: AllowedRole[]) {
    const router = useRouter();

    const snapshot = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot
    );

    const session = useMemo(() => {
        return JSON.parse(snapshot) as {
        token: string | null;
        user: {
            userId: number;
            email: string;
            role: AllowedRole;
            status: string;
        } | null;
        };
    }, [snapshot]);

    const authState = useMemo(() => {
        const isAuthenticated = Boolean(session.token && session.user);

        const hasAllowedRole =
        !!session.user &&
        (!allowedRoles || allowedRoles.includes(session.user.role));

        return {
        user: session.user,
        isAuthenticated,
        hasAllowedRole,
        };
    }, [session, allowedRoles]);

    useEffect(() => {
        if (!authState.isAuthenticated) {
        router.replace("/login");
        return;
        }

        if (!authState.hasAllowedRole) {
        router.replace("/login");
        }
    }, [authState.isAuthenticated, authState.hasAllowedRole, router]);

    return {
        isChecking: !authState.isAuthenticated || !authState.hasAllowedRole,
        user: authState.user,
    };
}