import type { Metadata, Viewport } from "next";
import { Inter, Ubuntu, JetBrains_Mono, Outfit } from "next/font/google";
import { RouteProvider } from "@/providers/router-provider";
import { Theme } from "@/providers/theme";
import { AuthProvider } from "@/providers/auth-provider";
import { ScrollProvider } from "@/providers/scroll-provider";
import "@/styles/globals.css";
import { cx } from "@/utils/cx";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
});

const ubuntu = Ubuntu({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
    display: "swap",
    variable: "--font-ubuntu",
});

const outfit = Outfit({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
    display: "swap",
    variable: "--font-outfit",
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
    title: "de_study.ai — Premium AI STEM Tutor & Study Workspace",
    description:
        "An AI-powered premium teaching platform and STEM study calendar workspace. Animated explanations, visual math diagrams, and precise flashcards.",
    keywords: ["AI tutor", "study calendar", "physics", "math", "learning", "education", "flashcards"],
    openGraph: {
        title: "de_study.ai",
        description: "An uncompromising study calendar and spaced repetition ecosystem.",
        type: "website",
    },
};

export const viewport: Viewport = {
    themeColor: "#FEFCF8",
    colorScheme: "light",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={cx(
                    inter.variable,
                    ubuntu.variable,
                    outfit.variable,
                    jetbrainsMono.variable,
                    "bg-primary antialiased"
                )}
            >
                <RouteProvider>
                    <Theme>
                        <AuthProvider>
                            <ScrollProvider>{children}</ScrollProvider>
                        </AuthProvider>
                    </Theme>
                </RouteProvider>
            </body>
        </html>
    );
}
