'use client';

import { use, useEffect, useState } from 'react';
import { ArrowLeft, Circle } from 'lucide-react';
import Link from 'next/link';
import type { AnalysisResult } from '@/types/analysis';

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('latestAnalysis');
        if (stored) {
            const data = JSON.parse(stored);
            if (data.id === resolvedParams.id) {
                setAnalysis(data);
            }
        }
        setLoading(false);
    }, [resolvedParams.id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
                <h2 className="text-2xl font-medium mb-4">Analysis Not Found</h2>
                <Link
                    href="/"
                    className="text-sm hover:opacity-60 transition-opacity flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Return Home
                </Link>
            </div>
        );
    }

    const categories = [
        { key: 'skills', label: 'Skills Match', value: analysis.categoryScores.skills },
        { key: 'experience', label: 'Experience', value: analysis.categoryScores.experience },
        { key: 'keywords', label: 'Keywords', value: analysis.categoryScores.keywords },
        { key: 'education', label: 'Education', value: analysis.categoryScores.education },
        { key: 'ats', label: 'ATS Score', value: analysis.categoryScores.ats },
    ];

    return (
        <main className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="px-8 py-6 border-b border-neutral-200">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm hover:opacity-60 transition-opacity"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                </Link>
            </nav>

            {/* Hero Section */}
            <div className="max-w-5xl mx-auto px-8 py-24">
                <div className="text-center mb-24">
                    <p className="text-sm text-neutral-500 mb-4 tracking-wide uppercase">Analysis Complete</p>
                    <h1 className="text-7xl font-semibold mb-6 tracking-tight">
                        {analysis.overallScore}
                    </h1>
                    <p className="text-xl text-neutral-600 font-light">
                        {analysis.overallScore >= 80
                            ? 'Excellent match. Your resume aligns strongly with this position.'
                            : analysis.overallScore >= 60
                                ? 'Good match. A few improvements will strengthen your application.'
                                : 'Room for improvement. Review recommendations below.'}
                    </p>
                </div>

                {/* Category Scores - Minimalist */}
                <div className="mb-32">
                    <h2 className="text-sm font-medium tracking-wide uppercase text-neutral-500 mb-12">
                        Category Breakdown
                    </h2>
                    <div className="space-y-8">
                        {categories.map((category) => (
                            <div key={category.key} className="group">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-lg font-light">{category.label}</span>
                                    <span className="text-2xl font-semibold tabular-nums">{category.value}</span>
                                </div>
                                <div className="h-px bg-neutral-200 relative overflow-hidden">
                                    <div
                                        className="absolute left-0 top-0 h-full bg-black transition-all duration-1000 ease-out"
                                        style={{ width: `${category.value}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-32 py-16 border-y border-neutral-200">
                    <div>
                        <div className="text-4xl font-semibold mb-2 tabular-nums">
                            {analysis.skillsAnalysis.matched.length}
                        </div>
                        <div className="text-sm text-neutral-500">Skills Matched</div>
                    </div>
                    <div>
                        <div className="text-4xl font-semibold mb-2 tabular-nums">
                            {analysis.skillsAnalysis.missing.length}
                        </div>
                        <div className="text-sm text-neutral-500">Skills Missing</div>
                    </div>
                    <div>
                        <div className="text-4xl font-semibold mb-2 tabular-nums">
                            {analysis.atsCompatibility.score}
                        </div>
                        <div className="text-sm text-neutral-500">ATS Score</div>
                    </div>
                    <div>
                        <div className="text-4xl font-semibold mb-2 tabular-nums">
                            {analysis.recommendations.length}
                        </div>
                        <div className="text-sm text-neutral-500">Recommendations</div>
                    </div>
                </div>

                {/* Strengths */}
                {analysis.strengths.length > 0 && (
                    <div className="mb-32">
                        <h2 className="text-sm font-medium tracking-wide uppercase text-neutral-500 mb-8">
                            What's Working
                        </h2>
                        <div className="space-y-6">
                            {analysis.strengths.map((strength, index) => (
                                <div key={index} className="flex items-start gap-4 pb-6 border-b border-neutral-100 last:border-0">
                                    <Circle className="w-1.5 h-1.5 mt-2.5 fill-black" />
                                    <p className="text-lg font-light flex-1">{strength}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Areas for Improvement */}
                {analysis.weaknesses.length > 0 && (
                    <div className="mb-32">
                        <h2 className="text-sm font-medium tracking-wide uppercase text-neutral-500 mb-8">
                            Areas for Improvement
                        </h2>
                        <div className="space-y-6">
                            {analysis.weaknesses.map((weakness, index) => (
                                <div key={index} className="flex items-start gap-4 pb-6 border-b border-neutral-100 last:border-0">
                                    <Circle className="w-1.5 h-1.5 mt-2.5 fill-black" />
                                    <p className="text-lg font-light flex-1">{weakness}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Missing Keywords */}
                {analysis.missingKeywords.length > 0 && (
                    <div className="mb-32">
                        <h2 className="text-sm font-medium tracking-wide uppercase text-neutral-500 mb-8">
                            Missing Keywords
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {analysis.missingKeywords.map((keyword, index) => (
                                <span
                                    key={index}
                                    className="px-4 py-2 border border-neutral-300 text-sm font-light hover:bg-neutral-50 transition-colors"
                                >
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recommendations */}
                <div className="mb-32">
                    <h2 className="text-sm font-medium tracking-wide uppercase text-neutral-500 mb-12">
                        Recommendations
                    </h2>
                    <div className="space-y-12">
                        {analysis.recommendations.map((rec, index) => (
                            <div key={index} className="pb-12 border-b border-neutral-100 last:border-0">
                                <div className="flex items-baseline gap-4 mb-4">
                                    <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                                        {rec.priority === 'high' ? 'High Priority' : rec.priority === 'medium' ? 'Medium' : 'Low'}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-light mb-3">{rec.title}</h3>
                                <p className="text-base text-neutral-600 font-light leading-relaxed">
                                    {rec.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ATS Compatibility */}
                <div className="mb-32">
                    <h2 className="text-sm font-medium tracking-wide uppercase text-neutral-500 mb-12">
                        ATS Compatibility
                    </h2>
                    <div className="grid md:grid-cols-2 gap-16">
                        <div>
                            <h3 className="text-base font-medium mb-6">Passed Checks</h3>
                            <div className="space-y-3">
                                {analysis.atsCompatibility.passedChecks.map((check, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <Circle className="w-1.5 h-1.5 mt-2 fill-black flex-shrink-0" />
                                        <span className="text-sm font-light">{check}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {analysis.atsCompatibility.issues.length > 0 && (
                            <div>
                                <h3 className="text-base font-medium mb-6">Issues Found</h3>
                                <div className="space-y-3">
                                    {analysis.atsCompatibility.issues.map((issue, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <Circle className="w-1.5 h-1.5 mt-2 fill-black flex-shrink-0" />
                                            <span className="text-sm font-light">{issue}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center pt-16">
                    <Link
                        href="/"
                        className="inline-block px-12 py-4 border border-black text-sm font-medium hover:bg-black hover:text-white transition-all duration-200"
                    >
                        Analyze Another Resume
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-neutral-200 py-8 text-center">
                <p className="text-xs text-neutral-400">
                    Analysis completed on {new Date(analysis.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </p>
            </footer>
        </main>
    );
}
