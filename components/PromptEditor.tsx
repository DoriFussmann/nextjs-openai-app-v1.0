"use client";
import { useEffect, useMemo, useState } from "react";
import { usePrompt, useUpdatePrompt, saveDraft, loadDraft } from "@/lib/usePrompts";
import toast from "react-hot-toast";

function useSoftLock(key: string) {
  const [readOnly, setReadOnly] = useState(false);
  const bc = useMemo(() => new BroadcastChannel("prompts-hub"), []);
  useEffect(() => {
    const my = { type: "lock", key, ts: Date.now() };
    bc.postMessage(my);
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === "lock" && e.data.key === key && e.data.ts !== my.ts) {
        setReadOnly(true);
      }
      if (e.data?.type === "unlock" && e.data.key === key) {
        setReadOnly(false);
      }
    };
    bc.addEventListener("message", onMsg);
    return () => {
      bc.postMessage({ type: "unlock", key });
      bc.removeEventListener("message", onMsg);
    };
  }, [bc, key]);
  return readOnly;
}

export function PromptEditor({ promptKey, onClose }: { promptKey: string; onClose?: () => void }) {
  const { data, isLoading, isError } = usePrompt(promptKey);
  const update = useUpdatePrompt();
  const [draft, setDraft] = useState<any>(null);
  const readOnly = useSoftLock(promptKey);

  // load server + local draft
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!data) return;
      const local = await loadDraft(promptKey);
      const base = local?.version && local.version >= data.version ? local : data;
      if (mounted) setDraft(base);
    })();
    return () => { mounted = false; };
  }, [data, promptKey]);

  // autosave after 1.5s idle
  useEffect(() => {
    if (!draft) return;
    const h = setTimeout(() => {
      saveDraft(promptKey, draft);
      if (!readOnly) {
        update.mutate({ ...draft, version: data?.version ?? draft.version ?? 0 }, {
          onError: (err: any) => {
            if (err?.status === 409) {
              toast.error("Version conflict. Reloading server version.");
            } else {
              toast.error("Save failed. Working locally; will retry.");
            }
          },
          onSuccess: () => {
            toast.success("Saved ✓");
          },
        });
      }
    }, 1500);
    return () => clearTimeout(h);
  }, [draft, promptKey, readOnly, update, data?.version]);

  // warn before unload if saving
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (update.isPending) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [update.isPending]);

  if (isLoading) return <div className="p-4">Loading…</div>;
  if (isError || !draft) return <div className="p-4 text-red-600">Failed to load prompt.</div>;

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{draft.title || draft.key}</h3>
        <div className="text-sm">
          {readOnly ? "Read-only (open in another tab)" :
            update.isPending ? "Saving…" : "Saved ✓"}
        </div>
      </div>
      <input
        className="w-full border rounded px-3 py-2"
        value={draft.title}
        readOnly={readOnly}
        onChange={(e) => setDraft((d: any) => ({ ...d, title: e.target.value }))}
      />
      <textarea
        className="w-full border rounded px-3 py-2 h-64"
        value={draft.body}
        readOnly={readOnly}
        onChange={(e) => setDraft((d: any) => ({ ...d, body: e.target.value }))}
      />
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="comma,separated,tags"
        value={(draft.tags ?? []).join(",")}
        readOnly={readOnly}
        onChange={(e) =>
          setDraft((d: any) => ({
            ...d,
            tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
          }))
        }
      />
      <div className="flex gap-2">
        <button
          className="border rounded px-3 py-2"
          onClick={() =>
            update.mutate(
              { ...draft, version: (data?.version ?? draft.version ?? 0) },
              {
                onSuccess: () => toast.success("Saved ✓"),
                onError: (err: any) => {
                  if (err?.status === 409) {
                    toast.error("Version conflict. Reloading server version.");
                  } else {
                    toast.error("Save failed. Working locally; will retry.");
                  }
                },
              }
            )
          }
          disabled={readOnly}
        >
          Save
        </button>
        <button className="border rounded px-3 py-2" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default PromptEditor;
