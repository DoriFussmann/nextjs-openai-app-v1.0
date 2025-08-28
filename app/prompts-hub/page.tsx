"use client";
import { usePromptsList } from "@/lib/usePrompts";
import { useState } from "react";
import dynamic from "next/dynamic";

const PromptEditor = dynamic(() => import("@/components/PromptEditor"), { ssr: false });

export default function PromptsHubPage() {
  const { data, isLoading, isError } = usePromptsList();
  const [openKey, setOpenKey] = useState<string | null>(null);

  if (isLoading) return <div className="p-4">Loading…</div>;
  if (isError) return <div className="p-4 text-red-600">Failed to load.</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Prompts Hub</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data?.map((p: any) => (
          <div key={p.key} className="border rounded p-3">
            <div className="font-semibold">{p.title || p.key}</div>
            <div className="text-sm opacity-70">v{p.version} · {Array.isArray(p.tags) ? p.tags.join(", ") : ""}</div>
            <button className="mt-2 border rounded px-3 py-1" onClick={() => setOpenKey(p.key)}>
              Edit
            </button>
          </div>
        ))}
      </div>

      {openKey && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-lg w-full max-w-2xl shadow">
            <PromptEditor promptKey={openKey} onClose={() => setOpenKey(null)} />
          </div>
        </div>
      )}
    </div>
  );
}

