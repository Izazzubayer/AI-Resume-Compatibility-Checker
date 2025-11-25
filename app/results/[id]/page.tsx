'use client';

import { use, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import type { AnalysisResult } from '@/types/analysis';
import { getScoreInterpretation } from '@/lib/ai/scorer';

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load analysis from localStorage
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="p-8 text-center">
                    <p className="text-lg mb-4">Analysis not found</p>
                    <Link href="/">
                        <Button>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Home
                        </Button>
                    </Link>
                </Card>
            </div>
        );
    }

    const interpretation = getScoreInterpretation(analysis.overallScore);

    return (
        <main className="min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/">
                        <Button variant="ghost" className="mb-4">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Home
                        </Button>
                    </Link>
                    <h1 className="text-4xl font-bold mb-2">Resume Analysis Results</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Completed on {new Date(analysis.createdAt).toLocaleDateString()}
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Overall Score Card */}
                    <Card className="lg:col-span-3 shadow-xl border-0 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                        <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="text-center md:text-left">
                                    <h2 className="text-2xl font-bold mb-2">Overall Compatibility</h2>
                                    <p className="text-lg text-gray-600 dark:text-gray-300">
                                        {interpretation.message}
                                    </p>
                                </div>
                                <div className="relative">
                                    <div className="w-40 h-40 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                                {analysis.overallScore}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">out of 100</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Category Scores */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Category Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {Object.entries(analysis.categoryScores).map(([category, score]) => (
                                <div key={category}>
                                    <div className="flex justify-between mb-2">
                                        <span className="font-medium capitalize">{category} Match</span>
                                        <span className="font-bold text-purple-600 dark:text-purple-400">{score}%</span>
                                    </div>
                                    <Progress value={score} className="h-3" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Skills Matched</span>
                                <span className="font-bold text-green-600">
                                    {analysis.skillsAnalysis.matched.length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Skills Missing</span>
                                <span className="font-bold text-orange-600">
                                    {analysis.skillsAnalysis.missing.length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">ATS Score</span>
                                <span className="font-bold text-blue-600">
                                    {analysis.atsCompatibility.score}%
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Recommendations</span>
                                <span className="font-bold text-purple-600">
                                    {analysis.recommendations.length}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Strengths */}
                    {analysis.strengths.length > 0 && (
                        <Card className="lg:col-span-3">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-600">
                                    <CheckCircle2 className="w-5 h-5" />
                                    Strengths
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {analysis.strengths.map((strength, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>{strength}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {/* Weaknesses */}
                    {analysis.weaknesses.length > 0 && (
                        <Card className="lg:col-span-3">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-orange-600">
                                    <AlertCircle className="w-5 h-5" />
                                    Areas for Improvement
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {analysis.weaknesses.map((weakness, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                            <span>{weakness}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {/* Missing Keywords */}
                    {analysis.missingKeywords.length > 0 && (
                        <Card className="lg:col-span-3">
                            <CardHeader>
                                <CardTitle>Missing Keywords</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.missingKeywords.map((keyword, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm"
                                        >
                                            {keyword}
                                        </span>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Recommendations */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Recommendations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {analysis.recommendations.map((rec, index) => (
                                    <div
                                        key={index}
                                        className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-1 px-2 py-1 rounded text-xs font-medium ${rec.priority === 'high'
                                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                                    : rec.priority === 'medium'
                                                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                }`}>
                                                {rec.priority}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold mb-1">{rec.title}</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {rec.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* ATS Compatibility */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>ATS Compatibility</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-600">
                                        <CheckCircle2 className="w-5 h-5" />
                                        Passed Checks
                                    </h4>
                                    <ul className="space-y-2">
                                        {analysis.atsCompatibility.passedChecks.map((check, index) => (
                                            <li key={index} className="text-sm flex items-start gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                {check}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                {analysis.atsCompatibility.issues.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-600">
                                            <XCircle className="w-5 h-5" />
                                            Issues Found
                                        </h4>
                                        <ul className="space-y-2">
                                            {analysis.atsCompatibility.issues.map((issue, index) => (
                                                <li key={index} className="text-sm flex items-start gap-2">
                                                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                                    {issue}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="lg:col-span-3 flex gap-4 justify-center">
                        <Link href="/">
                            <Button variant="outline" size="lg">
                                Analyze Another Resume
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
