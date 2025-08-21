import { readFile } from "fs/promises";
import path from "path";

export async function loadPromptBundle(key = "model_builder_v1") {
  const p = path.join(process.cwd(), "data", "prompts", `${key}.json`);
  const txt = await readFile(p, "utf8");
  const bundle = JSON.parse(txt);
  return {
    orchestrator: String(bundle.orchestrator || ""),
    heuristics: String(bundle.heuristics || ""),
    guardrails: String(bundle.guardrails || ""),
    schemaText: String(bundle.schemaText || "")
  };
}
