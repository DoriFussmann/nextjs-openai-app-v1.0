"use client";

import React, { useState, useEffect } from "react";
import schema from "@/data/business-plan-structure.json";
import { CompanyAnalysis } from "@/components/CompanyAnalysis";
import type { MappingResult } from "@/types/mapping";
import { buildDataHandlingPrompt } from "@/utils/prompts";
import { Home } from "lucide-react";
import Link from "next/link";

export default function AnalyzePage() {
  const [rawData, setRawData] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MappingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [completePrompt, setCompletePrompt] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [debugCopied, setDebugCopied] = useState(false);
  const [rupertPrompts, setRupertPrompts] = useState<Array<{id: string, title: string, content: string}>>([]);
  const [dataPrompts, setDataPrompts] = useState<Array<{id: string, title: string, content: string}>>([]);
  const [selectedRupertPrompt, setSelectedRupertPrompt] = useState<string>("");
  const [selectedDataPrompt, setSelectedDataPrompt] = useState<string>("");

  useEffect(() => {
    loadPromptsFromHub();
  }, []);

  const loadPromptsFromHub = async () => {
    try {
      console.log('Loading prompts from Prompts Hub...');
      
      // First try to load from localStorage (where Instructions Hub saves changes)
      const localData = localStorage.getItem('promptsData');
      if (localData) {
        try {
          const parsedData = JSON.parse(localData);
          console.log('Prompts loaded from localStorage:', parsedData);
          
          if (parsedData.rupertPrompts) {
            setRupertPrompts(parsedData.rupertPrompts);
            console.log('Rupert prompts loaded from localStorage:', parsedData.rupertPrompts.length, 'prompts');
          }
          
          if (parsedData.dataPrompts) {
            setDataPrompts(parsedData.dataPrompts);
            console.log('Data prompts loaded from localStorage:', parsedData.dataPrompts.length, 'prompts');
          }
          return; // Exit early if localStorage data found
        } catch (error) {
          console.error('Error parsing localStorage data:', error);
        }
      }
      
      // Fallback to JSON file if localStorage is empty or invalid
      console.log('No localStorage data found, loading from file...');
      const response = await fetch('/data/prompts.json');
      if (response.ok) {
        const data = await response.json();
        console.log('Prompts Hub data loaded from file:', data);
        
        if (data.rupertPrompts) {
          setRupertPrompts(data.rupertPrompts);
          console.log('Rupert prompts loaded from file:', data.rupertPrompts.length, 'prompts');
        }
        
        if (data.dataPrompts) {
          setDataPrompts(data.dataPrompts);
          console.log('Data prompts loaded from file:', data.dataPrompts.length, 'prompts');
        }
      } else {
        console.error('Failed to load prompts from hub, status:', response.status);
      }
    } catch (error) {
      console.error('Error loading prompts from Prompts Hub:', error);
    }
  };

  const handleRupertPromptSelection = (promptId: string) => {
    setSelectedRupertPrompt(promptId);
    const prompt = rupertPrompts.find(p => p.id === promptId);
    if (prompt && prompt.content && !prompt.content.includes('Enter your')) {
      // Show the selected Rupert prompt in the preview
      setCompletePrompt(prompt.content);
      setShowPrompt(true);
      setError(null);
    } else if (promptId === "") {
      // Clear the prompt when no selection
      setCompletePrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDataPromptSelection = (promptId: string) => {
    setSelectedDataPrompt(promptId);
    const prompt = dataPrompts.find(p => p.id === promptId);
    if (prompt && prompt.content && !prompt.content.includes('Enter your')) {
      // Show the selected Data prompt in the preview
      setCompletePrompt(prompt.content);
      setShowPrompt(true);
      setError(null);
    } else if (promptId === "") {
      // Clear the prompt when no selection
      setCompletePrompt(null);
      setShowPrompt(false);
    }
  };

  // MIDDLEMAN: Function to build the complete prompt using the same buildDataHandlingPrompt but with selected components
  const buildCompletePrompt = () => {
    if (!rawData.trim()) {
      return null;
    }

    const selectedDataPromptData = dataPrompts.find(p => p.id === selectedDataPrompt);
    
    // Get the schema from selected data prompt or fall back to default
    let schemaToUse = schema;
    if (selectedDataPromptData && selectedDataPromptData.content && !selectedDataPromptData.content.includes('Enter your')) {
      try {
        schemaToUse = JSON.parse(selectedDataPromptData.content);
      } catch (parseError) {
        console.error('Error parsing selected data prompt as JSON, using default schema:', parseError);
      }
    }
    
    // Use the SAME buildDataHandlingPrompt function as before
    return buildDataHandlingPrompt(rawData, JSON.stringify(schemaToUse));
  };

  function generateCompletePrompt() {
    if (!rawData.trim()) {
      setError("Please enter some company data first");
      return;
    }
    
    try {
      // Use the middleman function to build the complete prompt
      const prompt = buildCompletePrompt();
      if (prompt) {
        setCompletePrompt(prompt);
        setShowPrompt(true);
        setError(null);
        
        // Debug logging
        console.log("=== COMPLETE PROMPT PREVIEW ===");
        console.log("This is exactly what will be sent to OpenAI when you click Generate");
        console.log("Prompt length:", prompt.length, "characters");
      } else {
        setError("Could not generate complete prompt");
      }
    } catch (e: any) {
      setError(`Error generating prompt: ${e?.message ?? String(e)}`);
    }
  }

  function copyPromptToClipboard() {
    if (!completePrompt) return;
    
    navigator.clipboard.writeText(completePrompt).then(() => {
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2000);
    }).catch((err) => {
      console.error('Failed to copy prompt:', err);
      setError('Failed to copy prompt to clipboard');
    });
  }

  function copyDebugToClipboard() {
    if (!debugInfo) return;
    
    const debugText = JSON.stringify(debugInfo, null, 2);
    navigator.clipboard.writeText(debugText).then(() => {
      setDebugCopied(true);
      setTimeout(() => setDebugCopied(false), 2000);
    }).catch((err) => {
      console.error('Failed to copy debug info:', err);
      setError('Failed to copy debug info to clipboard');
    });
  }

  async function onGenerate() {
    setLoading(true);
    setError(null);
    setResult(null);
    setDebugInfo(null);
    try {
      // Get the selected data prompt to use as schema
      const selectedDataPromptData = dataPrompts.find(p => p.id === selectedDataPrompt);
      let schemaToUse = schema;
      
      if (selectedDataPromptData && selectedDataPromptData.content && !selectedDataPromptData.content.includes('Enter your')) {
        try {
          schemaToUse = JSON.parse(selectedDataPromptData.content);
          console.log('Using selected data prompt as schema:', selectedDataPromptData.title);
        } catch (parseError) {
          console.error('Error parsing selected data prompt as JSON, using default schema:', parseError);
        }
      } else {
        console.log('No valid data prompt selected, using default schema');
      }
      
      // Send in the ORIGINAL format that was working
      const requestBody = { rawData, schema: schemaToUse };
      console.log('=== GENERATE API CALL ===');
      console.log('Using original API format with selected schema');
      console.log('Schema topics count:', schemaToUse?.topics?.length || 'Unknown');
      
      const resp = await fetch("/api/map-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const data = await resp.json();
      
      // Store debug information
      setDebugInfo({
        requestBody: {
          rawData: rawData.substring(0, 200) + (rawData.length > 200 ? '...' : ''),
          schemaTopicsCount: schemaToUse?.topics?.length || 'Unknown'
        },
        responseStatus: resp.status,
        responseHeaders: Object.fromEntries(resp.headers.entries()),
        responseData: data,
        timestamp: new Date().toISOString()
      });
      
      if (!resp.ok) {
        setError(data?.error ?? "Unknown error");
      } else {
        setResult(data);
      }
    } catch (e: any) {
      const errorInfo = {
        message: e?.message ?? String(e),
        stack: e?.stack,
        timestamp: new Date().toISOString()
      };
      setError(errorInfo.message);
      setDebugInfo({ error: errorInfo });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header with Home Button */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-sm font-normal">Business Plan Analyzer</h1>
          <Link href="/" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Input */}
        <div className="lg:col-span-1">
          <div className="border rounded-2xl p-4 bg-white shadow-sm sticky top-6">
            <h2 className="text-lg font-normal mb-3">Company Data</h2>
            
            {/* Prompts from Prompts Hub */}
            <div className="mb-4 space-y-4">
              {/* Rupert Prompts Dropdown */}
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  Rupert's Prompts
                </label>
                <select
                  value={selectedRupertPrompt}
                  onChange={(e) => handleRupertPromptSelection(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a Rupert prompt...</option>
                  {rupertPrompts.map((prompt) => (
                    <option key={prompt.id} value={prompt.id}>
                      {prompt.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Data Prompts Dropdown */}
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  Data Prompts
                </label>
                <select
                  value={selectedDataPrompt}
                  onChange={(e) => handleDataPromptSelection(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select a data prompt...</option>
                  {dataPrompts.map((prompt) => (
                    <option key={prompt.id} value={prompt.id}>
                      {prompt.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <textarea
              value={rawData}
              onChange={(e) => setRawData(e.target.value)}
              placeholder="Paste raw company data here…"
              className="w-full h-64 border rounded-xl p-3 outline-none font-sans text-sm"
            />
            <button
              onClick={generateCompletePrompt}
              disabled={!rawData.trim()}
              className="mt-3 w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 hover:bg-blue-100 disabled:opacity-60 text-sm text-blue-800"
            >
              Complete Prompt
            </button>
            <button
              onClick={onGenerate}
              disabled={loading || !rawData.trim()}
              className="mt-2 w-full rounded-xl border px-4 py-2 hover:bg-gray-50 disabled:opacity-60 text-sm"
            >
              {loading ? "Generating…" : "Generate"}
            </button>
            {error && (
              <div className="mt-3 text-sm text-red-600">
                {error}
              </div>
            )}
            
            {debugInfo && (
              <div className="mt-3">
                <button
                  onClick={() => setShowDebug(!showDebug)}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Output */}
        <div className="lg:col-span-3">
          {showPrompt && completePrompt && (
            <div className="mb-6 border rounded-2xl p-4 bg-blue-50 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-normal">Complete Prompt Preview</h3>
                <div className="flex gap-2">
                  <button
                    onClick={copyPromptToClipboard}
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                  >
                    {promptCopied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={() => setShowPrompt(false)}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Hide
                  </button>
                </div>
              </div>
              <div className="text-sm">
                <div className="mb-2">
                  <strong>Prompt Length:</strong> {completePrompt.length.toLocaleString()} characters
                </div>
                <div>
                  <strong>Full Prompt:</strong>
                  <pre className="mt-1 p-3 bg-white border rounded text-sm overflow-auto max-h-96 whitespace-pre-wrap">
                    {completePrompt}
                  </pre>
                </div>
              </div>
            </div>
          )}
          {showDebug && debugInfo && (
            <div className="mb-6 border rounded-2xl p-4 bg-gray-50 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-normal">Debug Information</h3>
                <button
                  onClick={copyDebugToClipboard}
                  className="text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors"
                >
                  {debugCopied ? 'Copied!' : 'Copy Debug'}
                </button>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <strong>Request Status:</strong> {debugInfo.responseStatus || 'N/A'}
                </div>
                <div>
                  <strong>Timestamp:</strong> {debugInfo.timestamp || 'N/A'}
                </div>
                {debugInfo.responseData && (
                  <div>
                    <strong>Response Data:</strong>
                    <pre className="mt-1 p-2 bg-white border rounded text-sm overflow-auto max-h-40">
                      {JSON.stringify(debugInfo.responseData, null, 2)}
                    </pre>
                  </div>
                )}
                {debugInfo.requestBody && (
                  <div>
                    <strong>Request Body:</strong>
                    <pre className="mt-1 p-2 bg-white border rounded text-sm overflow-auto max-h-40">
                      {JSON.stringify({ ...debugInfo.requestBody, rawData: debugInfo.requestBody.rawData?.substring(0, 200) + '...' }, null, 2)}
                    </pre>
                  </div>
                )}
                {debugInfo.error && (
                  <div>
                    <strong>Error Details:</strong>
                    <pre className="mt-1 p-2 bg-white border rounded text-sm overflow-auto max-h-40">
                      {JSON.stringify(debugInfo.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
          <CompanyAnalysis data={result} />
        </div>
      </div>
    </div>
  );
}
