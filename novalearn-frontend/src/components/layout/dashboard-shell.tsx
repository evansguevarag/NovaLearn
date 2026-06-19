import { GraduationCap } from "lucide-react";

import { LogoutButton } from "@/components/shared/logout-button";

interface DashboardShellProps {
    title: string;
    description: string;
    children: React.ReactNode;
    }

    export function DashboardShell({
    title,
    description,
    children,
    }: DashboardShellProps) {
    return (
        <main className="min-h-screen bg-muted/30">
        <header className="border-b bg-background">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
            <div className="flex items-center gap-2 font-semibold">
                <GraduationCap className="h-5 w-5" />
                NovaLearn
            </div>

            <LogoutButton />
            </div>
        </header>

        <section className="mx-auto max-w-7xl px-6 py-8">
            <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 text-muted-foreground">{description}</p>
            </div>

            {children}
        </section>
        </main>
    );
}