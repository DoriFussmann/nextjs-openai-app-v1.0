// lib/model/question.ts
import type { ModelState, Topic, KeyQuestion, Evidence } from "./types";
import { unmetQuestions as unmetRequired } from "./update";

function topicById(state: ModelState, id: string): Topic | undefined {
  return state.topics.find(t => t.id === id);
}

function findFirstUnmetRequired(topic: Topic): KeyQuestion | null {
  const kq = topic.keyQuestions.find(q => q.required && !q.satisfied);
  return kq || null;
}

function evidenceToFactStrings(topic: Topic): string[] {
  const set = new Set<string>();
  for (const q of topic.keyQuestions) {
    for (const ev of q.evidence) {
      if (ev.key === "price_or_aov" && typeof ev.value !== "undefined") set.add(`AOV/Price ≈ $${ev.value}`);
      if (ev.key === "volume_driver" && typeof ev.value !== "undefined") set.add(`Volume ≈ ${ev.value}/mo`);
      if (ev.key === "percentage" && typeof ev.value !== "undefined") set.add(`% ≈ ${ev.value}%`);
      if (ev.key === "revenue_model" && typeof ev.value === "string") set.add(`Model: ${ev.value}`);
      if (ev.key === "lead_source" && typeof ev.value === "string") set.add(`Acquisition: ${ev.value}`);
      if (ev.key === "sales_cycle_days" && typeof ev.value !== "undefined") set.add(`Sales cycle: ${ev.value} days`);
      if (ev.key === "sales_cycle_months" && typeof ev.value !== "undefined") set.add(`Sales cycle: ${ev.value} months`);
      if (ev.key === "headcount" && typeof ev.value !== "undefined") set.add(`Headcount baseline present`);
    }
  }
  return Array.from(set);
}

function companyDataFacts(state: ModelState): string[] {
  const cd = state.companyData || {};
  const facts: string[] = [];
  if (cd.avgOrderValue) facts.push(`AOV from Data Mapper: $${cd.avgOrderValue}`);
  if (cd.revenueModel) facts.push(`Revenue model from Data Mapper: ${cd.revenueModel}`);
  if (cd.salesCycleDays) facts.push(`Sales cycle from Data Mapper: ${cd.salesCycleDays} days`);
  if (cd.headcount) facts.push(`Headcount from Data Mapper: ${cd.headcount}`);
  if (cd.cogsPct != null) facts.push(`COGS% from Data Mapper: ${cd.cogsPct}%`);
  return facts;
}

/**
 * Build a concise assistant prompt:
 * - Mentions what we already know (evidence + company data)
 * - Asks the highest-priority unmet required question
 * - Keeps it single-shot and specific
 */
export function buildNextQuestion(state: ModelState, activeTopicId: string): { text: string; unmetList: string[] } {
  const topic = topicById(state, activeTopicId);
  if (!topic) return { text: "Which topic would you like to work on next?", unmetList: [] };

  const unmetList = unmetRequired(topic);
  const target = findFirstUnmetRequired(topic);

  const known = [
    ...companyDataFacts(state),
    ...evidenceToFactStrings(topic),
  ];
  const knownStr = known.length ? `From your data: ${known.slice(0, 3).join(" • ")}.` : "";

  const question = target
    ? `${knownStr} ${target.text}`
    : `${knownStr} Anything else you want to add for **${topic.name}**, or shall we proceed to the next topic?`;

  return { text: question.trim(), unmetList };
}

