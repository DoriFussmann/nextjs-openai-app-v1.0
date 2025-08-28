'use client';

import { useState } from 'react';
import { PromptInput, PromptResponse } from '@/lib/promptSchema';
import { Button } from '@/components/Button';

interface ConflictResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientData: PromptInput;
  serverData: PromptResponse;
  onResolve: (action: 'keep-mine' | 'take-server' | 'merge', mergedData?: PromptInput) => void;
}

export function ConflictResolutionModal({
  isOpen,
  onClose,
  clientData,
  serverData,
  onResolve,
}: ConflictResolutionModalProps) {
  const [mergeText, setMergeText] = useState(clientData.body);
  const [showMergeEditor, setShowMergeEditor] = useState(false);

  if (!isOpen) return null;

  const handleKeepMine = () => {
    onResolve('keep-mine');
  };

  const handleTakeServer = () => {
    onResolve('take-server');
  };

  const handleMerge = () => {
    if (showMergeEditor) {
      const mergedData: PromptInput = {
        ...clientData,
        body: mergeText,
        version: serverData.version + 1,
      };
      onResolve('merge', mergedData);
    } else {
      setShowMergeEditor(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[800px] max-h-[80vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Version Conflict Detected</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-light"
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            The server version has been updated since you started editing. Choose how to resolve this conflict:
          </p>
        </div>

        {!showMergeEditor ? (
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Client Version */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Your Version (Client)</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Title:</strong> {clientData.title}</div>
                <div><strong>Version:</strong> {clientData.version}</div>
                <div><strong>Content:</strong></div>
                <div className="bg-gray-50 p-2 rounded text-xs max-h-32 overflow-y-auto">
                  {clientData.body}
                </div>
              </div>
            </div>

            {/* Server Version */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Server Version</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Title:</strong> {serverData.title}</div>
                <div><strong>Version:</strong> {serverData.version}</div>
                <div><strong>Content:</strong></div>
                <div className="bg-gray-50 p-2 rounded text-xs max-h-32 overflow-y-auto">
                  {serverData.body}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Merge Editor</h3>
            <p className="text-sm text-gray-600 mb-4">
              Edit the content below to create your merged version:
            </p>
            <textarea
              value={mergeText}
              onChange={(e) => setMergeText(e.target.value)}
              className="w-full h-64 p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Merge your content here..."
            />
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
          >
            Cancel
          </Button>
          
          <Button
            variant="danger"
            size="md"
            onClick={handleKeepMine}
            className="!border-yellow-600 !text-yellow-600 hover:!bg-yellow-50"
          >
            Keep Mine (Overwrite)
          </Button>
          
          <Button
            variant="secondary"
            size="md"
            onClick={handleTakeServer}
          >
            Take Server
          </Button>
          
          <Button
            variant="primary"
            size="md"
            onClick={handleMerge}
          >
            {showMergeEditor ? 'Save Merged' : 'Merge'}
          </Button>
        </div>
      </div>
    </div>
  );
}

