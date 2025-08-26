// lib/model/parseTopics.ts
import type { Topic, KeyQuestion } from "./types";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 60);
}

/**
 * Parse a markdown-like prompt into Topic[]:
 * - "## <Topic Name>" starts a topic
 * - "- ..." lines under a topic are questions
 * - "(req)" anywhere in a question marks it required
 */
export function parseTopicsFromPrompt(md: string): Topic[] {
  const lines = md.split(/\r?\n/);
  const topics: Topic[] = [];
  let currentTopic: Topic | null = null;

  for (let raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const topicMatch = /^##\s+(.+?)\s*$/.exec(line);
    if (topicMatch) {
      const name = topicMatch[1].trim();
      const id = slugify(name);
      currentTopic = {
        id,
        name,
        keyQuestions: [],
        summaryFacts: {},
        narrative: "",
        completionPct: 0,
        readyToModel: false,
      };
      topics.push(currentTopic);
      continue;
    }

    if (currentTopic && line.startsWith("-")) {
      const qText = line.replace(/^-+\s*/, "").trim();
      const required = /\(req\)/i.test(qText);
      const cleanText = qText.replace(/\(req\)/ig, "").trim();

      const kq: KeyQuestion = {
        id: slugify(cleanText).slice(0, 64),
        text: cleanText,
        required,
        evidence: [],
        satisfied: false,
      };
      currentTopic.keyQuestions.push(kq);
    }
  }

  // Filter out any topics that accidentally had no questions
  return topics.filter(t => t.keyQuestions.length > 0);
}
