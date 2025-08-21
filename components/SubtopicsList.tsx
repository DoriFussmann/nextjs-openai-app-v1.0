"use client";
import { useState } from "react";
import SubtopicItem from "./SubtopicItem";

type Subtopic = { id: string; label: string; text?: string };

export default function SubtopicsList({ items }: { items: Subtopic[] }) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(items.map((i) => [i.id, i.text ?? "N/A"]))
  );

  function handleChange(id: string, value: string) {
    setValues((v) => ({ ...v, [id]: value }));
    // TODO: persist to your local file/DB so it's committed to Git:
    // await fetch("/api/save-subtopics", { method: "POST", body: JSON.stringify({ values: v2 }) })
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {items.map((it) => (
        <SubtopicItem
          key={it.id}
          id={it.id}
          label={it.label}
          initialText={values[it.id]}
          onChange={handleChange}
        />
      ))}
    </div>
  );
}
