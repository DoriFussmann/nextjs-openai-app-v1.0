// lib/model/flow.ts
import type { ModelState } from "./types";

/**
 * Pick the next topic in order, or null if none left.
 */
export function pickNextTopic(state: ModelState): string | null {
  if (!state.topics?.length) return null;
  const idx = state.topics.findIndex(t => t.id === state.activeTopicId);
  if (idx < 0) return null;

  // find first not ready after current
  for (let i = idx + 1; i < state.topics.length; i++) {
    if (!state.topics[i].readyToModel) return state.topics[i].id;
  }
  // wrap around and find any incomplete before current
  for (let i = 0; i < idx; i++) {
    if (!state.topics[i].readyToModel) return state.topics[i].id;
  }
  return null;
}

/**
 * Check if all topics are ready.
 */
export function allTopicsReady(state: ModelState): boolean {
  return state.topics.every(t => t.readyToModel);
}

