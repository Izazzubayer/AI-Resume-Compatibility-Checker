import { NextRequest, NextResponse } from 'next/server';
import { parsePDF } from '@/lib/parsers/pdf-parser';
import { parseDOCX } from '@/lib/parsers/docx-parser';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Check file size (5MB limit)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File size exceeds 5MB limit' },
                { status: 400 }
            );
        }

        // Get file extension
        const fileName = file.name;
        const fileExt = fileName.toLowerCase().split('.').pop();

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        let text = '';

        // Parse based on file type
        if (fileExt === 'pdf') {
            text = await parsePDF(buffer);
        } else if (fileExt === 'docx' || fileExt === 'doc') {
            text = await parseDOCX(buffer);
        } else {
            return NextResponse.json(
                { error: 'Unsupported file format. Please use PDF or DOCX' },
                { status: 400 }
            );
        }

        if (!text || text.trim().length === 0) {
            return NextResponse.json(
                { error: 'Could not extract text from file' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                text,
                fileName: file.name,
                fileSize: file.size,
            },
        });
    } catch (error) {
        console.error('Error parsing resume:', error);
        return NextResponse.json(
            { error: 'Failed to parse resume file' },
            { status: 500 }
        );
    }
}
