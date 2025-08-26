"use client";

import React from "react";
import { useModelState } from "./ModelStateProvider";

export default function ResetButton() {
  const { resetState } = useModelState();

  return (
    <button
      onClick={() => {
        if (confirm("Clear all progress and start fresh?")) resetState();
      }}
      className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
    >
      Reset Model
    </button>
  );
}

