"use client";

import React, { useState } from "react";
import { useModelState } from "./ModelStateProvider";

export default function ExportPDFButton() {
  const { state } = useModelState();
  const [downloading, setDownloading] = useState(false);

  async function handleExport() {
    if (!state) return;
    setDownloading(true);
    try {
      const res = await fetch("/api/model-builder/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelState: state }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Model_Report.pdf";
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
      className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
    >
      {downloading ? "Preparing…" : "Export PDF"}
    </button>
  );
}

