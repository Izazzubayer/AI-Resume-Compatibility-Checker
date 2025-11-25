'use client';

import { useState } from 'react';
import { Upload, ArrowRight, X, Circle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            validateAndSetFile(droppedFile);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            validateAndSetFile(selectedFile);
        }
    };

    const validateAndSetFile = (selectedFile: File) => {
        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
        const maxSize = 5 * 1024 * 1024;

        if (!allowedTypes.includes(selectedFile.type)) {
            setError('Please upload a PDF or DOCX file');
            return;
        }

        if (selectedFile.size > maxSize) {
            setError('File size must be less than 5MB');
            return;
        }

        setFile(selectedFile);
        setError('');
    };

    const handleAnalyze = async () => {
        if (!file) {
            setError('Please upload a resume');
            return;
        }

        if (!jobDescription.trim()) {
            setError('Please enter a job description');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const parseResponse = await fetch('/api/parse-resume', {
                method: 'POST',
                body: formData,
            });

            if (!parseResponse.ok) {
                const errorData = await parseResponse.json();
                throw new Error(errorData.error || 'Failed to parse resume');
            }

            const { data: resumeData } = await parseResponse.json();

            const analyzeResponse = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resumeText: resumeData.text,
                    jobDescription,
                    jobTitle: 'Not Specified',
                    seniority: 'mid',
                    fileName: file.name,
                }),
            });

            if (!analyzeResponse.ok) {
                const errorData = await analyzeResponse.json();
                throw new Error(errorData.error || 'Analysis failed');
            }

            const { data: analysisData } = await analyzeResponse.json();
            localStorage.setItem('latestAnalysis', JSON.stringify(analysisData));
            router.push(`/results/${analysisData.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const isReadyToAnalyze = file && jobDescription.trim();

    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="border-b border-neutral-200">
                <div className="max-w-4xl mx-auto px-8 py-32 text-center">
                    <h1 className="text-6xl md:text-7xl font-semibold mb-8 tracking-tight">
                        Resume Analyzer
                    </h1>
                    <p className="text-xl md:text-2xl font-light text-neutral-600 max-w-2xl mx-auto leading-relaxed">
                        AI-powered analysis to optimize your resume for any job posting.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-3xl mx-auto px-8 py-24">
                {/* Step 1: Resume Upload */}
                <div className="mb-24">
                    <div className="mb-8">
                        <h2 className="text-sm font-medium tracking-wide uppercase text-neutral-500 mb-2">
                            Step 1
                        </h2>
                        <h3 className="text-3xl font-light">Upload Your Resume</h3>
                    </div>

                    <div
                        className={`border-2 transition-all duration-200 cursor-pointer ${dragActive
                            ? 'border-black bg-neutral-50'
                            : file
                                ? 'border-black'
                                : 'border-neutral-300 hover:border-neutral-400'
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => !file && document.getElementById('resume-upload')?.click()}
                    >
                        <div className="p-16">
                            {file ? (
                                <div className="text-center space-y-6">
                                    <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-black">
                                        <Circle className="w-2 h-2 fill-black" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-medium mb-1">{file.name}</p>
                                        <p className="text-sm text-neutral-500">
                                            {(file.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFile(null);
                                        }}
                                        className="inline-flex items-center gap-2 text-sm hover:opacity-60 transition-opacity"
                                    >
                                        <X className="w-4 h-4" />
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center space-y-6">
                                    <Upload className="w-12 h-12 mx-auto text-neutral-400" />
                                    <div>
                                        <p className="text-lg font-light mb-2">
                                            Drop your resume here
                                        </p>
                                        <p className="text-sm text-neutral-500">
                                            or click to browse
                                        </p>
                                    </div>
                                    <p className="text-xs text-neutral-400">
                                        PDF, DOC, DOCX • Maximum 5MB
                                    </p>
                                </div>
                            )}
                            <input
                                type="file"
                                id="resume-upload"
                                className="hidden"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Step 2: Job Description */}
                <div className="mb-24">
                    <div className="mb-8">
                        <h2 className="text-sm font-medium tracking-wide uppercase text-neutral-500 mb-2">
                            Step 2
                        </h2>
                        <h3 className="text-3xl font-light">Add Job Description</h3>
                    </div>

                    <div className="border-2 border-neutral-300 focus-within:border-black transition-colors">
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the complete job description here..."
                            className="w-full h-64 p-6 text-base font-light resize-none focus:outline-none bg-transparent"
                        />
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-12 p-6 border-2 border-black bg-neutral-50">
                        <div className="flex items-start justify-between gap-4">
                            <p className="text-sm font-medium">{error}</p>
                            <button
                                onClick={() => setError('')}
                                className="hover:opacity-60 transition-opacity flex-shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Analyze Button */}
                <div className="text-center">
                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !isReadyToAnalyze}
                        className={`inline-flex items-center gap-3 px-12 py-4 text-base font-medium transition-all duration-200 ${loading || !isReadyToAnalyze
                            ? 'border-2 border-neutral-200 text-neutral-400 cursor-not-allowed'
                            : 'border-2 border-black hover:bg-black hover:text-white'
                            }`}
                    >
                        {loading ? (
                            <>
                                <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                Analyze Resume
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Features Section */}
            <div className="border-t border-neutral-200 bg-neutral-50">
                <div className="max-w-5xl mx-auto px-8 py-32">
                    <h2 className="text-sm font-medium tracking-wide uppercase text-neutral-500 text-center mb-20">
                        What You Get
                    </h2>
                    <div className="grid md:grid-cols-3 gap-16">
                        <div className="text-center">
                            <div className="mb-6">
                                <div className="inline-flex items-center justify-center w-12 h-12 border border-black">
                                    <Circle className="w-1.5 h-1.5 fill-black" />
                                </div>
                            </div>
                            <h3 className="text-lg font-medium mb-3">ATS Optimization</h3>
                            <p className="text-sm font-light text-neutral-600 leading-relaxed">
                                Ensure your resume passes through Applicant Tracking Systems
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="mb-6">
                                <div className="inline-flex items-center justify-center w-12 h-12 border border-black">
                                    <Circle className="w-1.5 h-1.5 fill-black" />
                                </div>
                            </div>
                            <h3 className="text-lg font-medium mb-3">AI-Powered Insights</h3>
                            <p className="text-sm font-light text-neutral-600 leading-relaxed">
                                Get intelligent recommendations powered by advanced machine learning
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="mb-6">
                                <div className="inline-flex items-center justify-center w-12 h-12 border border-black">
                                    <Circle className="w-1.5 h-1.5 fill-black" />
                                </div>
                            </div>
                            <h3 className="text-lg font-medium mb-3">Detailed Analysis</h3>
                            <p className="text-sm font-light text-neutral-600 leading-relaxed">
                                Comprehensive scoring with actionable suggestions for improvement
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-neutral-200 py-8 text-center">
                <p className="text-xs text-neutral-400">
                    AI-powered compatibility checker
                </p>
            </footer>
        </main>
    );
}
