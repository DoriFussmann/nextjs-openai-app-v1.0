// components/model/TopicSwitcher.tsx
"use client";

import React from "react";
import type { ModelState, Topic } from "@/lib/model/types";

type Props = {
  topics: Topic[];
  activeTopicId?: string;
  onSelect: (id: string) => void;
};

export default function TopicSwitcher({ topics, activeTopicId, onSelect }: Props) {
  if (!topics?.length) {
    return (
      <div className="border border-gray-200 rounded-lg p-3 bg-white">
        <div className="text-sm text-gray-500">No topics loaded yet.</div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white">
      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
        Topics
      </div>
      <div className="flex flex-wrap gap-2">
        {topics.map((t) => {
          const active = t.id === activeTopicId;
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className={[
                "px-3 py-2 rounded-full text-sm border",
                active
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100",
              ].join(" ")}
            >
              <span className="font-medium">{t.name}</span>
              <span className="ml-2 text-xs opacity-80">{t.completionPct ?? 0}%</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
