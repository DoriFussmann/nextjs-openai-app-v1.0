// lib/model/types.ts

export type TopicId = string;

export type Evidence = {
  source: "company_data" | "chat";
  key: string;                           // e.g., "pricing_markup"
  value: string | number | boolean | null;
  confidence: number;                    // 0..1
};

export type KeyQuestion = {
  id: string;
  text: string;
  required: boolean;
  evidence: Evidence[];
  satisfied: boolean;                    // computed from evidence
};

export type Topic = {
  id: TopicId;
  name: string;
  keyQuestions: KeyQuestion[];
  summaryFacts: Record<string, string | number | boolean>;
  narrative: string;                     // human-readable summary assembled from summaryFacts
  completionPct: number;                 // 0..100 (computed)
  readyToModel: boolean;                 // computed threshold
};

export type CrossSignal = {
  value: any;
  source: string;                        // which rule or parse produced this
  topicId?: TopicId;
};

export type ModelState = {
  topics: Topic[];
  activeTopicId: TopicId;
  crossSignals: Record<string, CrossSignal>;
  companyData: any;                      // normalized Data Mapper payload later
  lastAskedQuestionId?: string;
  consecutiveFollowups?: number;         // pacing limiter
};

/**
 * Internal helper: determines if any evidence item is "strong" enough
 * to satisfy a question.
 */
function hasStrongEvidence(q: KeyQuestion): boolean {
  return q.evidence.some((ev) => {
    const hasValue =
      ev.value !== null &&
      ev.value !== undefined &&
      (typeof ev.value !== "string" || ev.value.trim() !== "");
    return hasValue && ev.confidence >= 0.7;
  });
}

/**
 * Recompute a single question's satisfaction flag from its evidence.
 */
export function recomputeQuestion(q: KeyQuestion): KeyQuestion {
  return { ...q, satisfied: hasStrongEvidence(q) };
}

/**
 * Compute completion % and ready flag for a topic (after questions are recomputed).
 */
export function computeTopicCompletion(t: Topic): Topic {
  const required = t.keyQuestions.filter((kq) => kq.required);
  const satisfied = required.filter((kq) => kq.satisfied);
  const completion = required.length ? satisfied.length / required.length : 1;
  const ready = completion >= 0.8 && required.every((kq) => kq.satisfied);
  return {
    ...t,
    completionPct: Math.round(completion * 100),
    readyToModel: ready,
  };
}

/**
 * Recompute a whole topic (questions -> satisfied, then completion metrics).
 */
export function recomputeTopic(t: Topic): Topic {
  const keyQuestions = t.keyQuestions.map(recomputeQuestion);
  return computeTopicCompletion({ ...t, keyQuestions });
}

/**
 * Recompute all topics and return a new state object.
 */
export function recomputeAll(state: ModelState): ModelState {
  const topics = state.topics.map(recomputeTopic);
  return { ...state, topics };
}

/**
 * Safely set the active topic (no-op if id not found).
 */
export function setActiveTopic(state: ModelState, id: TopicId): ModelState {
  const exists = state.topics.some((t) => t.id === id);
  return exists ? { ...state, activeTopicId: id } : state;
}
