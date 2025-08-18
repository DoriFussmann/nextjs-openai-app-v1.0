// lib/progress-helpers.ts
import type { ModelResponse, Topic, Subtopic } from "@/types/progress";

export const NA_VALUES = new Set([
  "not available",
  "n/a",
  "na",
  "none",
  "unknown",
  "null",
  "undefined",
  "",
  "tbd",
  "to be determined",
  "pending",
  "no data",
  "no information",
  "missing"
]);

export function isAnswered(v?: string): boolean {
  if (!v) return false;
  const norm = v.trim().toLowerCase();
  const result = norm.length > 0 && !NA_VALUES.has(norm);
  
  // Debug logging to see what values we're getting
  console.log(`isAnswered("${v}") -> normalized: "${norm}" -> result: ${result}`);
  
  return result;
}
