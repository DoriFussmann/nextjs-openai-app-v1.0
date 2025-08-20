import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buildDataHandlingPrompt } from "@/utils/prompts";
import schema from "@/data/business-plan-structure.json";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Zod validators
const DataPoint = z.object({
  original: z.string(),
  refined: z.string(),
});

const Subtopic = z.object({
  subtopicId: z.string(),
  title: z.string(),
  status: z.enum(["answered", "na"]),
  reason: z.string().optional(),
  dataPoints: z.array(DataPoint).optional(),
});

const Topic = z.object({
  topicId: z.string(),
  title: z.string(),
  completion: z
    .object({
      answered: z.number().int().nonnegative(),
      total: z.number().int().nonnegative(),
      percent: z.number().int().min(0).max(100),
    })
    .optional(),
  subtopics: z.array(Subtopic),
});

const MappingResult = z.object({
  version: z.literal("1.0"),
  summary: z.string(),
  topics: z.array(Topic),
});

type MappingResultT = z.infer<typeof MappingResult>;

// helper to compute completion if model omitted or wrong
function ensureCompletion(r: MappingResultT): MappingResultT {
  const topics = r.topics.map((t) => {
    const total = t.subtopics.length;
    const answered = t.subtopics.filter((s) => s.status === "answered").length;
    const percent = total === 0 ? 0 : Math.round((answered / total) * 100);
    
    // Ensure all subtopics have dataPoints array (empty if not provided)
    const normalizedSubtopics = t.subtopics.map(subtopic => ({
      ...subtopic,
      dataPoints: subtopic.dataPoints || []
    }));
    
    return {
      ...t,
      completion: { answered, total, percent },
      subtopics: normalizedSubtopics,
    };
  });
  return { ...r, topics };
}

export async function POST(req: NextRequest) {
  try {
    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const rawData: string = body?.rawData ?? "";
    const incomingSchema = body?.schema ?? schema; // allow override, fallback to local

    if (!rawData || typeof rawData !== "string") {
      return NextResponse.json({ error: "rawData (string) is required" }, { status: 400 });
    }

    const prompt = buildDataHandlingPrompt(rawData, JSON.stringify(incomingSchema));

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // adjust if you prefer
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You output strictly valid JSON that matches the requested schema." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json({ error: "OpenAI error", detail: text }, { status: 502 });
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content ?? "";

    // parse + validate
    let parsed: MappingResultT;
    try {
      parsed = MappingResult.parse(JSON.parse(content));
    } catch (e: any) {
      return NextResponse.json({ error: "Validation failed", detail: e?.message ?? String(e), raw: content }, { status: 422 });
    }

    const withCompletion = ensureCompletion(parsed);
    return NextResponse.json(withCompletion, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: "Unexpected error", detail: err?.message ?? String(err) }, { status: 500 });
  }
}
