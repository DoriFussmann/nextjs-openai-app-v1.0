import type { ModelResponse } from "@/types/progress";
import { isAnswered } from "./progress-helpers";

export type TopicProgress = {
  topic: string;
  totalSub: number;
  answeredSub: number;
  percent: number; // 0-100
};

export type ProgressSummary = {
  totalSubtopics: number;
  answeredSubtopics: number;
  coveragePercent: number; // 0-100
};

export function calcProgress(resp: ModelResponse): {
  topics: TopicProgress[];
  summary: ProgressSummary;
} {
  // Defensive check for invalid input
  if (!resp || !resp.topics || !Array.isArray(resp.topics)) {
    return {
      topics: [],
      summary: {
        totalSubtopics: 0,
        answeredSubtopics: 0,
        coveragePercent: 0
      }
    };
  }

  let total = 0;
  let answered = 0;

  const topics = resp.topics.map((t) => {
    // Defensive check for subtopics
    if (!t || !t.subtopics || !Array.isArray(t.subtopics)) {
      console.warn('Invalid topic structure:', t);
      return {
        topic: t?.topic || 'Unknown Topic',
        totalSub: 0,
        answeredSub: 0,
        percent: 0
      };
    }

    console.log(`Processing topic: "${t.topic}"`);
    console.log('Subtopics:', t.subtopics);

    const totalSub = t.subtopics.length;
    const answeredSub = t.subtopics.filter((s) => {
      if (!s) {
        console.log('  - Null/undefined subtopic');
        return false;
      }
      console.log(`  - Subtopic "${s.name}": "${s.value}"`);
      const result = isAnswered(s.value);
      console.log(`    -> isAnswered result: ${result}`);
      return result;
    }).length;
    
    total += totalSub;
    answered += answeredSub;
    const percent = totalSub ? Math.round((answeredSub / totalSub) * 100) : 0;
    
    console.log(`Topic "${t.topic}" - Total: ${totalSub}, Answered: ${answeredSub}, Percent: ${percent}%`);
    
    return { topic: t.topic, totalSub, answeredSub, percent };
  });

  const summary = {
    totalSubtopics: total,
    answeredSubtopics: answered,
    coveragePercent: total ? Math.round((answered / total) * 100) : 0
  };

  return { topics, summary };
}
