// lib/model/narrative.ts
import type { Topic } from "./types";

/**
 * Tiny narrative composer: use a few common facts if present.
 * Expand later as needed.
 */
export function renderNarrative(topic: Topic): string {
  const f = topic.summaryFacts || {};

  // Fallback: try to infer from evidence on satisfied questions
  const hints: Record<string, string> = {};

  for (const q of topic.keyQuestions) {
    for (const ev of q.evidence) {
      if (ev.key === "revenue_model" && typeof ev.value === "string") hints["revenue_model"] = ev.value;
      if (ev.key === "lead_source" && typeof ev.value === "string") hints["lead_source"] = ev.value;
      if (ev.key === "price_or_aov" && typeof ev.value === "number") hints["price_or_aov"] = `$${ev.value}`;
      if (ev.key === "percentage" && typeof ev.value === "number") hints["percentage"] = `${ev.value}%`;
      if (ev.key === "sales_cycle_months" && typeof ev.value === "number") hints["sales_cycle_months"] = `${ev.value} months`;
      if (ev.key === "sales_cycle_days" && typeof ev.value === "number") hints["sales_cycle_days"] = `${ev.value} days`;
    }
  }

  // Build a short line depending on topic
  switch (topic.id) {
    case "business_model": {
      const model = hints["revenue_model"] ? `Revenue model: ${hints["revenue_model"]}. ` : "";
      const lead = hints["lead_source"] ? `Primary acquisition: ${hints["lead_source"]}. ` : "";
      return (model + lead).trim() || topic.narrative || "";
    }
    case "revenue": {
      const price = hints["price_or_aov"] ? `Price/AOV ~ ${hints["price_or_aov"]}. ` : "";
      const cycM = hints["sales_cycle_months"] ? `Sales cycle ${hints["sales_cycle_months"]}. ` : "";
      const cycD = !hints["sales_cycle_months"] && hints["sales_cycle_days"] ? `Sales cycle ${hints["sales_cycle_days"]}. ` : "";
      return (price + (cycM || cycD)).trim() || topic.narrative || "";
    }
    case "cogs": {
      const pct = hints["percentage"] ? `COGS approx ${hints["percentage"]}. ` : "";
      return (pct).trim() || topic.narrative || "";
    }
    default:
      // Keep previous narrative if nothing new
      return topic.narrative || "";
  }
}

/**
 * Apply narrative rendering onto a topic (mutates fields immutably).
 */
export function withNarrative(topic: Topic): Topic {
  const narrative = renderNarrative(topic);
  if (narrative && narrative !== topic.narrative) {
    return { ...topic, narrative };
  }
  return topic;
}
