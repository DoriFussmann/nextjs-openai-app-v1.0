// components/model/ModelStateProvider.tsx
"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ModelState, Topic } from "@/lib/model/types";
import { recomputeAll, setActiveTopic } from "@/lib/model/types";
import { hydrateFromCompanyData } from "@/lib/model/hydrate";

const STORAGE_KEY = "rupert_model_state_v1";

type Ctx = {
  state: ModelState | null;
  setState: React.Dispatch<React.SetStateAction<ModelState | null>>;
  selectTopic: (id: string) => void;
  reloadTopics: () => Promise<void>;
  loading: boolean;
  error: string | null;
  setCompanyData: (data: any) => void;
  resetState: () => void;
};

const ModelStateContext = createContext<Ctx | null>(null);

async function fetchTopics(): Promise<Topic[]> {
  const res = await fetch("/api/model-topics", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load topics: ${res.status}`);
  const data = await res.json();
  return data.topics as Topic[];
}

export default function ModelStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ModelState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState(parsed);
      }
    } catch (e) {
      console.warn("Failed to load saved state", e);
    }
  }, []);

  // Auto-save state when it changes
  useEffect(() => {
    if (state) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.warn("Failed to save state", e);
      }
    }
  }, [state]);

  const init = async () => {
    setLoading(true);
    setError(null);
    try {
      const topics = await fetchTopics();
      const initial: ModelState = {
        topics: topics.map((t) => ({ ...t, completionPct: t.completionPct ?? 0, readyToModel: t.readyToModel ?? false })),
        activeTopicId: topics[0]?.id,
        crossSignals: {},
        companyData: {}, // TODO: hydrate from Data Mapper later
      };
      setState(recomputeAll(initial));
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void init();
  }, []);

  const selectTopic = (id: string) => {
    setState((prev) => (prev ? setActiveTopic(prev, id) : prev));
  };

  const setCompanyData = (data: any) => {
    setState((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, companyData: data };
      return hydrateFromCompanyData(updated);
    });
  };

  const resetState = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(null);
  };

  const value = useMemo<Ctx>(() => ({
    state,
    setState,
    selectTopic,
    reloadTopics: init,
    loading,
    error,
    setCompanyData,
    resetState,
  }), [state, loading, error]);

  return (
    <ModelStateContext.Provider value={value}>
      {children}
    </ModelStateContext.Provider>
  );
}

export function useModelState() {
  const ctx = useContext(ModelStateContext);
  if (!ctx) throw new Error("useModelState must be used within <ModelStateProvider>");
  return ctx;
}
