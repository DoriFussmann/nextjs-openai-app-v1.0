"use client";
import { useState } from "react";

export default function PdfIngestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [progress, setProgress] = useState<{
    chunksProcessed?: number;
    totalChunks?: number;
    currentStep?: string;
    startTime?: number;
  }>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    
    setLoading(true);
    setResult("");
    setProgress({ startTime: Date.now() });
    
    try {
      setStatus("📤 Uploading PDF...");
      const fd = new FormData();
      fd.append("file", file);
      
      setStatus("🔄 Extracting PDF text...");
      const startTime = Date.now();
      
      const res = await fetch("/api/pdf-simple", { method: "POST", body: fd });
      const data = await res.json();
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      
      if (!res.ok) {
        setStatus(`❌ Error: ${res.status} ${res.statusText}`);
        setResult(`Error: ${data.error || "Unknown"}`);
        return;
      }
      
      setStatus(`✅ Complete! Processed ${data.chunksProcessed} chunks in ${duration}s`);
      setProgress(prev => ({ 
        ...prev, 
        chunksProcessed: data.chunksProcessed,
        totalChunks: data.chunksProcessed 
      }));
      setResult(data.text);
      
    } catch (error) {
      setStatus(`❌ Network Error: ${error instanceof Error ? error.message : 'Unknown'}`);
      setResult(`Network Error: ${error instanceof Error ? error.message : 'Unknown'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-medium">PDF → Text (Simple Extraction)</h1>
      
      <form onSubmit={onSubmit} className="space-x-3">
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <button
          type="submit"
          disabled={!file || loading}
          className="px-3 py-2 border rounded disabled:opacity-50"
        >
          {loading ? "Processing…" : "Upload & Extract"}
        </button>
      </form>

      {/* Status Display */}
      {status && (
        <div className="p-3 bg-gray-50 border rounded">
          <div className="font-medium text-sm">{status}</div>
          {loading && progress.startTime && (
            <div className="text-xs text-gray-600 mt-1">
              Processing for {Math.floor((Date.now() - progress.startTime) / 1000)}s...
            </div>
          )}
          {progress.chunksProcessed && (
            <div className="text-xs text-gray-600 mt-1">
              Chunks processed: {progress.chunksProcessed}
            </div>
          )}
        </div>
      )}

      {/* File Info */}
      {file && (
        <div className="text-sm text-gray-600 p-2 bg-blue-50 border border-blue-200 rounded">
          📄 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Processing PDF chunks with OpenAI...</span>
        </div>
      )}

      <textarea
        className="w-full h-96 p-3 border rounded font-mono text-sm"
        value={result}
        onChange={() => {}}
        placeholder="Extracted text will appear here…"
      />
    </div>
  );
}
