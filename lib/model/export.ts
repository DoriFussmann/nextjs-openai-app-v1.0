// lib/model/export.ts
import type { ModelState } from "./types";

export function exportModelState(state: ModelState): any {
  return {
    generatedAt: new Date().toISOString(),
    companyData: state.companyData,
    crossSignals: state.crossSignals,
    topics: state.topics.map(t => ({
      id: t.id,
      name: t.name,
      completionPct: t.completionPct,
      readyToModel: t.readyToModel,
      narrative: t.narrative,
      keyQuestions: t.keyQuestions.map(q => ({
        id: q.id,
        text: q.text,
        required: q.required,
        satisfied: q.satisfied,
        evidence: q.evidence,
      })),
    })),
  };
}

