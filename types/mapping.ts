export type SubtopicStatus = "answered" | "na";

export interface MappedDataPoint {
  original: string;
  refined: string;
}

export interface MappedSubtopic {
  subtopicId: string;
  title: string;
  status: SubtopicStatus;
  reason?: string;
  dataPoints: MappedDataPoint[];
}

export interface MappedTopic {
  topicId: string;
  title: string;
  completion?: { answered: number; total: number; percent: number }; // may be computed
  subtopics: MappedSubtopic[];
}

export interface MappingResult {
  version: "1.0";
  summary: string;
  topics: MappedTopic[];
}

// Business Plan Structure Types (for the template/schema)
export interface BusinessPlanSubtopic {
  subtopicId: string;
  title: string;
  keyQuestions: string[];
}

export interface BusinessPlanTopic {
  topicId: string;
  title: string;
  subtopics: BusinessPlanSubtopic[];
}

export interface BusinessPlanStructure {
  topics: BusinessPlanTopic[];
}
