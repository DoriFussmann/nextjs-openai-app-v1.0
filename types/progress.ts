// types/progress.ts
export type Subtopic = { name: string; value: string };
export type Topic = { topic: string; subtopics: Subtopic[] };
export type ModelResponse = { topics: Topic[] };

// Additional types for coverage computation
export type SubtopicCoverage = {
  name: string;
  value: string;
  isComplete: boolean;
  isEmpty: boolean;
};

export type TopicCoverage = {
  topic: string;
  subtopics: SubtopicCoverage[];
  completionRate: number; // 0-1
  totalSubtopics: number;
  completedSubtopics: number;
  emptySubtopics: number;
};

export type CoverageReport = {
  topics: TopicCoverage[];
  overallCompletionRate: number;
  totalTopics: number;
  totalSubtopics: number;
  totalCompletedSubtopics: number;
  totalEmptySubtopics: number;
};
