"use client";

import React, { useState } from "react";
import type { MappingResult, MappedTopic } from "@/types/mapping";
import { Progress } from "@/components/Progress";
import { ChevronDown, ChevronRight, CheckCircle, XCircle } from "lucide-react";

const TopicCard: React.FC<{ topic: MappedTopic }> = ({ topic }) => {
  const [open, setOpen] = useState(false);
  const answered = topic.completion?.answered ?? 0;
  const total = topic.completion?.total ?? topic.subtopics.length;
  const percent = topic.completion?.percent ?? Math.round((answered / Math.max(1,total)) * 100);

  return (
    <div className="border rounded-2xl p-4 bg-white shadow-sm h-fit">
      <button
        className="w-full flex items-center justify-between"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="text-left flex-1 min-w-0">
          <h3 className="text-lg font-normal truncate">{topic.title}</h3>
          <div className="mt-2">
            <Progress percent={percent} />
          </div>
        </div>
        <div className="ml-2 flex-shrink-0">
          {open ? <ChevronDown /> : <ChevronRight />}
        </div>
      </button>

      {open && (
        <div className="mt-4 grid grid-cols-1 gap-3">
          {topic.subtopics.map((s) => {
            const isAnswered = s.status === "answered";
            return (
              <div key={s.subtopicId} className="border rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  {isAnswered ? (
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  )}
                  <div className="font-normal text-sm">{s.title}</div>
                </div>

                {isAnswered ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {s.dataPoints.map((dp, idx) => (
                      <li key={idx}>
                        <div className="text-sm leading-relaxed">{dp.refined}</div>
                        <div className="text-sm text-gray-500">Original: {dp.original}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-gray-600">
                    NA{ s.reason ? ` — ${s.reason}` : "" }
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const CompanyAnalysis: React.FC<{ data: MappingResult | null }> = ({ data }) => {
  if (!data) return null;
  return (
    <div className="space-y-6">
      <div className="border rounded-2xl p-4 bg-white shadow-sm">
        <h2 className="text-lg font-normal mb-2">Summary</h2>
        <p className="text-sm text-gray-800">{data.summary}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.topics.map((t) => (
          <TopicCard key={t.topicId} topic={t} />
        ))}
      </div>
    </div>
  );
};

