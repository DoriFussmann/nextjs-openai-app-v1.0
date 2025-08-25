"use client";

import React, { useState } from "react";
import { Home } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";

export default function PortfolioPage() {
  const [rawData, setRawData] = useState("");
  const [showDataModal, setShowDataModal] = useState(false);
  const [tempRawData, setTempRawData] = useState("");
  const [selectedPortfolioType, setSelectedPortfolioType] = useState<string>("");
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("");
  const [showAdmin, setShowAdmin] = useState(false);

  const portfolioTypes = ["Tech Stocks", "Blue Chips", "Growth"];
  const timeframes = ["6 Months", "1 Year", "2 Years"];

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

  const handleReset = () => {
    setRawData("");
    setSelectedPortfolioType("");
    setSelectedTimeframe("");
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <Header 
        title="Portfolio Analysis" 
        rightSlot={
          <div className="flex items-center gap-4">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Reset
            </button>
            <Link href="/" className="inline-flex items-center rounded-lg border px-4 py-1.5 text-sm shadow-sm transition hover:shadow">
              Home
            </Link>
          </div>
        }
      />
      
      <div className="page-wrap">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Input - 25% width */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-4 bg-white shadow-sm sticky top-6">
            <h2 className="text-lg font-normal mb-3">Portfolio Inputs</h2>
            
            <button
              onClick={openDataModal}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-50 text-sm text-left"
            >
              {rawData.trim() ? "Edit Portfolio Data..." : "Add Portfolio Data..."}
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
              disabled={true}
              className="mt-2 w-full rounded-lg bg-blue-600 text-white px-3 py-2 hover:bg-blue-700 disabled:opacity-60 text-sm"
            >
              Generate
            </button>
            
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
                  {/* Portfolio Type Dropdown */}
                  <div>
                    <label className="block text-sm font-normal text-gray-700 mb-2">
                      Portfolio Type
                    </label>
                    <select
                      value={selectedPortfolioType}
                      onChange={(e) => setSelectedPortfolioType(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      {portfolioTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Timeframe Dropdown */}
                  <div>
                    <label className="block text-sm font-normal text-gray-700 mb-2">
                      Analysis Timeframe
                    </label>
                    <select
                      value={selectedTimeframe}
                      onChange={(e) => setSelectedTimeframe(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      {timeframes.map((timeframe) => (
                        <option key={timeframe} value={timeframe}>
                          {timeframe}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* API Controls Section */}
                  <div className="mt-6 pt-4 border-t">
                    <h3 className="text-sm font-normal text-gray-700 mb-3">API checks & controls</h3>
                  </div>
                  
                  {/* Disabled Buttons */}
                  <div className="flex flex-col space-y-3">
                    <button
                      disabled={true}
                      className="w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 hover:bg-blue-100 disabled:opacity-60 text-sm text-blue-800"
                    >
                      Portfolio Analysis Prompt
                    </button>
                    <button
                      disabled={true}
                      className="w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 hover:bg-blue-100 disabled:opacity-60 text-sm text-blue-800"
                    >
                      Risk Assessment Prompt
                    </button>
                    <button
                      disabled={true}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors hover:bg-gray-50 border-gray-300"
                    >
                      Test API
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
          <div className="border rounded-lg p-4 bg-gray-50 shadow-sm">
            <h3 className="text-lg font-normal mb-3">Analysis Results</h3>
            <p className="text-gray-600 text-sm">
              Enter portfolio data in the left panel and click "Generate" to see analysis results here.
            </p>
            
            {/* Placeholder Chart Area */}
            <div className="mt-6 border rounded-lg p-6 bg-white">
              <h4 className="text-md font-normal mb-4">Portfolio Performance Chart</h4>
              <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                <p className="text-gray-500 text-sm">Chart visualization will appear here</p>
              </div>
            </div>
            
            {/* Event Boxes Section */}
            <div className="mt-6 space-y-4">
              <h4 className="text-md font-normal">Key Events & Insights</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 bg-white">
                  <div className="h-4 bg-blue-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="border rounded-lg p-4 bg-white">
                  <div className="h-4 bg-green-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="border rounded-lg p-4 bg-white">
                  <div className="h-4 bg-orange-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                </div>
                <div className="border rounded-lg p-4 bg-white">
                  <div className="h-4 bg-purple-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
      
      {/* Portfolio Data Modal */}
      {showDataModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-normal">Portfolio Data</h3>
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
                placeholder="Paste your portfolio data here..."
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