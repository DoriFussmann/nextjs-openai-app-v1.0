import Bottleneck from "bottleneck";
import pdfParse from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

/**
 * Throttle so we stay below RPM/TPM caps; adjust slowly upward once stable.
 * maxConcurrent: 1 ⇒ strictly sequential; minTime: 150ms ⇒ ~6–8 RPM effective.
 */
const limiter = new Bottleneck({ maxConcurrent: 1, minTime: 150 });

/** Exponential backoff that honors Retry-After if present. */
async function withRetry<T>(fn: () => Promise<T>, max = 5): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status;
      const retryAfterHeader =
        err?.response?.headers?.get?.("retry-after") ??
        err?.headers?.get?.("retry-after");
      const retryAfterMs = retryAfterHeader ? Number(retryAfterHeader) * 1000 : 0;

      if ((status === 429 || status >= 500) && attempt < max) {
        const backoff = Math.min(30000, 500 * 2 ** attempt);
        await new Promise(r => setTimeout(r, Math.max(backoff, retryAfterMs)));
        attempt++;
        continue;
      }
      throw err;
    }
  }
}

export async function processPdfLC({
  fileBuffer,
  model = "gpt-4o-mini",
  systemPrompt = "Extract the text faithfully. Fix obvious OCR noise only. Do not invent content.",
  userPromptPrefix = "Return clean plain text with simple section breaks.",
  chunkSizeChars = 8000,     // ~2k tokens (safe & cheap)
  chunkOverlapChars = 800,   // ~10% overlap for continuity
}: {
  fileBuffer: Buffer;
  model?: string;
  systemPrompt?: string;
  userPromptPrefix?: string;
  chunkSizeChars?: number;
  chunkOverlapChars?: number;
}) {
  // 1) Parse PDF locally (no tokens used yet)
  const { text } = await pdfParse(fileBuffer);

  // 2) Split into token-safe chunks (character-based keeps deps simple & stable)
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: chunkSizeChars,
    chunkOverlap: chunkOverlapChars,
    separators: ["\n\n", "\n", " ", ""],
  });
  const chunks = await splitter.splitText(text);

  // 3) Model setup
  const chat = new ChatOpenAI({
    model,
    apiKey: process.env.OPENAI_API_KEY,
    // You can set a conservative timeout to prevent stuck calls:
    // timeout: 120000,
  });

  // 4) Process each chunk under throttle + retry
  const partials: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const idx = i;
    const chunk = chunks[i];
    const piece = await limiter.schedule(() =>
      withRetry(async () => {
        const res = await chat.invoke([
          new SystemMessage(systemPrompt),
          new HumanMessage(`${userPromptPrefix}\n\n---\n${chunk}`),
        ]);
        const out = typeof res.content === "string"
          ? res.content
          : (Array.isArray(res.content)
              ? res.content.map((c: any) => c?.text ?? "").join("\n")
              : "");
        return out.trim();
      })
    );
    partials.push(piece);
  }

  // 5) Optional final light normalization (cheap; helps dedupe joins)
  const finalJoin = partials.join("\n\n----\n\n");

  return {
    chunksProcessed: chunks.length,
    text: finalJoin.trim(),
  };
}

