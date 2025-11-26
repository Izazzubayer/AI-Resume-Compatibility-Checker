'use client';

import Link from 'next/link';
import { 
    LeftOutlined, 
    SafetyOutlined, 
    DatabaseOutlined, 
    EyeInvisibleOutlined, 
    CloudServerOutlined 
} from '@ant-design/icons';

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="px-8 py-6 border-b border-neutral-200">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm hover:opacity-60 transition-opacity"
                >
                    <LeftOutlined style={{ fontSize: '14px' }} />
                    <span>Back to Home</span>
                </Link>
            </nav>

            <div className="max-w-3xl mx-auto px-8 py-24">
                <div className="mb-16">
                    <h1 className="text-5xl font-semibold mb-6 tracking-tight">Privacy Policy</h1>
                    <p className="text-xl text-neutral-600 font-light leading-relaxed">
                        We believe your resume data belongs to you. That's why we built this tool to be privacy-first by design.
                    </p>
                </div>

                <div className="space-y-16">
                    {/* Core Privacy Principle */}
                    <section className="border-b border-neutral-100 pb-16">
                        <div className="flex items-start gap-6">
                            <div className="w-12 h-12 border border-black flex items-center justify-center flex-shrink-0">
                                <SafetyOutlined style={{ fontSize: '24px' }} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-medium mb-4">No Persistent Storage</h2>
                                <p className="text-base text-neutral-600 font-light leading-relaxed mb-4">
                                    We do not store your resume or job descriptions on our servers. When you upload a file, it is processed in temporary memory and then immediately discarded.
                                </p>
                                <p className="text-base text-neutral-600 font-light leading-relaxed">
                                    Once the analysis is complete, the data exists only on your local device (in your browser's Local Storage) so you can view your results.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Data Processing */}
                    <section className="border-b border-neutral-100 pb-16">
                        <div className="flex items-start gap-6">
                            <div className="w-12 h-12 border border-black flex items-center justify-center flex-shrink-0">
                                <CloudServerOutlined style={{ fontSize: '24px' }} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-medium mb-4">How We Process Data</h2>
                                <p className="text-base text-neutral-600 font-light leading-relaxed mb-4">
                                    To provide AI-powered insights, your text data is sent securely to:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-neutral-600 font-light mb-4">
                                    <li><strong>Vercel Serverless Functions:</strong> For parsing PDF/DOCX files (ephemeral processing).</li>
                                    <li><strong>Hugging Face Inference API:</strong> For semantic analysis and skill matching.</li>
                                </ul>
                                <p className="text-base text-neutral-600 font-light leading-relaxed">
                                    These services process the data to generate the analysis and do not retain it for their own training purposes.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Local Storage */}
                    <section className="border-b border-neutral-100 pb-16">
                        <div className="flex items-start gap-6">
                            <div className="w-12 h-12 border border-black flex items-center justify-center flex-shrink-0">
                                <DatabaseOutlined style={{ fontSize: '24px' }} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-medium mb-4">Your Data, Your Device</h2>
                                <p className="text-base text-neutral-600 font-light leading-relaxed mb-4">
                                    Your analysis results are saved to your browser's "Local Storage". This allows you to refresh the page and still see your results.
                                </p>
                                <p className="text-base text-neutral-600 font-light leading-relaxed">
                                    <strong>You are in control:</strong> Clearing your browser cache or local storage will permanently delete this data from your device. We have no backup copy.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Third Parties */}
                    <section>
                        <div className="flex items-start gap-6">
                            <div className="w-12 h-12 border border-black flex items-center justify-center flex-shrink-0">
                                <EyeInvisibleOutlined style={{ fontSize: '24px' }} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-medium mb-4">No Tracking or Selling</h2>
                                <p className="text-base text-neutral-600 font-light leading-relaxed">
                                    We do not use tracking cookies, analytics, or advertising pixels. We do not sell, trade, or share your personal information with third parties. This tool is designed strictly for your personal utility.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="mt-24 pt-8 border-t border-neutral-200 text-center">
                    <p className="text-xs text-neutral-400">
                        Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>
        </main>
    );
}
