import { NextRequest, NextResponse } from "next/server";
import { loadPromptBundle } from "@/lib/promptLoader";
import { parseSchema, coveragePct } from "@/lib/schema";

export async function GET() {
  const { schemaText } = await loadPromptBundle("model_builder_v1");
  const schema = parseSchema(schemaText);
  return NextResponse.json(schema);
}

export async function POST(req: NextRequest) {
  const { schemaText } = await loadPromptBundle("model_builder_v1");
  const schema = parseSchema(schemaText);
  try {
    const { state } = JSON.parse(await req.text() || "{}");
    const c = coveragePct(schema, state || {});
    return NextResponse.json({ coverage: c });
  } catch {
    return NextResponse.json({ coverage: 0 });
  }
}
