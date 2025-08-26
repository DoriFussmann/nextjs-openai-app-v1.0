// lib/model/import.ts
import type { ModelState } from "./types";
import { recomputeAll } from "./types";

/**
 * Validate and restore a ModelState JSON (from export).
 * Ensures progress bars & flags are recomputed.
 */
export function importModelState(payload: any): ModelState | null {
  try {
    if (!payload || !Array.isArray(payload.topics)) return null;

    const state: ModelState = {
      topics: payload.topics,
      activeTopicId: payload.activeTopicId || payload.topics[0]?.id,
      crossSignals: payload.crossSignals || {},
      companyData: payload.companyData || {},
      consecutiveFollowups: payload.consecutiveFollowups || 0,
    };
    return recomputeAll(state);
  } catch {
    return null;
  }
}

