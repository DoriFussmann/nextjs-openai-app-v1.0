'use client';

import { Button } from '@/components/Button';

export type SaveStatus = 'draft' | 'saving' | 'saved' | 'error' | 'local-only';

interface SaveStatusPillProps {
  status: SaveStatus;
  onRetry?: () => void;
  className?: string;
}

export function SaveStatusPill({ status, onRetry, className = '' }: SaveStatusPillProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'draft':
        return {
          text: 'Draft',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-600',
          icon: '📝',
        };
      case 'saving':
        return {
          text: 'Saving…',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-600',
          icon: '⏳',
        };
      case 'saved':
        return {
          text: 'Saved ✓',
          bgColor: 'bg-green-100',
          textColor: 'text-green-600',
          icon: '✓',
        };
      case 'error':
        return {
          text: 'Error',
          bgColor: 'bg-red-100',
          textColor: 'text-red-600',
          icon: '❌',
        };
      case 'local-only':
        return {
          text: 'Local only – retrying…',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-600',
          icon: '💾',
        };
      default:
        return {
          text: 'Unknown',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-600',
          icon: '❓',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${config.bgColor} ${config.textColor} ${className}`}>
      <span className="text-xs">{config.icon}</span>
      <span>{config.text}</span>
      {status === 'error' && onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="!h-6 !w-6 !p-0 !min-w-0 hover:!bg-red-200"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </Button>
      )}
    </div>
  );
}

