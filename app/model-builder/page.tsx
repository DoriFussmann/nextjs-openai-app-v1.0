"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import { Header } from "@/components/layout/Header";
import ModelStateProvider, { useModelState } from "@/components/model/ModelStateProvider";
import TopicSwitcher from "@/components/model/TopicSwitcher";
import Markdown from "@/components/ui/Markdown";
import dynamic from "next/dynamic";
const ModelTopicsPanel = dynamic(() => import("@/components/model/ModelTopicsPanel"), { ssr: false });

export default function ModelBuilderPage() {
  return (
    <ModelStateProvider>
      <ModelBuilderContent />
    </ModelStateProvider>
  );
}

function ModelBuilderContent() {
  const [modelState, setModelState] = useState<any>({});
  const [messages, setMessages] = useState<{ role: "user"|"assistant"; content: string; evidence?: any[] }[]>([
    { role: "assistant", content: "Let's start with revenue. What do you sell, and how do you charge (one-time, subscription, usage)?" }
  ]);
  const [input, setInput] = useState("");
  const [coverage, setCoverage] = useState(0);
  const [schema, setSchema] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isTestingAPI, setIsTestingAPI] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  // Left sidebar extras component
  const LeftSidebarExtras = () => {
    const { state, selectTopic } = useModelState();
    if (!state) return null;
    return (
      <div className="mt-4">
        <TopicSwitcher
          topics={state.topics}
          activeTopicId={state.activeTopicId}
          onSelect={selectTopic}
        />
      </div>
    );
  };

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

  const handleTestAPI = async () => {
    setIsTestingAPI(true);
    setTestSuccess(false);

    try {
      const response = await fetch('/api/model-builder/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage: "Test message",
          businessContext: {},
          modelState: {},
          promptsKey: "model_builder_v1"
        }),
      });

      if (response.ok) {
        setTestSuccess(true);
        // Hide success indicator after 1 second
        setTimeout(() => {
          setTestSuccess(false);
        }, 1000);
      } else {
        const errorText = await response.text();
        console.error('API test failed:', errorText);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('API test failed:', error);
    } finally {
      setIsTestingAPI(false);
    }
  };

  const { state, setState } = useModelState();

  async function send() {
    const userMessage = input.trim();
    if (!userMessage || loading || !state) return;
    
    console.log("Sending message:", userMessage);
    setMessages((m) => [...m, { role: "user", content: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      console.log("Making API request to /api/model-builder/chat");
      const res = await fetch("/api/model-builder/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage,
          activeTopicId: state.activeTopicId,
          modelState: state,
          companyData: state.companyData,
          promptsKey: "model_builder_v2"
        })
      });

      console.log("Response status:", res.status);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Response data:", data);
      
      // Update shared model state returned from API
      if (data?.modelState) setState(data.modelState);
      
      // Update chat messages with assistant reply
      setMessages((m) => [...m, { role: "assistant", content: data.assistantMessage }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, there was an error processing your message. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <Header title="Model builder" />

      <div className="page-wrap">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Panel - Chat and Admin */}
          <div className="md:col-span-1 space-y-4">
            {/* Chat Box */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm flex flex-col">
              <div className="flex-1 space-y-4 overflow-y-auto pr-1 h-[60vh]">
                {messages.map((m, i) => (
                  <div key={i} className={`p-3 rounded-lg ${
                    m.role === "assistant" 
                      ? "bg-blue-50 text-gray-900 border-l-4 border-blue-500" 
                      : "bg-gray-50 text-gray-700 ml-8"
                  }`}>
                    <div className="text-xs text-gray-500 mb-1 uppercase font-sans">
                      {m.role === "assistant" ? "AI Assistant" : "You"}
                    </div>
                    {m.role === "assistant" ? (
                      <Markdown>{m.content}</Markdown>
                    ) : (
                      <div className="text-sm font-normal font-sans leading-relaxed">
                        {m.content}
                      </div>
                    )}
                    {m.role === "user" && m.evidence && m.evidence.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {m.evidence.map((ev, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-gray-100 text-xs rounded-full border border-gray-300"
                          >
                            {ev.key}: {String(ev.value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="p-3 rounded-lg bg-blue-50 text-gray-900 border-l-4 border-blue-500">
                    <div className="text-xs text-gray-500 mb-1 uppercase font-sans">AI Assistant</div>
                    <p className="text-sm font-normal font-sans">Thinking...</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex gap-2">
                <input
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-sans"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your answer…"
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                  disabled={loading}
                />
                <button 
                  className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-sans" 
                  onClick={send}
                  disabled={loading || !input.trim()}
                >
                  {loading ? "..." : "Send"}
                </button>
              </div>
            </div>

            {/* Admin Box - Separate container beneath chat */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
              <h3 className="text-sm font-normal mb-4 font-sans">Admin Panel</h3>
              
              <button
                onClick={() => setShowAdmin(!showAdmin)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-50 text-sm font-sans bg-gray-50"
              >
                {showAdmin ? 'Hide Admin' : 'Show Admin'}
              </button>
              
              {showAdmin && (
                <div className="mt-4 space-y-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  {/* API Controls Section */}
                  <div>
                    <h3 className="text-sm font-normal text-gray-700 mb-3">API checks & controls</h3>
                  </div>
                  
                  {/* Test API Button */}
                  <div className="flex flex-col space-y-3">
                    <button
                      onClick={handleTestAPI}
                      disabled={isTestingAPI}
                      className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors font-sans ${
                        testSuccess 
                          ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' 
                          : 'hover:bg-gray-50 border-gray-300'
                      }`}
                    >
                      {isTestingAPI ? 'Testing...' : testSuccess ? '✓ Success!' : 'Test API'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Topic Switcher under the chat */}
            <LeftSidebarExtras />
          </div>
          
          {/* Right panel: Active Topic Summary + All Topics */}
          <div className="md:col-span-2 space-y-4">
            <ModelTopicsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
