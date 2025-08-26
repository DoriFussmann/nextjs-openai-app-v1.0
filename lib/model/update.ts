// lib/model/update.ts
import type { ModelState, Topic, KeyQuestion, Evidence } from "./types";
import { recomputeTopic, recomputeAll } from "./types";
import { extractSignals } from "./extract";

type UpdateOpts = {
  activeTopicId: string;
  userMessage: string;
  companyData?: any;
};

/**
 * Heuristic: decide which question an answer likely satisfies.
 * Priority: match by known question IDs (if you keep IDs stable),
 * otherwise simple keyword match on question text.
 */
function pickTargetQuestion(
  topic: Topic,
  signals: Record<string, any>,
  text: string,
  crossHints?: Record<string, string[]>
): KeyQuestion | null {
  // 1) If hints exist for this topic, try those first
  if (crossHints && crossHints[topic.id]) {
    for (const qid of crossHints[topic.id]) {
      const kq = topic.keyQuestions.find(q => q.id === qid && !q.satisfied);
      if (kq) return kq;
    }
  }

  // 2) Strong ID-based priority
  const byIdPriority = [
    "rev_price", "rev_volume_driver", "rev_cycle_or_churn",
    "bm_what_sell", "bm_how_charge",
    "cogs_model", "cogs_components",
    "tp_current_headcount", "tp_hiring_plan",
    "ca_cac", "ca_paid_spend", "ca_funnel"
  ];
  for (const id of byIdPriority) {
    const kq = topic.keyQuestions.find(q => q.id === id && !q.satisfied);
    if (kq) return kq;
  }

  // 3) Keyword-based fallback
  const pairs: Array<[RegExp, string[]]> = [
    [/price|arpu|aov|markup|per[- ]?unit/i, ["price","arpu","aov","markup"]],
    [/lead|volume|orders|subs|win rate|conversion/i, ["volume","lead","orders","subs","conversion"]],
    [/churn|sales cycle|cycle/i, ["churn","cycle"]],
    [/cogs|direct|materials|fulfillment|fees|delivery/i, ["cogs","direct"]],
    [/cac|acquisition|ad spend|paid/i, ["cac","acquisition","paid"]],
    [/headcount|hiring|payroll|fte|contractor/i, ["headcount","hiring"]],
  ];

  for (const [re, _tags] of pairs) {
    if (re.test(text)) {
      const kq = topic.keyQuestions.find(q => !q.satisfied && re.test(q.text));
      if (kq) return kq;
    }
  }

  // 4) Fallback: first unmet required question
  return topic.keyQuestions.find(q => q.required && !q.satisfied) || null;
}

function evidenceFromSignals(signals: Record<string, any>, text: string): Evidence[] {
  const evs: Evidence[] = [];

  if (signals["money_1"] !== undefined) {
    evs.push({ source: "chat", key: "price_or_aov", value: signals["money_1"], confidence: 0.8 });
  }
  if (signals["pct_1"] !== undefined) {
    evs.push({ source: "chat", key: "percentage", value: signals["pct_1"], confidence: 0.8 });
  }
  if (signals["sales_cycle_months"] !== undefined) {
    evs.push({ source: "chat", key: "sales_cycle_months", value: signals["sales_cycle_months"], confidence: 0.8 });
  }
  if (signals["sales_cycle_days"] !== undefined) {
    evs.push({ source: "chat", key: "sales_cycle_days", value: signals["sales_cycle_days"], confidence: 0.8 });
  }
  if (signals["revenue_model"]) {
    evs.push({ source: "chat", key: "revenue_model", value: signals["revenue_model"], confidence: 0.8 });
  }
  if (signals["lead_source"]) {
    evs.push({ source: "chat", key: "lead_source", value: signals["lead_source"], confidence: 0.8 });
  }
  if (signals["mentions_cac"]) {
    evs.push({ source: "chat", key: "mentions_cac", value: true, confidence: 0.7 });
  }
  if (signals["mentions_churn"]) {
    evs.push({ source: "chat", key: "mentions_churn", value: true, confidence: 0.7 });
  }

  // Always include raw text as weak evidence to avoid overfitting
  evs.push({ source: "chat", key: "raw_text", value: text, confidence: 0.6 });

  return evs;
}

/**
 * Update model state with a single user message.
 * - chooses a target question in the active topic
 * - appends evidence
 * - recomputes completion
 * - updates cross-signals
 */
export function updateStateFromUserMessage(
  prev: ModelState,
  opts: UpdateOpts & { crossHints?: Record<string, string[]> }
): ModelState {
  const { activeTopicId, userMessage, crossHints } = opts;
  const topicIdx = prev.topics.findIndex(t => t.id === activeTopicId);
  if (topicIdx < 0) return prev;

  const signals = extractSignals(userMessage);
  const target = pickTargetQuestion(prev.topics[topicIdx], signals, userMessage, crossHints);
  const topics = [...prev.topics];

  if (target) {
    const t = { ...topics[topicIdx] };
    const kqi = t.keyQuestions.findIndex(q => q.id === target.id);
    const evs = evidenceFromSignals(signals, userMessage);
    const merged = { ...t.keyQuestions[kqi], evidence: [...t.keyQuestions[kqi].evidence, ...evs] };
    t.keyQuestions = [
      ...t.keyQuestions.slice(0, kqi),
      merged,
      ...t.keyQuestions.slice(kqi + 1),
    ];
    topics[topicIdx] = recomputeTopic(t);
  }

  // Merge cross signals
  const crossSignals = { ...prev.crossSignals };
  for (const [k, v] of Object.entries(signals)) {
    crossSignals[k] = { value: v, source: "user_message", topicId: activeTopicId };
  }

  // Pacing: increment consecutiveFollowups if same topic, else reset
  let consecutive = prev.consecutiveFollowups ?? 0;
  if (target) {
    consecutive = (prev.activeTopicId === activeTopicId) ? consecutive + 1 : 1;
  } else {
    consecutive = 0;
  }

  const next = {
    ...prev,
    topics,
    crossSignals,
    lastAskedQuestionId: target?.id,
    consecutiveFollowups: consecutive,
  };

  return recomputeAll(next);
}

/**
 * Compute unmet required questions for a given topic.
 */
export function unmetQuestions(topic: Topic): string[] {
  return topic.keyQuestions
    .filter(q => q.required && !q.satisfied)
    .map(q => q.text);
}

/**
 * Map cross-signals into follow-up prompts for other topics.
 * This gives the engine "hints" about what to ask next.
 */
export function deriveCrossTopicHints(crossSignals: Record<string, any>): Record<string, string[]> {
  const hints: Record<string, string[]> = {};

  if (crossSignals["lead_source"]?.value === "paid") {
    hints["customer_acquisition"] = ["ca_cac", "ca_paid_spend"];
  }
  if (crossSignals["revenue_model"]?.value === "subscription") {
    hints["revenue"] = ["rev_cycle_or_churn"];
  }
  if (crossSignals["mentions_churn"]?.value) {
    hints["revenue"] = ["rev_cycle_or_churn"];
  }
  if (crossSignals["mentions_cac"]?.value) {
    hints["customer_acquisition"] = ["ca_cac"];
  }
  if (crossSignals["percentage"]?.value && crossSignals["percentage"].topicId === "cogs") {
    hints["working_capital"] = ["wc_inventory_turns"];
  }

  return hints;
}
