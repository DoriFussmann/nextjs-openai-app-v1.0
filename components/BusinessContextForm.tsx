"use client";

import React, { useState, useEffect } from "react";
import { useBusinessContext, type BusinessContext } from "@/stores/businessContext";

export default function BusinessContextForm() {
  const { context, setContext } = useBusinessContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState<BusinessContext>({
    companyName: "",
    overview: "",
    positioning: "",
    market: "",
    voice: "",
  });

  // Load existing context into form
  useEffect(() => {
    if (context) {
      setFormData(context);
    }
  }, [context]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContext(formData);
    setIsExpanded(false);
  };

  const handleInputChange = (field: keyof BusinessContext, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-normal text-gray-700">Business Context</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          {isExpanded ? 'Hide' : context ? 'Edit' : 'Add'}
        </button>
      </div>

      {context && !isExpanded && (
        <div className="mt-2 text-xs text-gray-600">
          <div>{context.companyName}</div>
          <div className="truncate">{context.overview}</div>
        </div>
      )}

      {isExpanded && (
        <form onSubmit={handleSubmit} className="mt-3 space-y-3">
          <div>
            <label className="block text-xs font-normal text-gray-700 mb-1">
              Company Name *
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-normal text-gray-700 mb-1">
              Overview *
            </label>
            <textarea
              value={formData.overview}
              onChange={(e) => handleInputChange('overview', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 h-16 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-normal text-gray-700 mb-1">
              Positioning
            </label>
            <input
              type="text"
              value={formData.positioning || ''}
              onChange={(e) => handleInputChange('positioning', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-normal text-gray-700 mb-1">
              Market
            </label>
            <input
              type="text"
              value={formData.market || ''}
              onChange={(e) => handleInputChange('market', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-normal text-gray-700 mb-1">
              Voice/Tone
            </label>
            <input
              type="text"
              value={formData.voice || ''}
              onChange={(e) => handleInputChange('voice', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 rounded-lg border border-green-200 bg-green-50 px-2 py-1 hover:bg-green-100 text-xs text-green-800"
            >
              Save Context
            </button>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="flex-1 rounded-lg border border-gray-300 px-2 py-1 hover:bg-gray-50 text-xs"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
