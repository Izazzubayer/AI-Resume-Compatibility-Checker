MY QUESTION: can you help me find hugging face/kaggle models that actually parse resume and show multiple stats of it like ats score, keywords matched, wordcount, what user must improve or do, etc. stufffs like that. basically i wanna use ai in my nextjs project which lets user upload resume and jd and provide stats to user by calling the ML model API, processes it and returns real ai analyzed results. it must be free models. everything myust be webbased and all free... dont want my computer to be online al the time.... currently I am using these 2 models - File: .env.local HUGGING_FACE_MODEL_EMBEDDINGS=sentence-transformers/all-MiniLM-L6-v2 HUGGING_FACE_MODEL_CLASSIFICATION=facebook/bart-large-mnli
Based on my reqruiements what combination of models 



Claude: 
Nice, those two models are actually a really solid starting point for what you want.

Let me break it into two parts:

What combo of models I’d use for your ATS-style app

How to wire this into your Next.js project (with Cursor + Sonnet helping)

1️⃣ Model combo I’d use for your use-case

Your current setup:

HUGGING_FACE_MODEL_EMBEDDINGS=sentence-transformers/all-MiniLM-L6-v2
HUGGING_FACE_MODEL_CLASSIFICATION=facebook/bart-large-mnli

a) Embeddings model – keep it exactly as is

sentence-transformers/all-MiniLM-L6-v2 is literally one of the most popular sentence-embedding models on HF for semantic similarity and retrieval. Perfect for:

Resume ↔ JD similarity (core “ATS score”)

Per-bullet similarity (which JD bullets are well-covered vs weak)

It’s lightweight-ish, fast, and designed for sentence similarity. 
Hugging Face
+1

👉 I’d definitely keep this as your main engine.

b) Classification model – also good, but use it selectively

facebook/bart-large-mnli is a zero-shot classification / NLI model. It’s best at:

“Does the resume entail this requirement?”

Zero-shot labeling like “Strong match / Partial / Weak”.
Hugging Face
+1

For your app, I’d use it for per-requirement coverage rather than the main score:

For each JD bullet (or important skill), you can ask:
“Given this resume text, to what extent is this requirement covered?”

So I’d keep it, but not as the main scoring model—more as an extra signal.

c) Do you need extra models? (short answer: not for v1)

For your required features:

✅ ATS score

✅ Keywords matched / missing

✅ Wordcount

✅ “What to improve” (could be templated from stats)

…you can actually do v1 with just these two models + your own JS logic.

If/when you want more advanced parsing, these are nice optional upgrades:

Resume NER / parser (optional upgrade)

yashpwr/resume-ner-bert-v2 – token classification model trained for resume parsing (names, roles, skills, etc.). 
Hugging Face
+1

Use it to build structured JSON: {skills: [...], roles: [...], education: [...]}

That lets you do fancier stats later (“skills per year”, etc.)

Small instruct LLM for natural-language feedback (optional)

E.g. mistral-community/Mistral-7B-Instruct-v0.3 via HF Inference for generating feedback text. 
Hugging Face

You feed it your computed stats + resume + JD and ask it:
“Write a short, friendly explanation of what to improve.”

But for now, to keep everything simple & free:

Recommended v1 stack:
✅ sentence-transformers/all-MiniLM-L6-v2 – main engine (similarity & ATS score)
✅ facebook/bart-large-mnli – optional per-requirement coverage / labels
❌ No extra models required to ship MVP

You can keep your .env.local as-is and just change how you use them.

2️⃣ How I’d actually use these two models in your Next.js project

Let’s assume:

HUGGING_FACE_API_KEY=your_real_token_here
HUGGING_FACE_MODEL_EMBEDDINGS=sentence-transformers/all-MiniLM-L6-v2
HUGGING_FACE_MODEL_CLASSIFICATION=facebook/bart-large-mnli

a) Create a simple Hugging Face helper in Next.js

In lib/huggingface.ts:

// lib/huggingface.ts
const HF_API_KEY = process.env.HUGGING_FACE_API_KEY!;
const HF_BASE_URL = "https://api-inference.huggingface.co";

export async function embedText(texts: string[]) {
  const model = process.env.HUGGING_FACE_MODEL_EMBEDDINGS!;
  const res = await fetch(`${HF_BASE_URL}/pipeline/feature-extraction/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: texts }),
  });

  if (!res.ok) {
    throw new Error(`HF embeddings error: ${await res.text()}`);
  }

  const data = await res.json();
  // data is number[][] for multiple sentences
  return data as number[][];
}

export async function zeroShotClassify(input: string, labels: string[]) {
  const model = process.env.HUGGING_FACE_MODEL_CLASSIFICATION!;
  const res = await fetch(`${HF_BASE_URL}/pipeline/zero-shot-classification/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: input,
      parameters: { candidate_labels: labels },
    }),
  });

  if (!res.ok) {
    throw new Error(`HF classification error: ${await res.text()}`);
  }

  return (await res.json()) as {
    labels: string[];
    scores: number[];
  };
}


In Cursor, you can literally paste this file in, then ask Sonnet:
“Explain this helper and add JSDoc comments + types where needed.”

b) Compute ATS score with embeddings

In your API route, e.g. app/api/analyze-resume/route.ts:

import { NextRequest, NextResponse } from "next/server";
import { embedText } from "@/lib/huggingface";

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export async function POST(req: NextRequest) {
  const { resumeText, jobDescription } = await req.json();

  // 1) Embeddings
  const [resumeEmb, jdEmb] = await embedText([resumeText, jobDescription]);

  // 2) Cosine similarity -> ATS score 0–100
  const sim = cosineSimilarity(resumeEmb, jdEmb);
  const atsScore = Math.round((sim + 1) * 50); // maps [-1,1] -> [0,100]

  // 3) Keywords & wordcount
  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
  // simplest JD keyword extraction: split + filter stopwords
  const jdTokens = jobDescription.toLowerCase().split(/\W+/);
  const stopwords = new Set(["the", "and", "with", "for", "in", "of", "to", "a", "an"]);
  const jdKeywords = Array.from(
    new Set(jdTokens.filter((t) => t.length > 2 && !stopwords.has(t)))
  );

  const resumeLower = resumeText.toLowerCase();
  const matchedKeywords = jdKeywords.filter((k) => resumeLower.includes(k));
  const missingKeywords = jdKeywords.filter((k) => !resumeLower.includes(k));
  const keywordCoverage =
    jdKeywords.length === 0 ? 0 : Math.round((matchedKeywords.length / jdKeywords.length) * 100);

  return NextResponse.json({
    atsScore,
    wordCount,
    matchedKeywords,
    missingKeywords,
    keywordCoverage,
  });
}


This alone gives you:

✅ atsScore (semantic)

✅ wordCount

✅ matchedKeywords & missingKeywords

✅ keywordCoverage

You can already show a lot of value with just that.

c) Use facebook/bart-large-mnli for requirement coverage (optional)

Then, if you want something like:

“You fully cover 7/10 job requirements; these 3 are weak…”

You can loop through JD bullets and call zeroShotClassify:

import { zeroShotClassify } from "@/lib/huggingface";

export async function checkRequirementCoverage(
  resumeText: string,
  requirements: string[]
) {
  const results = [];

  for (const req of requirements) {
    // Concatenate requirement and resume so the model sees context
    const input = `Requirement: ${req}\n\nResume:\n${resumeText}`;

    const classification = await zeroShotClassify(input, [
      "strongly covered",
      "partially covered",
      "not covered",
    ]);

    results.push({
      requirement: req,
      label: classification.labels[0],
      confidence: classification.scores[0],
    });
  }

  return results;
}


You don’t have to do this at first (because it adds cost/latency), but it’s a nice layer on top.