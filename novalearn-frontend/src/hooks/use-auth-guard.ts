"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { refreshSession } from "@/features/auth/services/auth.service";
import {
  AUTH_STORAGE_EVENT,
  clearAuthSession,
  getAccessToken,
  getAuthUser,
  saveAuthSession,
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
  const didTryRefresh = useRef(false);
  const [isRefreshing, setIsRefreshing] = useState(true);

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
    let cancelled = false;

    async function restoreSession(): Promise<void> {
      if (authState.isAuthenticated) {
        setIsRefreshing(false);
        return;
      }

      if (didTryRefresh.current) {
        setIsRefreshing(false);
        router.replace("/login");
        return;
      }

      didTryRefresh.current = true;
      setIsRefreshing(true);

      try {
        const refreshedSession = await refreshSession();

        if (!cancelled) {
          saveAuthSession(refreshedSession);
        }
      } catch {
        if (!cancelled) {
          clearAuthSession();
          router.replace("/login");
        }
      } finally {
        if (!cancelled) {
          setIsRefreshing(false);
        }
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [authState.isAuthenticated, router]);

  useEffect(() => {
    if (isRefreshing || !authState.isAuthenticated) {
      return;
    }

    if (!authState.hasAllowedRole) {
      router.replace("/login");
    }
  }, [
    authState.hasAllowedRole,
    authState.isAuthenticated,
    isRefreshing,
    router,
  ]);

  return {
    isChecking:
      isRefreshing ||
      !authState.isAuthenticated ||
      !authState.hasAllowedRole,
    user: authState.user,
  };
}
