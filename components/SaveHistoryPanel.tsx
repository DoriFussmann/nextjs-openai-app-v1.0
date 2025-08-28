'use client';

import { useState } from 'react';
import { SaveLogEntry } from '@/lib/log';

interface SaveHistoryPanelProps {
  logs: SaveLogEntry[];
  className?: string;
}

export function SaveHistoryPanel({ logs, className = '' }: SaveHistoryPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (logs.length === 0) {
    return null;
  }

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const getStatusIcon = (outcome: SaveLogEntry['outcome']) => {
    switch (outcome) {
      case 'success':
        return '✅';
      case 'failure':
        return '❌';
      case 'conflict':
        return '⚠️';
      case 'retry':
        return '🔄';
      default:
        return '❓';
    }
  };

  const getStatusColor = (outcome: SaveLogEntry['outcome']) => {
    switch (outcome) {
      case 'success':
        return 'text-green-600';
      case 'failure':
        return 'text-red-600';
      case 'conflict':
        return 'text-yellow-600';
      case 'retry':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`border border-gray-200 rounded-lg ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-between"
      >
        <span>Save History ({logs.length})</span>
        <svg
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 max-h-64 overflow-y-auto">
          {logs.map((log, index) => (
            <div
              key={index}
              className="px-4 py-2 text-xs border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span>{getStatusIcon(log.outcome)}</span>
                  <span className={`font-medium ${getStatusColor(log.outcome)}`}>
                    {log.action.toUpperCase()}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600">{log.key}</span>
                  {log.version && (
                    <>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-600">v{log.version}</span>
                    </>
                  )}
                </div>
                <span className="text-gray-400">{formatTimestamp(log.timestamp)}</span>
              </div>
              {log.error && (
                <div className="text-red-500 text-xs mt-1">
                  Error: {log.error}
                </div>
              )}
              {log.retryCount && (
                <div className="text-blue-500 text-xs mt-1">
                  Retry attempt {log.retryCount}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

