import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
            <body className={inter.className}>
                <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
                    {children}
                </div>
            </body>
        </html>
    );
}
