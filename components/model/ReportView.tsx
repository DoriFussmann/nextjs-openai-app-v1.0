// components/model/ReportView.tsx
"use client";

import React, { useState } from "react";
import { useModelState } from "./ModelStateProvider";
import { buildReport } from "@/lib/model/report";

export default function ReportView() {
  const { state } = useModelState();
  const [show, setShow] = useState(false);
  if (!state) return null;

  const report = buildReport(state);

  function download() {
    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `model_report_${new Date().toISOString().slice(0,10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mt-6 border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold">Final Report</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShow(!show)}
            className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
          >
            {show ? "Hide" : "Show"}
          </button>
          <button
            onClick={download}
            className="px-3 py-1.5 rounded bg-gray-600 text-white text-sm hover:bg-gray-700"
          >
            Download
          </button>
        </div>
      </div>
      {show && (
        <pre className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded max-h-96 overflow-y-auto">
          {report}
        </pre>
      )}
    </div>
  );
}

