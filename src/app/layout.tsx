import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "AI Racing Bets | Simulatore di Corse AI",
    description: "Simulatore di corse gestito da AI con scommesse in crediti virtuali",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="it">
            <body className="antialiased selection:bg-cyan-500 selection:text-black">
                {children}
            </body>
        </html>
    );
}
