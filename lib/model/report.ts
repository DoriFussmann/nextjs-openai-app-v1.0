// lib/model/report.ts
import type { ModelState } from "./types";
import { buildCashFlowPreview } from "./projection";

export function buildReport(state: ModelState): string {
  const lines: string[] = [];
  lines.push(`# Business Model Report`);
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push("");

  for (const t of state.topics) {
    lines.push(`## ${t.name}`);
    lines.push(`- Completion: ${t.completionPct}%`);
    lines.push(`- Ready: ${t.readyToModel ? "✅ Yes" : "❌ No"}`);
    if (t.narrative) {
      lines.push("");
      lines.push(t.narrative);
    }
    if (t.keyQuestions.some(q => q.satisfied)) {
      lines.push("");
      lines.push(`**Answered Questions:**`);
      for (const q of t.keyQuestions.filter(q => q.satisfied)) {
        lines.push(`- ${q.text}`);
      }
    }
    lines.push("");
  }

  const proj = buildCashFlowPreview(state);
  lines.push(`## Cash Flow Preview (v1)`);
  if (!proj.ready) {
    lines.push(`⚠️ Not all assumptions are ready. Notes:`);
    for (const r of proj.reasons) lines.push(`- ${r}`);
  }

  const header = ["Line Item", ...proj.months].join(" | ");
  const sep = ["---", ...proj.months.map(() => "---")].join(" | ");
  lines.push("");
  lines.push(header);
  lines.push(sep);
  for (const [name, arr] of Object.entries(proj.rows)) {
    const row = [name, ...arr.map(v => Math.round(v).toLocaleString())].join(" | ");
    lines.push(row);
  }

  return lines.join("\n");
}

