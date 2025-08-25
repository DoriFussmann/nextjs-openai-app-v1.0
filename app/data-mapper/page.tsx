"use client";

import React, { useState, useEffect } from "react";
import schema from "@/data/business-plan-structure.json";
import AnalysisOutput from "@/components/AnalysisOutput";
import TopicBoxes from "@/components/TopicBoxes";

import type { MappingResult } from "@/types/mapping";
import { buildDataHandlingPrompt } from "@/utils/prompts";
import { Home } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";

export default function AnalyzePage() {

  const [rawData, setRawData] = useState("");
  const [showDataModal, setShowDataModal] = useState(false);
  const [tempRawData, setTempRawData] = useState("");
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
  const [selectedRupertPrompt2, setSelectedRupertPrompt2] = useState<string>("");
  const [selectedDataPrompt, setSelectedDataPrompt] = useState<string>("");
  const [showAdmin, setShowAdmin] = useState(false);
  const [isTestingAPI, setIsTestingAPI] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

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

  const handleRupertPromptSelection2 = (promptId: string) => {
    setSelectedRupertPrompt2(promptId);
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



  // MIDDLEMAN: Function to build the complete prompt using the same buildDataHandlingPrompt but with selected components
  const buildCompletePrompt = () => {
    if (!rawData.trim()) {
      return null;
    }

    // Get the selected Rupert's prompt content
    const selectedRupertPromptData = rupertPrompts.find(p => p.id === selectedRupertPrompt);
    const rupertPromptContent = selectedRupertPromptData?.content || '';

    // Get the selected data prompt content
    const selectedDataPromptData = dataPrompts.find(p => p.id === selectedDataPrompt);
    const dataPromptContent = selectedDataPromptData?.content || '';
    
    // Build the complete prompt by combining all elements
    let completePrompt = '';
    

    
    // Add Rupert's prompt if selected
    if (rupertPromptContent && !rupertPromptContent.includes('Enter your')) {
      completePrompt += rupertPromptContent + '\n\n';
    }
    
    // Add data prompt if selected
    if (dataPromptContent && !dataPromptContent.includes('Enter your')) {
      completePrompt += dataPromptContent + '\n\n';
    }
    
    // Add raw company data
    completePrompt += 'COMPANY DATA:\n' + rawData;
    
    return completePrompt;
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

  // Function for second button using second Rupert's dropdown
  const buildCompletePrompt2 = () => {
    if (!rawData.trim()) {
      return null;
    }

    // Get the selected Rupert's prompt content from SECOND dropdown
    const selectedRupertPromptData2 = rupertPrompts.find(p => p.id === selectedRupertPrompt2);
    const rupertPromptContent2 = selectedRupertPromptData2?.content || '';

    // Get the selected data prompt content (same as first button)
    const selectedDataPromptData = dataPrompts.find(p => p.id === selectedDataPrompt);
    const dataPromptContent = selectedDataPromptData?.content || '';
    
    // Build the complete prompt by combining all elements
    let completePrompt = '';
    

    
    // Add Rupert's prompt from SECOND dropdown if selected
    if (rupertPromptContent2 && !rupertPromptContent2.includes('Enter your')) {
      completePrompt += rupertPromptContent2 + '\n\n';
    }
    
    // Add data prompt if selected
    if (dataPromptContent && !dataPromptContent.includes('Enter your')) {
      completePrompt += dataPromptContent + '\n\n';
    }
    
    // Add raw company data
    completePrompt += 'COMPANY DATA:\n' + rawData;
    
    return completePrompt;
  };

  function generateCompletePrompt2() {
    if (!rawData.trim()) {
      setError("Please enter some company data first");
      return;
    }
    
    try {
      // Use the second prompt builder function
      const prompt = buildCompletePrompt2();
      if (prompt) {
        setCompletePrompt(prompt);
        setShowPrompt(true);
        setError(null);
        
        // Debug logging
        console.log("=== COMPLETE PROMPT PREVIEW (SECOND BUTTON) ===");
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

  const openDataModal = () => {
    setTempRawData(rawData);
    setShowDataModal(true);
  };

  const saveDataModal = () => {
    setRawData(tempRawData);
    setShowDataModal(false);
  };

  const cancelDataModal = () => {
    setTempRawData("");
    setShowDataModal(false);
  };

  const handleTestAPI = async () => {
    setIsTestingAPI(true);
    setTestSuccess(false);

    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: "Hello, this is a test message."
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
        setError('API test failed: ' + errorText);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('API test failed:', error);
      setError('API test failed: ' + errorMessage);
    } finally {
      setIsTestingAPI(false);
    }
  };

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
      <Header title="Data Mapper" />
      
      <div className="page-wrap">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Input - 25% width */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-4 bg-white shadow-sm sticky top-6">
            <h2 className="text-lg font-normal mb-3">Company Data</h2>
            
            <button
              onClick={openDataModal}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-50 text-sm text-left"
            >
              {rawData.trim() ? "Edit Company Data..." : "Add Company Data..."}
            </button>
            
            {rawData.trim() && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                {rawData.length} characters
                <div className="truncate mt-1">
                  {rawData.substring(0, 100)}{rawData.length > 100 ? "..." : ""}
                </div>
              </div>
            )}
            
            <button
              onClick={onGenerate}
              disabled={loading || !rawData.trim()}
              className="mt-2 w-full rounded-lg bg-blue-600 text-white px-3 py-2 hover:bg-blue-700 disabled:opacity-60 text-sm"
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
            
            {/* Admin Section */}
            <div className="mt-4 border-t pt-4">
              <button
                onClick={() => setShowAdmin(!showAdmin)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-50 text-sm"
              >
                {showAdmin ? 'Hide Admin' : 'Show Admin'}
              </button>
              
              {showAdmin && (
                <div className="mt-3 space-y-3">

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
                      <option value="">Select</option>
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
                      <option value="">Select</option>
                      {dataPrompts.map((prompt) => (
                        <option key={prompt.id} value={prompt.id}>
                          {prompt.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Second Rupert Prompts Dropdown */}
                  <div>
                    <label className="block text-sm font-normal text-gray-700 mb-2">
                      Rupert's Prompts
                    </label>
                    <select
                      value={selectedRupertPrompt2}
                      onChange={(e) => handleRupertPromptSelection2(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      {rupertPrompts.map((prompt) => (
                        <option key={prompt.id} value={prompt.id}>
                          {prompt.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* API Controls Section */}
                  <div className="mt-6 pt-4 border-t">
                    <h3 className="text-sm font-normal text-gray-700 mb-3">API checks & controls</h3>
                  </div>
                  
                  {/* Prompt and Test API Buttons */}
                  <div className="flex flex-col space-y-3">
                    <button
                      onClick={generateCompletePrompt}
                      disabled={!rawData.trim()}
                      className="w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 hover:bg-blue-100 disabled:opacity-60 text-sm text-blue-800"
                    >
                      {selectedRupertPrompt ? (rupertPrompts.find(p => p.id === selectedRupertPrompt)?.title || "Data Analysis") + " Prompt" : "Data Analysis Prompt"}
                    </button>
                    <button
                      onClick={generateCompletePrompt2}
                      disabled={!rawData.trim()}
                      className="w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 hover:bg-blue-100 disabled:opacity-60 text-sm text-blue-800"
                    >
                      {selectedRupertPrompt2 ? (rupertPrompts.find(p => p.id === selectedRupertPrompt2)?.title || "Data Analysis") + " Prompt" : "Data Analysis Prompt"}
                    </button>
                    <button
                      onClick={handleTestAPI}
                      disabled={isTestingAPI}
                      className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors ${
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
          </div>
        </div>

        {/* Right: Output - 75% width */}
        <div className="lg:col-span-3">
          {/* Placeholder box to show the output area */}
          {!result && !showPrompt && !showDebug && (
            <div className="border rounded-lg p-4 bg-gray-50 shadow-sm">
              <h3 className="text-lg font-normal mb-3">Analysis Results</h3>
              <p className="text-gray-600 text-sm">
                Enter company data in the left panel and click "Generate" to see analysis results here.
              </p>
            </div>
          )}
          
          {showPrompt && completePrompt && (
            <div className="mb-6 border rounded-lg p-4 bg-blue-50 shadow-sm">
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
                  Prompt Length: {completePrompt.length.toLocaleString()} characters
                </div>
                <div>
                  Full Prompt:
                  <pre className="mt-1 p-3 bg-white border rounded text-sm overflow-auto max-h-96 whitespace-pre-wrap">
                    {completePrompt}
                  </pre>
                </div>
              </div>
            </div>
          )}
          {showDebug && debugInfo && (
            <div className="mb-6 border rounded-lg p-4 bg-gray-50 shadow-sm">
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
                  Request Status: {debugInfo.responseStatus || 'N/A'}
                </div>
                <div>
                  Timestamp: {debugInfo.timestamp || 'N/A'}
                </div>
                {debugInfo.responseData && (
                  <div>
                    Response Data:
                    <pre className="mt-1 p-2 bg-white border rounded text-sm overflow-auto max-h-40">
                      {JSON.stringify(debugInfo.responseData, null, 2)}
                    </pre>
                  </div>
                )}
                {debugInfo.requestBody && (
                  <div>
                    Request Body:
                    <pre className="mt-1 p-2 bg-white border rounded text-sm overflow-auto max-h-40">
                      {JSON.stringify({ ...debugInfo.requestBody, rawData: debugInfo.requestBody.rawData?.substring(0, 200) + '...' }, null, 2)}
                    </pre>
                  </div>
                )}
                {debugInfo.error && (
                  <div>
                    Error Details:
                    <pre className="mt-1 p-2 bg-white border rounded text-sm overflow-auto max-h-40">
                      {JSON.stringify(debugInfo.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
          {result && (
            <div className="space-y-6">
              <TopicBoxes 
                topics={result.topics.map(topic => ({
                  topicId: topic.topicId,
                  title: topic.title,
                  percent: topic.completion?.percent || 0
                }))}
              />
              <AnalysisOutput response={result} companyData={rawData} />
            </div>
          )}
        </div>
        </div>
      </div>
      
      {/* Company Data Modal */}
      {showDataModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-normal">Company Data</h3>
              <button
                onClick={cancelDataModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 p-6">
              <textarea
                value={tempRawData}
                onChange={(e) => setTempRawData(e.target.value)}
                placeholder="Paste your company data here..."
                className="w-full h-96 border border-gray-300 rounded-lg p-4 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="mt-2 text-xs text-gray-500">
                {tempRawData.length} characters
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={cancelDataModal}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveDataModal}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
