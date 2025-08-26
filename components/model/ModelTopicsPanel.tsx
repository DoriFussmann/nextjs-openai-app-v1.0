// components/model/ModelTopicsPanel.tsx
"use client";

import React, { useMemo } from "react";
import ActiveTopicSummary from "./ActiveTopicSummary";
import TopicsTable from "./TopicsTable";
import CashFlowPreview from "./CashFlowPreview";
import ReportView from "./ReportView";
import ExportButton from "./ExportButton";
import ImportButton from "./ImportButton";
import ExportPDFButton from "./ExportPDFButton";
import ResetButton from "./ResetButton";
import { useModelState } from "./ModelStateProvider";

export default function ModelTopicsPanel() {
  const { state, selectTopic, loading, error } = useModelState();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="text-sm text-gray-600">Loading topics…</div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="space-y-4">
        <div className="border border-red-200 rounded-lg p-4 bg-red-50 text-red-800">
          Failed to load topics. {error}
        </div>
      </div>
    );
  }
  if (!state) return null;

  const activeTopic = state.topics.find((t) => t.id === state.activeTopicId);
  // Instead, read from API response in state if available.
  // For now, we just peek at modelState (we'll store unmet in it soon).
  const unmet: string[] = (activeTopic as any)?.unmetQuestions || [];

  return (
    <div className="space-y-4">
      <ActiveTopicSummary topic={activeTopic} unmet={unmet} />
      <TopicsTable
        topics={state.topics}
        activeTopicId={state.activeTopicId}
        onSelect={selectTopic}
      />
      <CashFlowPreview state={state} />
      {state.topics.every(t => t.readyToModel) && (
        <div className="border border-green-200 bg-green-50 text-green-800 rounded-lg p-3 text-sm">
          🎉 All topics ready — cash flow preview is based on complete inputs. You can now export or refine.
        </div>
      )}
      <ReportView />
      <div className="pt-4 flex gap-2">
        <ExportButton />
        <ImportButton />
        <ExportPDFButton />
        <ResetButton />
      </div>
    </div>
  );
}
