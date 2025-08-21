import { NextRequest, NextResponse } from "next/server";
import { loadPromptBundle } from "@/lib/promptLoader";
import { parseSchema, filterUpdatesToSchema, deepMerge } from "@/lib/schema";

export async function POST(req: NextRequest) {
  const { userMessage, businessContext, modelState, promptsKey = "model_builder_v1" } = await req.json();

  const { orchestrator, heuristics, guardrails, schemaText } = await loadPromptBundle(promptsKey);
  const system = [orchestrator.replace("{{SCHEMA_TEXT}}", schemaText), heuristics, guardrails].join("\n\n");
  const user = `
BUSINESS_CONTEXT:
${JSON.stringify(businessContext || {}, null, 2)}

CURRENT_MODEL_STATE:
${JSON.stringify(modelState || {}, null, 2)}

USER_REPLY:
${userMessage}
`.trim();

  const apiKey = process.env.OPENAI_API_KEY!;
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [{ role: "system", content: system }, { role: "user", content: user }]
    })
  });

  const data = await resp.json();
  const full = data?.choices?.[0]?.message?.content || "";

  // Split: message vs fenced JSON contract
  const m = full.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  let contract: any = {};
  if (m) {
    try { contract = JSON.parse(m[1]); } catch { contract = {}; }
  }
  const assistantMessage = full.replace(/```[\s\S]*```/, "").trim();

  // Validate updates against schema
  const schemaJson = parseSchema(schemaText);
  const safeUpdates = filterUpdatesToSchema(contract?.updates || {}, schemaJson);
  const modelStateUpdated = deepMerge(modelState || {}, safeUpdates);

  return NextResponse.json({
    assistantMessage,
    contract,
    modelStateUpdated
  });
}
