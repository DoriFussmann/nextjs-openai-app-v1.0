"use client";
import { useState, useMemo } from "react";
import { MoreHorizontal } from "lucide-react";
import { useBusinessContext } from "@/stores/businessContext";

type Props = {
  id: string;
  label: string;
  initialText?: string; // original from schema/data load
  onChange?: (id: string, value: string) => void; // bubble up changes to parent/store
};

export default function SubtopicItem({ id, label, initialText = "", onChange }: Props) {
  const [value, setValue] = useState<string>(initialText || "N/A");
  const [editing, setEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [original] = useState<string>(initialText || "N/A");
  const bc = useBusinessContext((s) => s.context);

  const isNA = value.trim().toUpperCase() === "N/A";

  async function handleAiModify() {
    try {
      setLoading(true);
      const res = await fetch("/api/ai-modify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: value === "N/A" ? "" : value,
          businessContext: bc
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "AI modify failed");
      const newText = (data?.text || "").trim();
      if (newText) {
        setValue(newText);
        onChange?.(id, newText);
        setEditing(false);
      }
    } catch (e) {
      console.error(e);
      // You can toast an error here
    } finally {
      setLoading(false);
    }
  }

  function handleEditToggle() {
    setEditing((e) => !e);
  }

  function handleMarkNA() {
    setValue("N/A");
    onChange?.(id, "N/A");
    setEditing(false);
  }

  function handleReset() {
    setValue(original || "N/A");
    onChange?.(id, original || "N/A");
    setEditing(false);
  }

  return (
    <div className="group relative rounded-2xl border border-gray-200 p-4 hover:shadow-sm transition">
      <div className="flex items-start justify-between">
        <div className="text-sm font-normal text-gray-700">{label}</div>

        {/* three dots, visible on hover or always on mobile */}
        <div className="opacity-0 group-hover:opacity-100 transition">
          <Menu
            disabled={loading}
            onAiModify={handleAiModify}
            onEditToggle={handleEditToggle}
            onMarkNA={handleMarkNA}
            onReset={handleReset}
          />
        </div>
      </div>

      <div className="mt-2">
        {editing ? (
          <textarea
            className="w-full min-h-[90px] rounded-lg border border-gray-300 p-3 text-sm outline-none focus:ring-2 focus:ring-gray-400"
            value={isNA ? "" : value}
            placeholder={isNA ? "Enter text…" : ""}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => {
              const v = value.trim() === "" ? "N/A" : value.trim();
              setValue(v);
              onChange?.(id, v);
              setEditing(false);
            }}
          />
        ) : (
          <p className={`text-sm ${isNA ? "italic text-gray-400" : "text-gray-800"}`}>
            {isNA ? "N/A" : value}
          </p>
        )}
      </div>

      {loading && (
        <div className="absolute inset-0 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center text-sm">
          Processing…
        </div>
      )}
    </div>
  );
}

function Menu({
  disabled,
  onAiModify,
  onEditToggle,
  onMarkNA,
  onReset
}: {
  disabled?: boolean;
  onAiModify: () => void;
  onEditToggle: () => void;
  onMarkNA: () => void;
  onReset: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        aria-label="Open subtopic menu"
        className="p-2 rounded-full hover:bg-gray-100"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div
          className="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
          onMouseLeave={() => setOpen(false)}
        >
          <MenuItem label="AI-Modify" onClick={() => { setOpen(false); onAiModify(); }} disabled={disabled} />
          <MenuItem label="Edit Inline" onClick={() => { setOpen(false); onEditToggle(); }} />
          <MenuItem label="Mark N/A" onClick={() => { setOpen(false); onMarkNA(); }} />
          <MenuItem label="Reset to Original" onClick={() => { setOpen(false); onReset(); }} />
        </div>
      )}
    </div>
  );
}

function MenuItem({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50"
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
