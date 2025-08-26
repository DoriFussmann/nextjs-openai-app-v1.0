"use client";

import React from "react";
import type { Topic } from "@/lib/model/types";

type Props = {
  topics: Topic[];
  activeTopicId?: string;
  onSelect: (id: string) => void;
};

export default function TopicsTable({ topics, activeTopicId, onSelect }: Props) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
        All Topics
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="py-2 pr-3 font-medium">Topic</th>
              <th className="py-2 pr-3 font-medium w-40">Progress</th>
              <th className="py-2 pr-3 font-medium w-32">Ready to Model</th>
              <th className="py-2 pr-3 font-medium w-24">Action</th>
            </tr>
          </thead>
          <tbody>
            {topics.map((t) => {
              const active = t.id === activeTopicId;
              return (
                <tr key={t.id} className={active ? "bg-blue-50" : ""}>
                  <td className="py-2 pr-3">
                    <div className="font-medium">{t.name}</div>
                  </td>
                  <td className="py-2 pr-3">
                    <div className="w-full bg-gray-100 h-2 rounded">
                      <div
                        className="h-2 rounded"
                        style={{ 
                          width: `${t.completionPct ?? 0}%`,
                          backgroundColor: t.readyToModel ? "#16a34a" : "#2563eb"
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {t.completionPct ?? 0}%
                    </div>
                  </td>
                  <td className="py-2 pr-3">
                    <span
                      className={[
                        "inline-flex items-center px-2 py-1 rounded text-xs border",
                        t.readyToModel
                          ? "bg-green-50 text-green-700 border-green-300"
                          : "bg-gray-50 text-gray-600 border-gray-200",
                      ].join(" ")}
                    >
                      {t.readyToModel ? "✅ Ready" : "—"}
                    </span>
                  </td>
                  <td className="py-2 pr-3">
                    <button
                      onClick={() => onSelect(t.id)}
                      className="px-3 py-1.5 rounded border border-gray-200 text-gray-800 hover:bg-gray-100"
                    >
                      Switch
                    </button>
                  </td>
                </tr>
              );
            })}
            {topics.length === 0 && (
              <tr>
                <td className="py-2 pr-3 text-gray-500" colSpan={4}>
                  No topics loaded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
