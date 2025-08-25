"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import { Header } from "@/components/layout/Header";

export default function ModelBuilderPage() {
  const [modelState, setModelState] = useState<any>({});
  const [messages, setMessages] = useState<{ role: "user"|"assistant"; content: string }[]>([
    { role: "assistant", content: "Let's start with revenue. What do you sell, and how do you charge (one-time, subscription, usage)?" }
  ]);
  const [input, setInput] = useState("");
  const [coverage, setCoverage] = useState(0);
  const [schema, setSchema] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/model-schema");
      const s = await r.json();
      setSchema(s);
      setCoverage(s?.__coverage || 0);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!schema) return;
      const r = await fetch("/api/model-schema?measure=1", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: modelState }) 
      });
      const s = await r.json();
      setCoverage(s.coverage || 0);
    })();
  }, [modelState, schema]);

  async function send() {
    const userMessage = input.trim();
    if (!userMessage || loading) return;
    
    setMessages((m) => [...m, { role: "user", content: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/model-builder/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage,
          businessContext: (window as any).__BUSINESS_CONTEXT__ || {},
          modelState,
          promptsKey: "model_builder_v1"
        })
      });

      const data = await res.json();
      setModelState(data.modelStateUpdated || modelState);
      setMessages((m) => [...m, { role: "assistant", content: data.assistantMessage }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, there was an error processing your message. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <Header title="Model builder" />

      <div className="page-wrap">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <aside className="md:col-span-1 border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <h3 className="text-sm font-normal mb-2">Model Snapshot</h3>
            <div className="text-xs text-gray-600 mb-3">Coverage: {coverage}%</div>
            <div className="w-full bg-gray-200 h-2 rounded mb-3">
              <div 
                className="bg-blue-500 h-2 rounded transition-all duration-300" 
                style={{ width: `${coverage}%` }}
              ></div>
            </div>
            <pre className="text-xs bg-gray-50 rounded-lg p-3 overflow-x-auto h-[60vh] font-mono">
              {JSON.stringify(modelState, null, 2)}
            </pre>
          </aside>
          
          <main className="md:col-span-3 border border-gray-200 rounded-lg p-4 bg-white shadow-sm flex flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto pr-1 h-[60vh]">
              {messages.map((m, i) => (
                <div key={i} className={`p-3 rounded-lg ${
                  m.role === "assistant" 
                    ? "bg-blue-50 text-gray-900 border-l-4 border-blue-500" 
                    : "bg-gray-50 text-gray-700 ml-8"
                }`}>
                  <div className="text-xs text-gray-500 mb-1 uppercase">
                    {m.role === "assistant" ? "AI Assistant" : "You"}
                  </div>
                  <p className={m.role === "assistant" ? "font-normal" : "font-normal"}>
                    {m.content}
                  </p>
                </div>
              ))}
              {loading && (
                <div className="p-3 rounded-lg bg-blue-50 text-gray-900 border-l-4 border-blue-500">
                  <div className="text-xs text-gray-500 mb-1 uppercase">AI Assistant</div>
                  <p className="font-normal">Thinking...</p>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex gap-2">
              <input
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your answer…"
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                disabled={loading}
              />
              <button 
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
                onClick={send}
                disabled={loading || !input.trim()}
              >
                {loading ? "..." : "Send"}
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
