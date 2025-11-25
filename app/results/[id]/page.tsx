'use client';

import { use, useEffect, useState } from 'react';
import { ArrowLeft, Briefcase, GraduationCap, FileText, Target, Award, CheckCircle, X, AlertTriangle, Check } from 'lucide-react';
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
        {
            key: 'skills',
            icon: Target,
            label: 'Skills Recognition',
            description: 'How well your expertise matches what they\'re looking for',
            value: analysis.categoryScores.skills
        },
        {
            key: 'experience',
            icon: Briefcase,
            label: 'Experience Relevance',
            description: 'Your background aligns with the role requirements',
            value: analysis.categoryScores.experience
        },
        {
            key: 'keywords',
            icon: FileText,
            label: 'Language Alignment',
            description: 'You speak the same language as the job posting',
            value: analysis.categoryScores.keywords
        },
        {
            key: 'education',
            icon: GraduationCap,
            label: 'Qualifications Match',
            description: 'Your credentials fit the position requirements',
            value: analysis.categoryScores.education
        },
        {
            key: 'ats',
            icon: CheckCircle,
            label: 'System Compatibility',
            description: 'Your resume passes through automated screening',
            value: analysis.categoryScores.ats
        },
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
                <div className="text-center mb-32">
                    <div className="inline-flex items-center justify-center w-24 h-24 border-2 border-black mb-8">
                        <Award className="w-12 h-12" />
                    </div>
                    <div className="mb-6">
                        <span className="inline-block bg-neutral-100 rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-neutral-500">
                            Analysis Complete
                        </span>
                    </div>
                    <h1 className="text-8xl font-semibold mb-8 tracking-tight tabular-nums">
                        {analysis.overallScore}
                    </h1>
                    <p className="text-2xl font-light text-neutral-600 max-w-2xl mx-auto leading-relaxed">
                        {analysis.overallScore >= 80
                            ? 'Your resume is exceptionally well-suited for this role. You\'re ready to apply with confidence.'
                            : analysis.overallScore >= 60
                                ? 'You\'re on the right track. A few strategic improvements will make your application stand out.'
                                : 'There\'s opportunity here. Follow the recommendations below to strengthen your candidacy.'}
                    </p>
                </div>

                {/* Category Scores - With Icons & Benefits */}
                <div className="mb-32">
                    <div className="text-center mb-16">
                        <span className="inline-block bg-neutral-100 rounded-full px-4 py-1.5 text-xs font-medium tracking-widest uppercase text-neutral-500">
                            What This Means For You
                        </span>
                    </div>
                    <div className="space-y-12">
                        {categories.map((category) => {
                            const Icon = category.icon;
                            return (
                                <div key={category.key} className="border-b border-neutral-100 pb-12 last:border-0">
                                    <div className="flex items-start gap-6 mb-6">
                                        <div className="flex-shrink-0 w-12 h-12 border border-black flex items-center justify-center">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-baseline justify-between mb-2">
                                                <h3 className="text-xl font-medium">{category.label}</h3>
                                                <span className="text-3xl font-semibold tabular-nums">{category.value}</span>
                                            </div>
                                            <p className="text-sm font-light text-neutral-600 leading-relaxed">
                                                {category.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="ml-[72px]">
                                        <div className="h-px bg-neutral-200 relative overflow-hidden">
                                            <div
                                                className="absolute left-0 top-0 h-full bg-black transition-all duration-1000 ease-out"
                                                style={{ width: `${category.value}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Skills Deep Dive */}
                <div className="mb-32 border-y border-neutral-200 py-24">
                    <div className="grid md:grid-cols-2 gap-24">
                        {/* Matched Skills */}
                        <div>
                            <div className="flex items-center gap-4 mb-12">
                                <div className="w-12 h-12 bg-green-100 flex items-center justify-center rounded-full">
                                    <Check className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-medium">Matched Skills</h3>
                                    <p className="text-sm text-neutral-500">You have these required skills</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {analysis.skillsAnalysis.matched.length > 0 ? (
                                    analysis.skillsAnalysis.matched.map((item, index) => (
                                        <span
                                            key={index}
                                            className="px-4 py-2 bg-green-50 border border-green-200 text-green-800 text-sm font-medium rounded-full flex items-center gap-2"
                                        >
                                            <Check className="w-3 h-3" />
                                            {item.skill}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-neutral-400 italic">No direct skill matches found yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Missing Skills */}
                        <div>
                            <div className="flex items-center gap-4 mb-12">
                                <div className="w-12 h-12 bg-red-100 flex items-center justify-center rounded-full">
                                    <X className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-medium">Missing Skills</h3>
                                    <p className="text-sm text-neutral-500">Critical for this role</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {analysis.skillsAnalysis.missing.length > 0 ? (
                                    analysis.skillsAnalysis.missing.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="px-4 py-2 bg-red-50 border border-red-200 text-red-800 text-sm font-medium rounded-full flex items-center gap-2"
                                        >
                                            <X className="w-3 h-3" />
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-neutral-400 italic">Great job! No obvious missing skills.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Your Next Steps - Action-Oriented */}
                <div className="mb-32">
                    <div className="text-center mb-16">
                        <span className="inline-block bg-neutral-100 rounded-full px-4 py-1.5 text-xs font-medium tracking-widest uppercase text-neutral-500">
                            Your Action Plan
                        </span>
                    </div>
                    <div className="space-y-12">
                        {analysis.recommendations.map((rec, index) => {
                            const getPriorityStyles = () => {
                                if (rec.priority === 'high') {
                                    return {
                                        badge: 'bg-red-50 text-red-700 border-red-200',
                                        label: 'High Priority'
                                    };
                                } else if (rec.priority === 'medium') {
                                    return {
                                        badge: 'bg-yellow-50 text-yellow-700 border-yellow-200',
                                        label: 'Medium Priority'
                                    };
                                } else {
                                    return {
                                        badge: 'bg-green-50 text-green-700 border-green-200',
                                        label: 'Consider'
                                    };
                                }
                            };

                            const styles = getPriorityStyles();

                            return (
                                <div key={index} className="pb-12 border-b border-neutral-100 last:border-0">
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <h3 className="text-xl font-medium">{rec.title}</h3>
                                        <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide border ${styles.badge}`}>
                                            {styles.label}
                                        </span>
                                    </div>
                                    <p className="text-base font-light text-neutral-600 leading-relaxed max-w-3xl">
                                        {rec.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Missing Keywords - More Actionable */}
                {analysis.missingKeywords.length > 0 && (
                    <div className="mb-32">
                        <h2 className="text-xs font-medium tracking-widest uppercase text-neutral-500 mb-10">
                            Add These Keywords to Your Resume
                        </h2>
                        <p className="text-sm text-neutral-600 mb-6">
                            These terms appear in the job description but not in your resume. Adding them (where honest) will help you pass automated screenings.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {analysis.missingKeywords.map((keyword, index) => (
                                <span
                                    key={index}
                                    className="px-4 py-2 border border-neutral-300 text-sm font-light hover:border-black hover:bg-black hover:text-white transition-all cursor-pointer"
                                    title="Click to copy"
                                >
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* ATS Compatibility Detail */}
                <div className="mb-32">
                    <div className="text-center mb-16">
                        <span className="inline-block bg-neutral-100 rounded-full px-4 py-1.5 text-xs font-medium tracking-widest uppercase text-neutral-500">
                            ATS Compatibility Report
                        </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-16">
                        {/* Issues Column */}
                        <div className="space-y-8">
                            <h3 className="text-lg font-medium border-b border-neutral-200 pb-4">Attention Needed</h3>

                            {analysis.atsCompatibility.issues.length === 0 && (
                                <div className="p-6 bg-green-50 border border-green-100 rounded-lg flex items-start gap-4">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                    <p className="text-green-800 text-sm">No critical issues found. Your resume is technically sound.</p>
                                </div>
                            )}

                            {analysis.atsCompatibility.issues.map((issue, index) => (
                                <div key={index} className="p-6 bg-red-50 border border-red-100 rounded-lg flex items-start gap-4">
                                    <X className="w-5 h-5 text-red-600 mt-0.5" />
                                    <div>
                                        <p className="text-red-900 font-medium text-sm mb-1">Critical Issue</p>
                                        <p className="text-red-800 text-sm leading-relaxed">{issue}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Passed Checks Column */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium border-b border-neutral-200 pb-4">Passed Checks</h3>
                            <div className="grid gap-3">
                                {analysis.atsCompatibility.passedChecks.map((check, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 hover:bg-neutral-50 transition-colors rounded-lg">
                                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-green-600" />
                                        </div>
                                        <span className="text-sm text-neutral-600">{check}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center pt-16">
                    <Link
                        href="/"
                        className="inline-block px-16 py-5 border-2 border-black text-sm font-medium uppercase tracking-wider hover:bg-black hover:text-white transition-all duration-200"
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
