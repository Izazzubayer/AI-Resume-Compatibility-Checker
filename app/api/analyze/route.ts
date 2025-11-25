import { NextRequest, NextResponse } from 'next/server';
import { analyzeResume } from '@/lib/ai/analyzer';

export const maxDuration = 60; // Set max duration to 60 seconds for analysis

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { resumeText, jobDescription, jobTitle, seniority, fileName } = body;

        // Validate required fields
        if (!resumeText || !jobDescription) {
            return NextResponse.json(
                { error: 'Resume text and job description are required' },
                { status: 400 }
            );
        }

        if (!jobTitle) {
            return NextResponse.json(
                { error: 'Job title is required' },
                { status: 400 }
            );
        }

        // Perform analysis
        const analysis = await analyzeResume({
            resumeText,
            jobDescription,
            jobTitle,
            seniority: seniority || 'mid',
            fileName: fileName || 'resume.pdf',
        });

        return NextResponse.json({
            success: true,
            data: analysis,
        });
    } catch (error) {
        console.error('Analysis error:', error);
        return NextResponse.json(
            {
                error: 'Analysis failed. Please try again.',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
