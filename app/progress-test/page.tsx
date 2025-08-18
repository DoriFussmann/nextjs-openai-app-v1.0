"use client";

import { useState } from "react";
import type { ModelResponse } from "@/types/progress";
import ProgressGrid from "@/components/progress/ProgressGrid";
import { fetchModelResponse } from "@/lib/fetch-model";

const REFERENCE = {
  topics: [
    { topic: "Company Overview", subtopics: ["Name","Location","Founding Year","Mission / Why We Exist"] },
    { topic: "Products & Services", subtopics: ["What We Sell","Target Customers","Value Proposition"] },
    { topic: "Business Model", subtopics: ["How We Operate","Distribution Channels"] },
    { topic: "Market & Growth", subtopics: ["Current Performance","Growth Metrics","Future Plans"] },
    { topic: "Team", subtopics: ["Key People","Roles"] }
  ]
};

const PROMPT = `Task: Parse the provided raw company text into the given topics and subtopics.
Instructions:
- For each topic/subtopic from the Reference, extract the best matching content from the raw text.
- If no information is available, set the value to "not available".
- Return VALID JSON ONLY (no markdown, no commentary), EXACTLY in this structure:
{ "topics": [ { "topic": "...", "subtopics": [ { "name": "...", "value": "..." } ] } ] }
Rules:
- Use the Reference list to decide what belongs where.
- Do not invent facts; if missing, return "not available".
- Keep values concise (1–3 sentences max).
- Output must be a single valid JSON object; no trailing commas, no extra keys.`;

const RAW_DATA = `Aurora Foods Inc.

Fresh food from people you'd actually want to meet.

What we do:
We buy really good stuff from small farms and food makers around here, keep it fresh, ... (etc)
`;

export default function ProgressTestPage() {
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<ModelResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setErr(null);
    try {
      const data = await fetchModelResponse({
        Data: RAW_DATA,
        Reference: REFERENCE,
        Prompt: PROMPT
      });
      setResp(data);
    } catch (e: any) {
      setErr(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl p-6 bg-white text-black">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg">Topic Coverage</h1>
        <button
          className="px-3 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50"
          onClick={run}
          disabled={loading}
        >
          {loading ? "Parsing…" : "Parse with OpenAI"}
        </button>
      </div>

      {err && (
        <div className="mb-4 text-sm text-red-600 border border-red-200 bg-red-50 p-3 rounded-lg">
          {err}
        </div>
      )}

      {resp ? (
        <ProgressGrid data={resp} />
      ) : (
        <p className="text-sm text-neutral-500">
          Click "Parse with OpenAI" to generate structured JSON, then view per-topic progress.
        </p>
      )}
    </main>
  );
}
