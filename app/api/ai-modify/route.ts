import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, businessContext } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Missing 'text'." }, { status: 400 });
    }

    const sys = [
      "You are an expert business editor.",
      "Goal: rewrite provided text to be professional, concise, sharp, and clear.",
      "Preserve meaning; do not add facts not present in the input or business context.",
      "Prefer direct, plain English suitable for executives.",
      "Return only the rewritten text. No preface, no bullets unless input was bullet-y."
    ].join(" ");

    const ctx = businessContext
      ? `\n\nBUSINESS CONTEXT:\n${JSON.stringify(businessContext)}`
      : "";

    const user = `Rewrite the following to be professional, concise, and sharp. Keep meaning.\n\nTEXT:\n${text}${ctx}`;

    // ---- OpenAI call (Works with OpenAI Node SDK v4 or fetch). Replace with your setup. ----
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // or your preferred model
        messages: [{ role: "system", content: sys }, { role: "user", content: user }],
        temperature: 0.2
      })
    });

    if (!resp.ok) {
      const e = await resp.text();
      return NextResponse.json({ error: e || "OpenAI error" }, { status: 500 });
    }

    const data = await resp.json();
    const out = data?.choices?.[0]?.message?.content?.trim();
    if (!out) return NextResponse.json({ error: "Empty model response" }, { status: 500 });

    return NextResponse.json({ text: out });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}
