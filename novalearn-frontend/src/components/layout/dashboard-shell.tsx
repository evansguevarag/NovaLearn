import { Sidebar } from "@/components/layout/sidebar";

interface DashboardShellProps {
    title: string;
    description: string;
    actions?: React.ReactNode;
    children: React.ReactNode;
    }

    export function DashboardShell({
    title,
    description,
    actions,
    children,
    }: DashboardShellProps) {
    return (
        <div className="flex min-h-screen bg-muted/20">
        <Sidebar />

        <main className="flex-1 overflow-x-hidden">
            <section className="px-8 py-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    {title}
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                </p>
                </div>

                {actions && (
                <div className="shrink-0">
                    {actions}
                </div>
                )}
            </div>

            {children}
            </section>
        </main>
        </div>
    );
}