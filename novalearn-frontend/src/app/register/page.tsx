import { GraduationCap } from "lucide-react";

import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
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
              Crea tu cuenta y empieza a aprender.
            </h1>

            <p className="max-w-lg text-base text-muted-foreground md:text-lg">
              Tu registro se creará como estudiante para que puedas explorar el
              catálogo y matricularte en cursos.
            </p>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <RegisterForm />
        </div>
      </section>
    </main>
  );
}
