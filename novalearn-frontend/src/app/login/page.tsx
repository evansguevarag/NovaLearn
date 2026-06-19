import { GraduationCap } from "lucide-react";

import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
    return (
        <main className="min-h-screen bg-muted/30">
        <section className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 py-10 lg:grid-cols-2">
            <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm font-medium shadow-sm">
                <GraduationCap className="h-4 w-4" />
                NovaLearn LMS
            </div>

            <div className="space-y-4">
                <h1 className="max-w-xl text-4xl font-bold tracking-tight md:text-5xl">
                Aprende, enseña y gestiona cursos desde una sola plataforma.
                </h1>

                <p className="max-w-lg text-base text-muted-foreground md:text-lg">
                Plataforma educativa conectada a Spring Boot, JWT, PostgreSQL,
                Cloudinary y Resend.
                </p>
            </div>

            <div className="grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border bg-background p-4 shadow-sm">
                <p className="text-2xl font-bold">JWT</p>
                <p className="text-sm text-muted-foreground">Seguridad real</p>
                </div>

                <div className="rounded-xl border bg-background p-4 shadow-sm">
                <p className="text-2xl font-bold">LMS</p>
                <p className="text-sm text-muted-foreground">Cursos y progreso</p>
                </div>

                <div className="rounded-xl border bg-background p-4 shadow-sm">
                <p className="text-2xl font-bold">API</p>
                <p className="text-sm text-muted-foreground">Spring Boot</p>
                </div>
            </div>
            </div>

            <div className="flex justify-center lg:justify-end">
            <LoginForm />
            </div>
        </section>
        </main>
    );
}