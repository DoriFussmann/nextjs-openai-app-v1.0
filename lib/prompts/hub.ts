// lib/prompts/hub.ts
import fs from "fs";
import path from "path";

type PromptEntry = {
  name: string;             // e.g., "Model Topic & Questions"
  category?: string;        // e.g., "Rupert's Prompts"
  key?: string;             // optional unique key
  content: string;          // the full prompt text
};

function readJson(filePath: string): any | null {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Searches all JSON files within /data/prompts for an entry whose
 * name EXACTLY matches the requested prompt name. Returns its content.
 */
export function getPromptContentByName(name: string): string | null {
  const promptsDir = path.join(process.cwd(), "data", "prompts");
  if (!fs.existsSync(promptsDir)) return null;

  const files = fs.readdirSync(promptsDir).filter(f => f.endsWith(".json"));

  for (const file of files) {
    const full = path.join(promptsDir, file);
    const data = readJson(full);
    if (!data) continue;

    // Common shapes supported:
    // 1) { prompts: PromptEntry[] }
    // 2) PromptEntry[]
    // 3) { [key: string]: PromptEntry | PromptEntry[] }
    // 4) { [key: string]: string } - simple key-value where key is name, value is content
    const candidates: PromptEntry[] = [];

    if (Array.isArray(data)) {
      candidates.push(...(data as PromptEntry[]));
    } else if (data && typeof data === "object") {
      if (Array.isArray(data.prompts)) {
        candidates.push(...data.prompts);
      }
      for (const k of Object.keys(data)) {
        const v = (data as any)[k];
        if (Array.isArray(v)) candidates.push(...v);
        else if (v && typeof v === "object" && "content" in v && "name" in v) {
          candidates.push(v as PromptEntry);
        }
        // Handle simple key-value structure where key is name, value is content
        else if (typeof v === "string" && k === name) {
          return v; // Direct match found
        }
      }
    }

    const match = candidates.find(
      p => p && typeof p.name === "string" && p.name.trim() === name.trim()
    );
    if (match?.content) return match.content;
  }

  return null;
}
