// components/model/ExportButton.tsx
"use client";

import React, { useState } from "react";
import { useModelState } from "./ModelStateProvider";
import { exportModelState } from "@/lib/model/export";

export default function ExportButton() {
  const { state } = useModelState();
  const [downloading, setDownloading] = useState(false);

  if (!state) return null;

  async function handleExport() {
    if (!state) return;
    setDownloading(true);
    try {
      const payload = exportModelState(state);
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `model_export_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={downloading}
      className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
    >
      {downloading ? "Preparing…" : "Export Model JSON"}
    </button>
  );
}
