"use client";
import { useEffect, useRef, useState } from "react";
import { useBusinessContext } from "@/stores/businessContext";
import SubtopicsList from "./SubtopicsList";

interface DataPoint {
  original: string;
  refined: string;
}

interface Subtopic {
  subtopicId: string;
  title: string;
  status: "answered" | "na";
  reason?: string;
  dataPoints: DataPoint[];
}

interface Topic {
  topicId: string;
  title: string;
  completion?: { answered: number; total: number; percent: number };
  subtopics: Subtopic[];
}

interface AnalysisResponse {
  version: string;
  summary: string;
  topics: Topic[];
}

export default function AnalysisOutput({ response, companyData }: { response: AnalysisResponse; companyData?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // helper for smooth scroll when topic box clicked
  const scrollToTopic = (topicId: string) => {
    const el = document.getElementById(`topic-${topicId}`);
    if (el && containerRef.current) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // expose scrollToTopic for external use (left-side topic boxes)
  useEffect(() => {
    (window as any).scrollToTopic = scrollToTopic;
  }, []);

  return (
    <div ref={containerRef} className="font-inter text-black space-y-6 p-4 overflow-y-auto">
      <h2 className="text-xl font-normal">Analysis Summary</h2>
      <p>{response.summary}</p>

      {response.topics.map((topic) => (
        <div key={topic.topicId} id={`topic-${topic.topicId}`} className="space-y-4">
          <h2 className="text-lg font-normal mt-6">{topic.title}</h2>
          {topic.completion && (
            <p className="text-sm text-gray-600">
              Completion: {topic.completion.answered}/{topic.completion.total} (
              {topic.completion.percent}%)
            </p>
          )}

          <SubtopicsList
            items={topic.subtopics.map((sub) => ({
              id: sub.subtopicId,
              label: sub.title,
              text: sub.status === "answered" && sub.dataPoints.length > 0 
                ? sub.dataPoints[0].refined 
                : undefined
            }))}
          />
        </div>
      ))}
    </div>
  );
}
