import type { ModelResponse } from "@/types/progress";

export async function fetchModelResponse(payload: {
  Data: string;
  Reference: unknown; // your topics/subtopics spec
  Prompt: string;
}): Promise<ModelResponse> {
  // Replace "/api/openai-parse" with your actual API route
  const res = await fetch("/api/openai-parse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error(`OpenAI call failed: ${res.status} ${res.statusText}`);
  }

  // We expect the API to return JSON already (not a string blob).
  const data = await res.json();

  // minimal shape check
  if (!data || !Array.isArray(data.topics)) {
    throw new Error("Model returned invalid shape (missing 'topics' array).");
  }

  return data as ModelResponse;
}
