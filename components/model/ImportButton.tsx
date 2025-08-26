// components/model/ImportButton.tsx
"use client";

import React, { useRef } from "react";
import { useModelState } from "./ModelStateProvider";
import { importModelState } from "@/lib/model/import";

export default function ImportButton() {
  const { setState } = useModelState();
  const fileInput = useRef<HTMLInputElement>(null);

  function handleClick() {
    fileInput.current?.click();
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const json = JSON.parse(text);
      const imported = importModelState(json);
      if (imported) {
        setState(imported);
        alert("Model state restored successfully.");
      } else {
        alert("Invalid model export file.");
      }
    } catch {
      alert("Failed to parse JSON file.");
    }
    e.target.value = "";
  }

  return (
    <>
      <input
        ref={fileInput}
        type="file"
        accept="application/json"
        style={{ display: "none" }}
        onChange={handleChange}
      />
      <button
        onClick={handleClick}
        className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 text-sm"
      >
        Import Model JSON
      </button>
    </>
  );
}

