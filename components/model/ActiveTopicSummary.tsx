// components/model/ActiveTopicSummary.tsx
"use client";

import React from "react";
import type { Topic } from "@/lib/model/types";

type Props = {
  topic?: Topic;
  unmet?: string[]; // optional: list of still-needed questions
};

export default function ActiveTopicSummary({ topic, unmet = [] }: Props) {
  if (!topic) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="text-sm text-gray-500">Select a topic to begin.</div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">{topic.name}</h2>
        <div className="text-sm">
          <span className="font-medium">{topic.completionPct ?? 0}%</span>{" "}
          complete
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 h-2 rounded mb-3">
        <div
          className="h-2 bg-blue-600 rounded"
          style={{ width: `${topic.completionPct ?? 0}%` }}
        />
      </div>

      {/* Narrative */}
      <div className="prose prose-sm max-w-none">
        {topic.narrative ? (
          <p className="text-gray-800">{topic.narrative}</p>
        ) : (
          <p className="text-gray-500 italic">
            As you answer, we'll summarize the key points of <b>{topic.name}</b>{" "}
            here.
          </p>
        )}
      </div>

      {/* What we still need */}
      {unmet.length > 0 && (
        <div className="mt-4">
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
            What we still need
          </div>
          <ul className="list-disc ml-5 text-sm text-gray-700">
            {unmet.map((u) => (
              <li key={u} title="Answer this to mark complete">{u}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
