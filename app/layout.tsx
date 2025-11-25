import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
    weight: ['300', '400', '500', '600'],
    subsets: ["latin"],
    variable: '--font-ibm-plex-mono',
});

export const metadata: Metadata = {
    title: "AI Resume Compatibility Checker - Optimize Your Resume for ATS",
    description: "Analyze your resume against job descriptions using AI. Get detailed compatibility scores, keyword analysis, and actionable recommendations to improve your job application success.",
    keywords: ["resume checker", "ATS optimization", "job application", "AI resume analysis", "career tools"],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={ibmPlexMono.className}>
                {children}
            </body>
        </html>
    );
}
