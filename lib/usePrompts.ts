import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { get, set } from "idb-keyval";

export function usePrompt(key: string) {
  return useQuery({
    queryKey: ["prompt", key],
    queryFn: async () => {
      const r = await fetch(`/api/prompts/${key}`, { cache: "no-store" });
      if (!r.ok) throw new Error("Failed to load prompt");
      return r.json();
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });
}

export function usePromptsList() {
  return useQuery({
    queryKey: ["prompts"],
    queryFn: async () => {
      const r = await fetch(`/api/prompts`, { cache: "no-store" });
      if (!r.ok) throw new Error("Failed to load prompts");
      return r.json();
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });
}

export function useUpdatePrompt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`/api/prompts/${payload.key}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "If-Match": `W/"${payload.version}"`,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err: any = new Error("Save failed");
        err.status = res.status;
        err.data = json;
        throw err;
      }
      return json;
    },
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: ["prompt", payload.key] });
      const prev = qc.getQueryData(["prompt", payload.key]);
      // optimistic: bump version by 1 visually
      qc.setQueryData(["prompt", payload.key], (old: any) => ({
        ...(old ?? payload),
        title: payload.title,
        body: payload.body,
        tags: payload.tags ?? [],
        version: (old?.version ?? payload.version) + 1,
      }));
      return { prev };
    },
    onError: (_err: any, payload, ctx: any) => {
      if (ctx?.prev) {
        qc.setQueryData(["prompt", payload.key], ctx.prev);
      }
    },
    onSuccess: (data) => {
      qc.setQueryData(["prompt", data.key], data);
      qc.invalidateQueries({ queryKey: ["prompts"] });
    },
    retry: (count, err: any) => (err?.status === 409 ? false : count < 5),
    retryDelay: (attempt) => Math.min(500 * 2 ** attempt, 4000),
  });
}

export async function saveDraft(key: string, draft: any) {
  await set(`draft:${key}`, draft);
}
export async function loadDraft(key: string) {
  return await get(`draft:${key}`);
}
