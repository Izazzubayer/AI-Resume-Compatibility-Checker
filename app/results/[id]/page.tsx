'use client';

import { use, useEffect, useState } from 'react';
import { 
    LeftOutlined, 
    CheckOutlined,
    CloseOutlined,
    RightOutlined,
    TrophyOutlined,
    RocketOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import type { AnalysisResult } from '@/types/analysis';
import {
    calculateApplicationReadiness,
    generatePriorityActions,
    calculateMatchStrength,
    calculateResumeHealth,
    analyzeSkillGaps,
    analyzeKeywordDensity,
    determineCompetitivePosition
} from '@/lib/utils/analysis-insights';

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
                <div className="w-2 h-2 bg-black animate-pulse" />
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
                <h2 className="text-[32px] font-semibold mb-6 tracking-[-0.02em]">Analysis Not Found</h2>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-[13px] hover:opacity-60 transition-opacity tracking-[-0.01em]"
                >
                    <LeftOutlined style={{ fontSize: '12px' }} />
                    Return Home
                </Link>
            </div>
        );
    }

    const meta = analysis.meta || {
        similarityUsed: false,
        similarityNote: 'Similarity data unavailable.',
        skillConfidenceSource: 'heuristic',
    };

    // Check if we have any real AI data to show
    const hasAIData = meta.similarityUsed || meta.skillConfidenceSource === 'huggingface' || analysis.categorizedKeywords;
    
    if (!hasAIData) {
    return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
                <h2 className="text-[32px] font-semibold mb-6 tracking-[-0.02em] text-center">
                    AI Analysis Unavailable
                </h2>
                <p className="text-[15px] text-neutral-600 mb-8 text-center max-w-md leading-[1.6] tracking-[-0.01em]">
                    This analysis was performed without AI models. Add your Hugging Face API key to enable deep learning insights.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-8 py-4 border border-black text-[13px] font-medium tracking-[-0.01em] hover:bg-black hover:text-white transition-all"
                >
                    <LeftOutlined style={{ fontSize: '12px' }} />
                    Return Home
                </Link>
            </div>
        );
    }

    // Calculate all insights
    const readiness = calculateApplicationReadiness(analysis);
    const priorityActions = generatePriorityActions(analysis);
    const matchStrength = calculateMatchStrength(analysis);
    const resumeHealth = calculateResumeHealth(analysis);
    const skillGap = analyzeSkillGaps(analysis);
    const keywordDensity = analyzeKeywordDensity(analysis);
    const competitive = determineCompetitivePosition(analysis);

    const getReadinessColor = () => {
        if (readiness.color === 'green') return { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-700', badge: 'bg-green-500' };
        if (readiness.color === 'amber') return { bg: 'bg-amber-50', border: 'border-amber-500', text: 'text-amber-700', badge: 'bg-amber-500' };
        return { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-700', badge: 'bg-red-500' };
    };

    const readinessColors = getReadinessColor();

    return (
        <main className="min-h-screen bg-white">
            {/* Top Navigation */}
            <div className="border-b border-neutral-100">
                <div className="max-w-7xl mx-auto px-8 sm:px-12 py-5 flex justify-between items-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-[11px] tracking-[0.08em] uppercase text-neutral-400 hover:text-black transition-colors font-medium"
                    >
                        <LeftOutlined style={{ fontSize: '10px' }} />
                        <span>Back</span>
                    </Link>
                    <div className="text-[11px] tracking-[0.08em] uppercase text-neutral-400 font-medium">
                        AI Analysis Results
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="border-b border-neutral-100">
                <div className="max-w-6xl mx-auto px-8 sm:px-12 py-24">
                    {/* Semantic Score */}
                    {meta.similarityUsed && analysis.meta.similarityScore !== null && (
                        <div className="text-center mb-16">
                    <div className="mb-6">
                                <span className="text-[11px] tracking-[0.08em] uppercase text-neutral-400 font-medium">
                                    AI Semantic Match
                        </span>
                    </div>
                            <h1 className="text-[160px] sm:text-[200px] font-semibold tracking-[-0.04em] leading-none mb-4">
                                {Math.round(analysis.meta.similarityScore || 0)}
                    </h1>
                            <p className="text-[17px] text-neutral-600 leading-[1.6] tracking-[-0.01em]">
                                Deep learning semantic similarity score
                            </p>
                        </div>
                    )}

                    {/* Quick Stats Dashboard */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-16">
                        <div className="border border-neutral-200 p-6 text-center">
                            <div className="text-[40px] font-semibold tracking-tight mb-2">
                                {analysis.overallScore}
                            </div>
                            <div className="text-[11px] tracking-[0.08em] uppercase text-neutral-400 font-medium mb-1">
                                Overall
                            </div>
                            <div className="text-[10px] tracking-[-0.01em] text-neutral-500">
                                {competitive.percentile}
                            </div>
                        </div>

                        <div className="border border-neutral-200 p-6 text-center">
                            <div className="text-[40px] font-semibold tracking-tight mb-2">
                                {analysis.categoryScores.skills}
                            </div>
                            <div className="text-[11px] tracking-[0.08em] uppercase text-neutral-400 font-medium mb-1">
                                Skills
                            </div>
                            <div className="text-[10px] tracking-[-0.01em] text-neutral-500">
                                {matchStrength[0]?.label || 'N/A'}
                            </div>
                        </div>

                        <div className="border border-neutral-200 p-6 text-center">
                            <div className="text-[40px] font-semibold tracking-tight mb-2">
                                {analysis.requirementCoverage ? 
                                    `${analysis.requirementCoverage.filter(r => r.coverage === 'fully covered').length}/${analysis.requirementCoverage.length}` 
                                    : '0'}
                            </div>
                            <div className="text-[11px] tracking-[0.08em] uppercase text-neutral-400 font-medium mb-1">
                                Requirements
                            </div>
                            <div className="text-[10px] tracking-[-0.01em] text-neutral-500">
                                Met
                            </div>
                        </div>

                        <div className="border border-neutral-200 p-6 text-center">
                            <div className="text-[40px] font-semibold tracking-tight mb-2">
                                {keywordDensity.matchRate}%
                            </div>
                            <div className="text-[11px] tracking-[0.08em] uppercase text-neutral-400 font-medium mb-1">
                                Keywords
                            </div>
                            <div className="text-[10px] tracking-[-0.01em] text-neutral-500">
                                {keywordDensity.coverage}
                            </div>
                        </div>

                        <div className="border border-neutral-200 p-6 text-center">
                            <div className="text-[40px] font-semibold tracking-tight mb-2">
                                {resumeHealth.grade}
                            </div>
                            <div className="text-[11px] tracking-[0.08em] uppercase text-neutral-400 font-medium mb-1">
                                ATS Health
                            </div>
                            <div className="text-[10px] tracking-[-0.01em] text-neutral-500">
                                {analysis.categoryScores.ats}%
                            </div>
                        </div>
                    </div>

                    {/* Application Readiness */}
                    <div className={`border-2 ${readinessColors.border} ${readinessColors.bg} p-12`}>
                        <div className="text-center">
                            <div className={`inline-block w-3 h-3 ${readinessColors.badge} mb-6`} />
                            <h2 className={`text-[32px] font-semibold mb-4 tracking-[-0.02em] ${readinessColors.text}`}>
                                {readiness.status}
                            </h2>
                            <p className="text-[17px] leading-[1.6] tracking-[-0.01em] mb-8 max-w-2xl mx-auto text-neutral-700">
                                {readiness.message}
                            </p>
                            <div className="flex items-center justify-center gap-4">
                                <button 
                                    onClick={() => {
                                        const prioritySection = document.getElementById('priority-actions');
                                        if (prioritySection) {
                                            prioritySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }
                                    }}
                                    className="px-8 py-4 bg-black text-white text-[13px] font-medium tracking-[-0.01em] hover:bg-neutral-800 transition-colors flex items-center gap-2"
                                >
                                    {readiness.actionLabel}
                                    <RightOutlined style={{ fontSize: '12px' }} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-8 sm:px-12 py-24">
                {/* Top Priority Actions */}
                {priorityActions.length > 0 && (
                    <div id="priority-actions" className="mb-32 scroll-mt-8">
                        <div className="mb-12">
                            <h2 className="text-[32px] font-semibold mb-3 tracking-[-0.02em]">
                                Priority Actions
                            </h2>
                            <p className="text-[15px] text-neutral-600 tracking-[-0.01em] leading-[1.6]">
                                Make these changes for maximum impact on your match score
                            </p>
                </div>

                        <div className="space-y-4">
                            {priorityActions.map((action, index) => (
                                <div key={index} className="border border-neutral-200 p-8 hover:border-black transition-colors">
                                    <div className="flex items-start gap-6">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 border-2 border-black flex items-center justify-center text-[20px] font-semibold">
                                                {index + 1}
                    </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <h3 className="text-[17px] font-semibold tracking-[-0.01em]">
                                                    {action.action}
                                                </h3>
                                                <div className="flex items-center gap-3 flex-shrink-0">
                                                    <span className={`px-3 py-1 text-[10px] font-medium tracking-[0.08em] uppercase ${
                                                        action.impact === 'HIGH' ? 'bg-red-100 text-red-700' :
                                                        action.impact === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-neutral-100 text-neutral-600'
                                                    }`}>
                                                        {action.impact} IMPACT
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-[13px] text-neutral-600 tracking-[-0.01em] leading-[1.6] mb-2">
                                                {action.reason}
                                            </p>
                                            <p className="text-[13px] text-green-600 font-medium tracking-[-0.01em]">
                                                Could increase your score by {action.estimatedImprovement} points
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Match Strength Visualization */}
                <div className="mb-32">
                    <div className="mb-12">
                        <h2 className="text-[32px] font-semibold mb-3 tracking-[-0.02em]">
                            Match Strength
                        </h2>
                        <p className="text-[15px] text-neutral-600 tracking-[-0.01em] leading-[1.6]">
                            Visual breakdown of how you match across key dimensions
                        </p>
                                        </div>

                    <div className="space-y-6">
                        {matchStrength.map((dimension, idx) => (
                            <div key={idx} className="border border-neutral-200 p-6">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[15px] font-medium tracking-[-0.01em]">{dimension.name}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] tracking-[0.08em] uppercase text-neutral-500 font-medium">
                                            {dimension.label}
                                        </span>
                                        <span className="text-[20px] font-semibold tabular-nums">{dimension.score}%</span>
                                    </div>
                                </div>
                                <p className="text-[13px] text-neutral-600 leading-[1.6] tracking-[-0.01em] mb-4">
                                    {dimension.description}
                                </p>
                                <div className="h-2 bg-neutral-100 relative">
                                    <div 
                                        className="absolute left-0 top-0 h-full bg-black transition-all duration-1000"
                                        style={{ width: `${dimension.score}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Skill Gap Visualization */}
                {skillGap.jobNeeds.length > 0 && (
                    <div className="mb-32">
                        <div className="mb-12">
                            <h2 className="text-[32px] font-semibold mb-3 tracking-[-0.02em]">
                                Skill Gap Analysis
                            </h2>
                            <p className="text-[15px] text-neutral-600 tracking-[-0.01em] leading-[1.6]">
                                Side-by-side comparison of your skills vs job requirements
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-8">
                            {/* You Have */}
                            <div className="border border-neutral-200">
                                <div className="p-6 border-b border-neutral-200 bg-neutral-50">
                                    <h3 className="text-[15px] font-semibold tracking-[-0.01em] flex items-center gap-2">
                                        <CheckOutlined style={{ fontSize: '14px' }} />
                                        You Have
                                    </h3>
                                </div>
                                <div className="p-6 space-y-3">
                                    {skillGap.youHave.map((skill, idx) => (
                                        <div key={idx} className="flex items-center justify-between">
                                            <span className="text-[13px] tracking-[-0.01em]">{skill.skill}</span>
                                            {skill.confidence && (
                                                <span className="text-[11px] text-neutral-500 font-mono">
                                                    {Math.round(skill.confidence * 100)}%
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Job Needs */}
                            <div className="border border-neutral-200">
                                <div className="p-6 border-b border-neutral-200 bg-neutral-50">
                                    <h3 className="text-[15px] font-semibold tracking-[-0.01em]">
                                        Job Requirements
                                    </h3>
                                </div>
                                <div className="p-6 space-y-3">
                                    {skillGap.jobNeeds.map((skill, idx) => (
                                        <div key={idx} className="flex items-center justify-between">
                                            <span className="text-[13px] tracking-[-0.01em]">{skill.skill}</span>
                                            {skill.found ? (
                                                <CheckOutlined style={{ fontSize: '14px', color: '#16a34a' }} />
                                            ) : (
                                                <CloseOutlined style={{ fontSize: '14px', color: '#dc2626' }} />
                                )}
                            </div>
                                    ))}
                                </div>
                                <div className="p-6 border-t border-neutral-200 bg-neutral-50">
                                    <div className="text-[13px] tracking-[-0.01em]">
                                        <span className="font-semibold">{skillGap.matchCount} of {skillGap.totalNeeded}</span> skills matched ({skillGap.matchPercentage}%)
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* AI Skills with Confidence */}
                {meta.skillConfidenceSource === 'huggingface' && analysis.skillsAnalysis.matched.some(item => item.confidence !== undefined) && (
                    <div className="mb-32">
                        <div className="mb-12">
                            <h2 className="text-[32px] font-semibold mb-3 tracking-[-0.02em]">
                                AI Skill Detection
                            </h2>
                            <p className="text-[15px] text-neutral-600 tracking-[-0.01em] leading-[1.6]">
                                Zero-shot classification confidence for each detected skill
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            {analysis.skillsAnalysis.matched
                                .filter(item => item.confidence !== undefined)
                                .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
                                .map((item, index) => (
                                    <div key={index} className="border border-neutral-200 p-6 hover:border-black transition-colors">
                                        <div className="flex items-baseline justify-between mb-3">
                                            <h3 className="text-[17px] font-semibold tracking-[-0.01em]">
                                                {item.skill}
                                            </h3>
                                            <span className="text-[32px] font-semibold tabular-nums tracking-tight">
                                                {Math.round((item.confidence || 0) * 100)}
                                            </span>
                                        </div>
                                        <div className="h-1 bg-neutral-100 relative">
                                            <div
                                                className="absolute left-0 top-0 h-full bg-black transition-all duration-1000"
                                                style={{ width: `${(item.confidence || 0) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                        </div>

                        {analysis.skillsAnalysis.missing.length > 0 && (
                            <div className="mt-8 pt-8 border-t border-neutral-100">
                                <p className="text-[13px] font-semibold mb-4 tracking-[-0.01em]">
                                    Skills not detected in your resume:
                                </p>
                            <div className="flex flex-wrap gap-3">
                                    {analysis.skillsAnalysis.missing.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="px-4 py-2 border border-neutral-300 text-[13px] tracking-[-0.01em] hover:border-black transition-colors"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Per-Requirement Coverage */}
                {analysis.requirementCoverage && analysis.requirementCoverage.length > 0 && (
                    <div className="mb-32">
                        <div className="mb-12">
                            <h2 className="text-[32px] font-semibold mb-3 tracking-[-0.02em]">
                                Requirement Analysis
                            </h2>
                            <p className="text-[15px] text-neutral-600 tracking-[-0.01em] leading-[1.6]">
                                AI evaluation of how well you match each specific requirement
                            </p>
                </div>

                        <div className="space-y-4">
                            {analysis.requirementCoverage.map((item, index) => {
                                const getCoverageStyle = () => {
                                    if (item.coverage === 'fully covered') {
                                    return {
                                            bg: 'bg-green-50',
                                            border: 'border-green-200',
                                            text: 'text-green-800',
                                            badge: 'bg-green-100 text-green-700'
                                        };
                                    } else if (item.coverage === 'partially covered') {
                                    return {
                                            bg: 'bg-amber-50',
                                            border: 'border-amber-200',
                                            text: 'text-amber-800',
                                            badge: 'bg-amber-100 text-amber-700'
                                    };
                                } else {
                                    return {
                                            bg: 'bg-red-50',
                                            border: 'border-red-200',
                                            text: 'text-red-800',
                                            badge: 'bg-red-100 text-red-700'
                                    };
                                }
                            };

                                const styles = getCoverageStyle();

                            return (
                                    <div
                                        key={index}
                                        className={`border ${styles.border} ${styles.bg} p-6 hover:border-black transition-colors`}
                                    >
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <p className={`text-[15px] ${styles.text} tracking-[-0.01em] leading-[1.6] flex-1`}>
                                                {item.requirement}
                                            </p>
                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                <span className={`px-3 py-1 ${styles.badge} text-[10px] font-medium tracking-[0.08em] uppercase`}>
                                                    {item.coverage}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1 bg-neutral-200 relative">
                                                <div
                                                    className="absolute left-0 top-0 h-full bg-black"
                                                    style={{ width: `${item.confidence * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-[11px] text-neutral-500 font-mono">
                                                {Math.round(item.confidence * 100)}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                )}

                {/* Keyword Categorization */}
                {analysis.categorizedKeywords && (
                    <div className="mb-32">
                        <div className="mb-12">
                            <h2 className="text-[32px] font-semibold mb-3 tracking-[-0.02em]">
                                Keyword Analysis
                        </h2>
                            <p className="text-[15px] text-neutral-600 tracking-[-0.01em] leading-[1.6]">
                                AI-categorized keywords with {keywordDensity.matchRate}% coverage ({keywordDensity.coverage})
                            </p>
                        </div>

                        {/* Technical Skills */}
                        {(analysis.categorizedKeywords.technicalSkills.matched.length > 0 || 
                          analysis.categorizedKeywords.technicalSkills.missing.length > 0) && (
                            <div className="mb-12">
                                <div className="flex items-center gap-3 mb-6">
                                    <h3 className="text-[19px] font-semibold tracking-[-0.01em]">
                                        Technical Skills
                                    </h3>
                                    <span className="px-2 py-1 bg-black text-white text-[10px] font-medium tracking-[0.08em] uppercase">
                                        Critical
                                    </span>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="border border-neutral-200 p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <CheckOutlined style={{ fontSize: '16px' }} />
                                            <p className="text-[13px] font-semibold tracking-[-0.01em]">
                                                In Your Resume
                                            </p>
                                        </div>
                                        {analysis.categorizedKeywords.technicalSkills.matched.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {analysis.categorizedKeywords.technicalSkills.matched.map((keyword, idx) => (
                                                    <span key={idx} className="text-[13px] tracking-[-0.01em]">
                                                        {keyword}{idx < analysis.categorizedKeywords!.technicalSkills.matched.length - 1 ? ',' : ''}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-[13px] text-neutral-400 italic">None detected</p>
                                        )}
                                    </div>

                                    <div className="border border-neutral-200 p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <CloseOutlined style={{ fontSize: '16px' }} />
                                            <p className="text-[13px] font-semibold tracking-[-0.01em]">
                                                Missing
                                            </p>
                                        </div>
                                        {analysis.categorizedKeywords.technicalSkills.missing.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {analysis.categorizedKeywords.technicalSkills.missing.map((keyword, idx) => (
                                                    <span key={idx} className="text-[13px] tracking-[-0.01em]">
                                                        {keyword}{idx < analysis.categorizedKeywords!.technicalSkills.missing.length - 1 ? ',' : ''}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-[13px] text-neutral-400 italic">All present</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Abilities */}
                        {(analysis.categorizedKeywords.abilities.matched.length > 0 || 
                          analysis.categorizedKeywords.abilities.missing.length > 0) && (
                            <div className="mb-12">
                                <div className="flex items-center gap-3 mb-6">
                                    <h3 className="text-[19px] font-semibold tracking-[-0.01em]">
                                        Abilities
                                    </h3>
                                    <span className="px-2 py-1 border border-neutral-400 text-neutral-600 text-[10px] font-medium tracking-[0.08em] uppercase">
                                        Important
                                    </span>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="border border-neutral-200 p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <CheckOutlined style={{ fontSize: '16px' }} />
                                            <p className="text-[13px] font-semibold tracking-[-0.01em]">
                                                In Your Resume
                                            </p>
                                        </div>
                                        {analysis.categorizedKeywords.abilities.matched.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {analysis.categorizedKeywords.abilities.matched.map((keyword, idx) => (
                                                    <span key={idx} className="text-[13px] tracking-[-0.01em]">
                                                        {keyword}{idx < analysis.categorizedKeywords!.abilities.matched.length - 1 ? ',' : ''}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-[13px] text-neutral-400 italic">None detected</p>
                                        )}
                                    </div>

                                    <div className="border border-neutral-200 p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <CloseOutlined style={{ fontSize: '16px' }} />
                                            <p className="text-[13px] font-semibold tracking-[-0.01em]">
                                                Missing
                                            </p>
                                        </div>
                                        {analysis.categorizedKeywords.abilities.missing.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {analysis.categorizedKeywords.abilities.missing.map((keyword, idx) => (
                                                    <span key={idx} className="text-[13px] tracking-[-0.01em]">
                                                        {keyword}{idx < analysis.categorizedKeywords!.abilities.missing.length - 1 ? ',' : ''}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-[13px] text-neutral-400 italic">All present</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Contextual Keywords */}
                        {(analysis.categorizedKeywords.significantKeywords.matched.length > 0 || 
                          analysis.categorizedKeywords.significantKeywords.missing.length > 0) && (
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <h3 className="text-[19px] font-semibold tracking-[-0.01em]">
                                        Contextual Keywords
                                    </h3>
                                    <span className="px-2 py-1 border border-neutral-300 text-neutral-500 text-[10px] font-medium tracking-[0.08em] uppercase">
                                        Context
                                    </span>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="border border-neutral-200 p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <CheckOutlined style={{ fontSize: '16px' }} />
                                            <p className="text-[13px] font-semibold tracking-[-0.01em]">
                                                In Your Resume
                                            </p>
                                        </div>
                                        {analysis.categorizedKeywords.significantKeywords.matched.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {analysis.categorizedKeywords.significantKeywords.matched.map((keyword, idx) => (
                                                    <span key={idx} className="text-[13px] tracking-[-0.01em]">
                                                        {keyword}{idx < analysis.categorizedKeywords!.significantKeywords.matched.length - 1 ? ',' : ''}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-[13px] text-neutral-400 italic">None detected</p>
                                        )}
                                    </div>

                                    <div className="border border-neutral-200 p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <CloseOutlined style={{ fontSize: '16px' }} />
                                            <p className="text-[13px] font-semibold tracking-[-0.01em]">
                                                Missing
                                            </p>
                                        </div>
                                        {analysis.categorizedKeywords.significantKeywords.missing.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {analysis.categorizedKeywords.significantKeywords.missing.map((keyword, idx) => (
                                                    <span key={idx} className="text-[13px] tracking-[-0.01em]">
                                                        {keyword}{idx < analysis.categorizedKeywords!.significantKeywords.missing.length - 1 ? ',' : ''}
                                </span>
                            ))}
                        </div>
                                        ) : (
                                            <p className="text-[13px] text-neutral-400 italic">All present</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Resume Health Score */}
                <div className="mb-32">
                    <div className="mb-12">
                        <h2 className="text-[32px] font-semibold mb-3 tracking-[-0.02em]">
                            Resume Health
                        </h2>
                        <p className="text-[15px] text-neutral-600 tracking-[-0.01em] leading-[1.6]">
                            How well-formatted is your resume for ATS systems
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-8">
                        <div className="border-2 border-black p-12 text-center">
                            <div className="text-[120px] font-semibold tracking-tight leading-none mb-4">
                                {resumeHealth.grade}
                            </div>
                            <div className="text-[20px] font-medium mb-2 tracking-[-0.01em]">
                                Health Score: {resumeHealth.score}%
                            </div>
                            <p className="text-[13px] text-neutral-600 tracking-[-0.01em] leading-[1.6]">
                                {resumeHealth.message}
                            </p>
                        </div>

                        <div className="border border-neutral-200 p-8">
                            <div className="mb-8">
                                <div className="text-[40px] font-semibold text-green-600 mb-2">{resumeHealth.strengths}</div>
                                <div className="text-[13px] text-neutral-500 tracking-[-0.01em]">Checks Passed</div>
                            </div>
                            <div className="mb-8">
                                <div className="text-[40px] font-semibold text-red-600 mb-2">{resumeHealth.issues}</div>
                                <div className="text-[13px] text-neutral-500 tracking-[-0.01em]">Issues Detected</div>
                            </div>
                            {resumeHealth.issues > 0 && (
                                <div className="pt-6 border-t border-neutral-200">
                                    <div className="text-[13px] font-semibold mb-3 tracking-[-0.01em]">Issues:</div>
                                    <ul className="space-y-2">
                                        {analysis.atsCompatibility.issues.map((issue, idx) => (
                                            <li key={idx} className="text-[13px] text-neutral-600 tracking-[-0.01em] leading-[1.6] flex items-start gap-2">
                                                <span>•</span>
                                                <span>{issue}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                                    </div>
                                </div>

                {/* Competitive Positioning */}
                <div className="mb-32">
                    <div className="mb-12">
                        <h2 className="text-[32px] font-semibold mb-3 tracking-[-0.02em]">
                            Competitive Position
                        </h2>
                        <p className="text-[15px] text-neutral-600 tracking-[-0.01em] leading-[1.6]">
                            How you compare to typical applicants for this role
                        </p>
                    </div>

                    <div className="border border-neutral-200 p-12 text-center">
                        <div className="mb-8">
                            <TrophyOutlined style={{ fontSize: '48px' }} />
                        </div>
                        <div className="text-[32px] font-semibold mb-2 tracking-[-0.02em]">
                            {competitive.position}
                        </div>
                        <div className="text-[20px] text-neutral-600 mb-8 tracking-[-0.01em]">
                            {competitive.percentile} of Applicants
                        </div>
                        <div className="max-w-md mx-auto mb-8">
                            <div className="relative mb-2">
                                <div 
                                    className="absolute bottom-full mb-2 transform -translate-x-1/2"
                                    style={{ left: `${competitive.score}%` }}
                                >
                                    <span className="text-[11px] font-semibold text-black whitespace-nowrap">
                                        You ({competitive.score})
                                    </span>
                                </div>
                                <div className="h-3 bg-neutral-200 relative">
                                    <div 
                                        className="absolute left-0 top-0 h-full bg-black"
                                        style={{ width: `${competitive.score}%` }}
                                    />
                                        </div>
                                    </div>
                            <div className="flex justify-between text-[11px] text-neutral-500">
                                <span>0</span>
                                <span>100</span>
                            </div>
                        </div>
                        <p className="text-[15px] text-neutral-600 leading-[1.6] tracking-[-0.01em]">
                            {competitive.message}
                        </p>
                    </div>
                </div>

                {/* Action Button */}
                <div className="text-center pt-16 pb-32">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-3 px-16 py-5 border border-black text-[15px] font-medium tracking-[-0.01em] hover:bg-black hover:text-white transition-all duration-300"
                    >
                        Analyze Another Resume
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-neutral-100 py-6">
                <div className="max-w-7xl mx-auto px-8 sm:px-12">
                    <p className="text-[11px] tracking-[0.08em] uppercase text-neutral-400 text-center font-medium">
                        {new Date(analysis.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                        })}
                    </p>
                </div>
            </footer>
        </main>
    );
}
