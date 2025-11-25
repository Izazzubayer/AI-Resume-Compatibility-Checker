'use client';

import { useState } from 'react';
import { Upload, FileText, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function HomePage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [seniority, setSeniority] = useState('mid');
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
        const maxSize = 5 * 1024 * 1024; // 5MB

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

        if (!jobTitle.trim()) {
            setError('Please enter a job title');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Step 1: Parse resume
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

            // Step 2: Analyze
            const analyzeResponse = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resumeText: resumeData.text,
                    jobDescription,
                    jobTitle,
                    seniority,
                    fileName: file.name,
                }),
            });

            if (!analyzeResponse.ok) {
                const errorData = await analyzeResponse.json();
                throw new Error(errorData.error || 'Analysis failed');
            }

            const { data: analysisData } = await analyzeResponse.json();

            // Store results in localStorage for now (could use a database later)
            localStorage.setItem('latestAnalysis', JSON.stringify(analysisData));

            // Navigate to results page
            router.push(`/results/${analysisData.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
                        <Sparkles className="w-4 h-4" />
                        AI-Powered Resume Analysis
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Optimize Your Resume
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Get instant AI-powered feedback on how well your resume matches job descriptions.
                        Improve your chances of landing interviews.
                    </p>
                </div>

                {/* Main Analysis Card */}
                <Card className="max-w-4xl mx-auto shadow-2xl border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-2xl">Start Your Analysis</CardTitle>
                        <CardDescription>
                            Upload your resume and paste the job description to get started
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Resume Upload</label>
                            <div
                                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${dragActive
                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
                                    }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                {file ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-center gap-2 text-green-600">
                                            <CheckCircle2 className="w-5 h-5" />
                                            <span className="font-medium">{file.name}</span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setFile(null)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <p className="mb-2 text-gray-700 dark:text-gray-300">
                                            Drag and drop your resume here, or click to browse
                                        </p>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Supports PDF, DOC, DOCX (Max 5MB)
                                        </p>
                                        <input
                                            type="file"
                                            id="resume-upload"
                                            className="hidden"
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleFileChange}
                                        />
                                        <Button
                                            variant="outline"
                                            onClick={() => document.getElementById('resume-upload')?.click()}
                                        >
                                            <FileText className="w-4 h-4 mr-2" />
                                            Browse Files
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Job Title */}
                        <div>
                            <label htmlFor="job-title" className="block text-sm font-medium mb-2">
                                Job Title
                            </label>
                            <input
                                id="job-title"
                                type="text"
                                placeholder="e.g., Senior Software Engineer"
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        {/* Seniority Level */}
                        <div>
                            <label htmlFor="seniority" className="block text-sm font-medium mb-2">
                                Seniority Level
                            </label>
                            <select
                                id="seniority"
                                value={seniority}
                                onChange={(e) => setSeniority(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                            >
                                <option value="entry">Entry Level (0-2 years)</option>
                                <option value="mid">Mid Level (3-5 years)</option>
                                <option value="senior">Senior Level (6-10 years)</option>
                                <option value="lead">Lead/Principal (10+ years)</option>
                            </select>
                        </div>

                        {/* Job Description */}
                        <div>
                            <label htmlFor="job-description" className="block text-sm font-medium mb-2">
                                Job Description
                            </label>
                            <textarea
                                id="job-description"
                                rows={8}
                                placeholder="Paste the full job description here..."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Analyze Button */}
                        <Button
                            onClick={handleAnalyze}
                            disabled={loading}
                            className="w-full h-12 text-lg gradient-primary hover:opacity-90 transition-opacity"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    Analyze Resume
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Features Section */}
                <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
                    <div className="text-center p-6">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="font-semibold mb-2">ATS Optimization</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Ensure your resume passes Applicant Tracking Systems
                        </p>
                    </div>
                    <div className="text-center p-6">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-semibold mb-2">AI-Powered Insights</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Get intelligent recommendations to improve your resume
                        </p>
                    </div>
                    <div className="text-center p-6">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="font-semibold mb-2">Detailed Reports</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Comprehensive scoring across multiple categories
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
