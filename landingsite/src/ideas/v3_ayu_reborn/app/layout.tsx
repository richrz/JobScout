import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "JobScout Zero",
    description: "The Architecture of Ambition.",
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
