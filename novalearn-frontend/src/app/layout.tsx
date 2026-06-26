import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    });

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
        <body className={inter.className}>
            {children}
            <Toaster position="top-right" richColors />
        </body>
        </html>
    );
}