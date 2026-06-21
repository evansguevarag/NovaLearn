"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { clearAuthSession } from "@/lib/auth-storage";

export function LogoutButton() {
    const router = useRouter();

    function handleLogout() {
        clearAuthSession();
        router.replace("/login");
    }

    return (
        <Button
        variant="outline"
        className="w-full justify-start"
        onClick={handleLogout}
        >
        <LogOut className="mr-2 h-4 w-4" />
        Cerrar sesión
        </Button>
    );
}