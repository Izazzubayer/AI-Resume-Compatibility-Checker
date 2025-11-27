'use client';

import { useState } from 'react';
import { 
    CloudUploadOutlined, 
    ArrowRightOutlined, 
    CloseOutlined, 
    FileTextOutlined,
    CheckSquareOutlined,
    ThunderboltOutlined,
    LineChartOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomePage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressStatus, setProgressStatus] = useState('');

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
        setProgress(0);
        setProgressStatus('Preparing analysis...');

        try {
            // Stage 1: Parsing resume (0-30%)
            setProgress(10);
            setProgressStatus('Reading resume file...');
            
            const formData = new FormData();
            formData.append('file', file);

            setProgress(20);
            setProgressStatus('Parsing resume content...');

            const parseResponse = await fetch('/api/parse-resume', {
                method: 'POST',
                body: formData,
            });

            if (!parseResponse.ok) {
                const errorData = await parseResponse.json();
                throw new Error(errorData.error || 'Failed to parse resume');
            }

            const { data: resumeData } = await parseResponse.json();
            
            setProgress(35);
            setProgressStatus('Resume parsed successfully');

            // Stage 2: Analyzing with AI (30-80%)
            setProgress(40);
            setProgressStatus('Analyzing job description...');
            
            await new Promise(resolve => setTimeout(resolve, 300));
            
            setProgress(50);
            setProgressStatus('Matching skills with AI...');

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

            setProgress(70);
            setProgressStatus('Calculating compatibility scores...');
            
            await new Promise(resolve => setTimeout(resolve, 300));
            
            setProgress(85);
            setProgressStatus('Generating insights...');

            const { data: analysisData } = await analyzeResponse.json();
            
            // Stage 3: Finalizing (80-100%)
            setProgress(95);
            setProgressStatus('Preparing your results...');
            
            localStorage.setItem('latestAnalysis', JSON.stringify(analysisData));
            
            setProgress(100);
            setProgressStatus('Complete!');
            
            await new Promise(resolve => setTimeout(resolve, 400));
            
            router.push(`/results/${analysisData.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setProgress(0);
            setProgressStatus('');
        } finally {
            setLoading(false);
        }
    };

    const isReadyToAnalyze = file && jobDescription.trim();

    return (
        <main className="min-h-screen bg-white">
            {/* Minimal Top Bar */}
            <div className="border-b border-neutral-100">
                <div className="max-w-7xl mx-auto px-8 sm:px-12 py-5 flex justify-between items-center">
                    <div className="text-[11px] tracking-[0.08em] uppercase text-neutral-400 font-medium">
                        Resume Analyzer
                    </div>
                    <Link 
                        href="/privacy" 
                        className="text-[11px] tracking-[0.08em] uppercase text-neutral-400 hover:text-black transition-colors font-medium"
                    >
                        Privacy
                    </Link>
                </div>
            </div>

            {/* Hero Section - Apple Inspired */}
            <div className="border-b border-neutral-100">
                <div className="max-w-5xl mx-auto px-8 sm:px-12 py-24 text-center">
                    <h1 className="text-[40px] sm:text-[52px] lg:text-[64px] font-semibold mb-6 tracking-[-0.02em] leading-[1.1] text-black">
                        Find Your Resume Match
                    </h1>
                    <p className="text-[17px] sm:text-[19px] font-normal text-neutral-600 max-w-2xl mx-auto leading-[1.5] tracking-[-0.01em]">
                        See how your resume matches to the job description.
                    </p>
                </div>
            </div>

            {/* Main Upload Section */}
            <div className="max-w-7xl mx-auto px-8 sm:px-12 py-24 sm:py-32">
                
                {/* Horizontal Layout: Upload + Job Description */}
                <div className="grid lg:grid-cols-2 gap-8 mb-20">
                    {/* Resume Upload */}
                    <div>
                        <div
                            className={`relative border transition-all duration-300 cursor-pointer overflow-hidden h-full ${
                                dragActive
                            ? 'border-black bg-neutral-50'
                            : file
                                ? 'border-black'
                                        : 'border-neutral-200 hover:border-neutral-400'
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => !file && document.getElementById('resume-upload')?.click()}
                    >
                            <div className="px-8 py-12">
                            {file ? (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 border border-black flex items-center justify-center flex-shrink-0">
                                                <FileTextOutlined style={{ fontSize: '18px' }} />
                                    </div>
                                            <div className="text-left">
                                                <p className="text-[15px] font-medium mb-1 tracking-[-0.01em]">{file.name}</p>
                                                <p className="text-[12px] text-neutral-500 tracking-[-0.01em]">
                                            {(file.size / 1024).toFixed(1)} KB
                                        </p>
                                            </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFile(null);
                                        }}
                                            className="w-7 h-7 flex items-center justify-center border border-neutral-300 hover:border-black hover:bg-black hover:text-white transition-all flex-shrink-0"
                                    >
                                            <CloseOutlined style={{ fontSize: '11px' }} />
                                    </button>
                                </div>
                            ) : (
                                    <div className="text-center">
                                        <CloudUploadOutlined 
                                            style={{ fontSize: '40px' }} 
                                            className="text-neutral-300 mb-6"
                                        />
                                        <p className="text-[17px] font-medium mb-2 tracking-[-0.01em]">
                                            Upload your resume
                                        </p>
                                        <p className="text-[13px] text-neutral-500 mb-4 tracking-[-0.01em]">
                                            Drop file or click
                                        </p>
                                        <p className="text-[10px] text-neutral-400 tracking-[0.08em] uppercase font-medium">
                                            PDF, DOC, DOCX • Max 5MB
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

                    {/* Job Description */}
                    <div>
                        <div className="border border-neutral-200 focus-within:border-black transition-colors overflow-hidden h-full">
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the job description here..."
                                className="w-full h-full min-h-[300px] px-8 py-8 text-[15px] font-normal resize-none focus:outline-none bg-white placeholder:text-neutral-400 tracking-[-0.01em] leading-[1.6]"
                        />
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-12 p-6 border border-black bg-white">
                        <div className="flex items-start justify-between gap-4">
                            <p className="text-[13px] font-medium tracking-[-0.01em]">{error}</p>
                            <button
                                onClick={() => setError('')}
                                className="w-6 h-6 flex items-center justify-center hover:opacity-60 transition-opacity flex-shrink-0"
                            >
                                <CloseOutlined style={{ fontSize: '10px' }} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Analyze Button - Centered & Prominent */}
                <div className="text-center">
                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !isReadyToAnalyze}
                        className={`group inline-flex items-center gap-3 px-16 py-5 text-[15px] font-medium tracking-[-0.01em] transition-all duration-300 ${
                            loading || !isReadyToAnalyze
                                ? 'border border-neutral-200 text-neutral-300 cursor-not-allowed'
                                : 'border border-black text-black hover:bg-black hover:text-white'
                            }`}
                    >
                        {loading ? (
                            <>
                                <div className="w-1 h-1 bg-current animate-pulse" />
                                Analyzing
                            </>
                        ) : (
                            <>
                                Analyze Resume
                                <ArrowRightOutlined 
                                    style={{ fontSize: '14px' }} 
                                    className="transition-transform group-hover:translate-x-1"
                                />
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* How It Works Section */}
            <div className="border-t border-neutral-100">
                <div className="max-w-5xl mx-auto px-8 sm:px-12 py-24 sm:py-32">
                    <div className="text-center mb-20">
                        <h2 className="text-[32px] sm:text-[40px] font-semibold mb-4 tracking-[-0.02em]">
                            How it works
                    </h2>
                        <p className="text-[15px] text-neutral-600 tracking-[-0.01em] leading-[1.6]">
                            Get your compatibility score in seconds
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-16">
                        {/* Step 1 */}
                        <div>
                            <div className="mb-8">
                                <div className="w-12 h-12 border border-black flex items-center justify-center mb-6">
                                    <span className="text-[20px] font-semibold tracking-[-0.01em]">1</span>
                                </div>
                                <h3 className="text-[17px] font-semibold mb-3 tracking-[-0.01em]">
                                    Upload your resume
                                </h3>
                                <p className="text-[15px] text-neutral-600 leading-[1.6] tracking-[-0.01em]">
                                    Drop your PDF, DOC, or DOCX file. We extract and analyze the text instantly.
                                </p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div>
                            <div className="mb-8">
                                <div className="w-12 h-12 border border-black flex items-center justify-center mb-6">
                                    <span className="text-[20px] font-semibold tracking-[-0.01em]">2</span>
                                </div>
                                <h3 className="text-[17px] font-semibold mb-3 tracking-[-0.01em]">
                                    Paste job description
                                </h3>
                                <p className="text-[15px] text-neutral-600 leading-[1.6] tracking-[-0.01em]">
                                    Copy the complete job posting from any source and paste it into the text area.
                                </p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div>
                            <div className="mb-8">
                                <div className="w-12 h-12 border border-black flex items-center justify-center mb-6">
                                    <span className="text-[20px] font-semibold tracking-[-0.01em]">3</span>
                                </div>
                                <h3 className="text-[17px] font-semibold mb-3 tracking-[-0.01em]">
                                    Get detailed analysis
                                </h3>
                                <p className="text-[15px] text-neutral-600 leading-[1.6] tracking-[-0.01em]">
                                    Receive a comprehensive compatibility score with actionable recommendations.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* What You'll Receive */}
                    <div className="mt-24 pt-24 border-t border-neutral-100">
                    <div className="text-center mb-20">
                        <h2 className="text-[32px] sm:text-[40px] font-semibold mb-4 tracking-[-0.02em]">
                            Your analysis includes
                        </h2>
                        <p className="text-[15px] text-neutral-600 tracking-[-0.01em] leading-[1.6]">
                            All the information you need to know about your resume and job description.
                        </p>
                    </div>
                        <div className="grid sm:grid-cols-2 gap-x-16 gap-y-10 max-w-3xl mx-auto">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 border border-black flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <CheckSquareOutlined style={{ fontSize: '18px' }} />
                                </div>
                                <div>
                                    <p className="text-[17px] font-semibold tracking-[-0.01em] mb-3">
                                        Skills match score
                                    </p>
                                    <p className="text-[15px] text-neutral-600 leading-[1.6] tracking-[-0.01em]">
                                        Identifies matched and missing skills
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 border border-black flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <CheckSquareOutlined style={{ fontSize: '18px' }} />
                                </div>
                                <div>
                                    <p className="text-[17px] font-semibold tracking-[-0.01em] mb-3">
                                        Experience alignment
                                    </p>
                                    <p className="text-[15px] text-neutral-600 leading-[1.6] tracking-[-0.01em]">
                                        Compares your background with role requirements
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 border border-black flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <CheckSquareOutlined style={{ fontSize: '18px' }} />
                                </div>
                                <div>
                                    <p className="text-[17px] font-semibold tracking-[-0.01em] mb-3">
                                        Keyword optimization
                                    </p>
                                    <p className="text-[15px] text-neutral-600 leading-[1.6] tracking-[-0.01em]">
                                        Shows important keywords to add
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 border border-black flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <CheckSquareOutlined style={{ fontSize: '18px' }} />
                                </div>
                                <div>
                                    <p className="text-[17px] font-semibold tracking-[-0.01em] mb-3">
                                        ATS compatibility check
                                    </p>
                                    <p className="text-[15px] text-neutral-600 leading-[1.6] tracking-[-0.01em]">
                                        Ensures your resume passes automated screening
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 border border-black flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <CheckSquareOutlined style={{ fontSize: '18px' }} />
                                </div>
                                <div>
                                    <p className="text-[17px] font-semibold tracking-[-0.01em] mb-3">
                                        Actionable recommendations
                                    </p>
                                    <p className="text-[15px] text-neutral-600 leading-[1.6] tracking-[-0.01em]">
                                        Specific improvements to increase your score
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 border border-black flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <CheckSquareOutlined style={{ fontSize: '18px' }} />
                                </div>
                                <div>
                                    <p className="text-[17px] font-semibold tracking-[-0.01em] mb-3">
                                        Overall compatibility score
                                    </p>
                                    <p className="text-[15px] text-neutral-600 leading-[1.6] tracking-[-0.01em]">
                                        Single number that summarizes your match
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section - Refined */}
            <div className="border-t border-neutral-100 bg-neutral-50">
                <div className="max-w-6xl mx-auto px-8 sm:px-12 py-32">
                    <div className="grid md:grid-cols-3 gap-20">
                        <div>
                            <div className="w-10 h-10 border border-black flex items-center justify-center mb-8">
                                <CheckSquareOutlined style={{ fontSize: '18px' }} />
                            </div>
                            <h3 className="text-[17px] font-semibold mb-4 tracking-[-0.01em]">ATS Compatible</h3>
                            <p className="text-[15px] text-neutral-600 leading-[1.6] tracking-[-0.01em]">
                                Optimized to pass through Applicant Tracking Systems used by 99% of Fortune 500 companies.
                            </p>
                        </div>
                        <div>
                            <div className="w-10 h-10 border border-black flex items-center justify-center mb-8">
                                <ThunderboltOutlined style={{ fontSize: '18px' }} />
                            </div>
                            <h3 className="text-[17px] font-semibold mb-4 tracking-[-0.01em]">AI Insights</h3>
                            <p className="text-[15px] text-neutral-600 leading-[1.6] tracking-[-0.01em]">
                                Advanced machine learning analyzes thousands of data points to provide precise recommendations.
                            </p>
                                </div>
                        <div>
                            <div className="w-10 h-10 border border-black flex items-center justify-center mb-8">
                                <LineChartOutlined style={{ fontSize: '18px' }} />
                            </div>
                            <h3 className="text-[17px] font-semibold mb-4 tracking-[-0.01em]">Deep Analysis</h3>
                            <p className="text-[15px] text-neutral-600 leading-[1.6] tracking-[-0.01em]">
                                Comprehensive scoring across skills, experience, keywords, and formatting with actionable insights.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer - Minimal */}
            <footer className="border-t border-neutral-100 py-6">
                <div className="max-w-7xl mx-auto px-8 sm:px-12">
                    <p className="text-[11px] tracking-[0.08em] uppercase text-neutral-400 text-center font-medium">
                        Powered by Artificial Intelligence
                    </p>
                </div>
            </footer>

            {/* Progress Modal - Sharp & Minimal */}
            {loading && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white border border-black w-full max-w-md mx-4">
                        {/* Header */}
                        <div className="border-b border-neutral-200 px-8 py-6">
                            <h3 className="text-[17px] font-semibold tracking-[-0.01em]">
                                Analyzing Resume
                            </h3>
                            <p className="text-[13px] text-neutral-500 mt-1 tracking-[-0.01em]">
                                {progressStatus}
                            </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="px-8 py-8">
                            {/* Progress Track */}
                            <div className="w-full h-1 bg-neutral-100 relative overflow-hidden">
                                {/* Progress Fill */}
                                <div 
                                    className="absolute top-0 left-0 h-full bg-black transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            
                            {/* Progress Percentage */}
                            <div className="flex items-center justify-between mt-4">
                                <span className="text-[13px] text-neutral-500 tracking-[-0.01em]">
                                    Progress
                                </span>
                                <span className="text-[15px] font-semibold tracking-[-0.01em]">
                                    {progress}%
                                </span>
                            </div>
                        </div>

                        {/* Status Indicators */}
                        <div className="border-t border-neutral-100 px-8 py-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 ${progress > 0 ? 'bg-black' : 'bg-neutral-200'}`} />
                                    <span className={`text-[13px] tracking-[-0.01em] ${progress > 0 ? 'text-black' : 'text-neutral-400'}`}>
                                        Parsing resume
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 ${progress >= 40 ? 'bg-black' : 'bg-neutral-200'}`} />
                                    <span className={`text-[13px] tracking-[-0.01em] ${progress >= 40 ? 'text-black' : 'text-neutral-400'}`}>
                                        AI analysis
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 ${progress >= 85 ? 'bg-black' : 'bg-neutral-200'}`} />
                                    <span className={`text-[13px] tracking-[-0.01em] ${progress >= 85 ? 'text-black' : 'text-neutral-400'}`}>
                                        Generating insights
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
