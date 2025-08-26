// app/api/model-topics/route.ts
import { NextResponse } from "next/server";
import { getPromptContentByName } from "@/lib/prompts/hub";
import { parseTopicsFromPrompt } from "@/lib/model/parseTopics";

export async function GET() {
  try {
    const promptName = "Model Topic & Questions"; // exact name in Prompts Hub
    const content = getPromptContentByName(promptName);

    if (!content) {
      return NextResponse.json(
        { error: `Prompt "${promptName}" not found in data/prompts` },
        { status: 404 }
      );
    }

    const topics = parseTopicsFromPrompt(content);

    if (!topics.length) {
      return NextResponse.json(
        { error: `Prompt parsed to 0 topics. Check '##' and '-' formatting.` },
        { status: 422 }
      );
    }

    return NextResponse.json({ topics }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to load topics", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
