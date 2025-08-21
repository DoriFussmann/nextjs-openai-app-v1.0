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

export function buildModelBuilderPrompt(bundle: {
  orchestrator: string;
  heuristics: string;
  guardrails: string;
  schemaText: string;
}, companyData?: string) {
  // Replace the schema placeholder in the orchestrator
  let completePrompt = bundle.orchestrator.replace('{{SCHEMA_TEXT}}', bundle.schemaText);
  
  // Combine all components
  let fullPrompt = '';
  
  // Add guardrails first to set the tone
  if (bundle.guardrails) {
    fullPrompt += bundle.guardrails + '\n\n';
  }
  
  // Add heuristics for decision-making guidance
  if (bundle.heuristics) {
    fullPrompt += bundle.heuristics + '\n\n';
  }
  
  // Add the main orchestrator prompt
  fullPrompt += completePrompt;
  
  // Add company data if provided
  if (companyData && companyData.trim()) {
    fullPrompt += '\n\nCOMPANY DATA:\n' + companyData;
  }
  
  return fullPrompt;
}
