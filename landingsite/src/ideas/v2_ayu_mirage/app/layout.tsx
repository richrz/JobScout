import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "JobScout - Architect Your Future",
    description: "Advanced AI Career Architecture",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
