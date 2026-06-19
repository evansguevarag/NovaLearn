import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "NovaLearn",
    description: "Plataforma LMS con Next.js y Spring Boot",
    };

    export default function RootLayout({
    children,
    }: Readonly<{
    children: React.ReactNode;
    }>) {
    return (
        <html lang="es">
        <body>{children}</body>
        </html>
    );
}