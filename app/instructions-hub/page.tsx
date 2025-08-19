'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/Button';

interface Prompt {
  id: string;
  title: string;
  content: string;
}

interface PromptsData {
  cursorPrompts: Prompt[];
  designPrompts: Prompt[];
  rupertPrompts: Prompt[];
  dataPrompts: Prompt[];
}

export default function InstructionsHub() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [editableTitle, setEditableTitle] = useState('');
  const [editableContent, setEditableContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [promptsData, setPromptsData] = useState<PromptsData>({
    cursorPrompts: Array.from({length: 7}, (_, i) => ({
      id: `prompt-${i + 1}`,
      title: `Prompt ${i + 1}`,
      content: 'Enter your prompt content here...'
    })),
    designPrompts: Array.from({length: 7}, (_, i) => ({
      id: `design-${i + 1}`,
      title: `Design ${i + 1}`,
      content: 'Enter your design prompt content here...'
    })),
    rupertPrompts: Array.from({length: 7}, (_, i) => ({
      id: `rupert-${i + 1}`,
      title: `Rupert ${i + 1}`,
      content: 'Enter your Rupert prompt content here...'
    }))
  });
  const [justCopied, setJustCopied] = useState(false);
  const [justCopiedContent, setJustCopiedContent] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Load prompts data on component mount
  useEffect(() => {
    loadPromptsData();
  }, []);

  const loadPromptsData = async () => {
    try {
      // First try to load from localStorage
      const localData = localStorage.getItem('promptsData');
      if (localData) {
        const parsedData = JSON.parse(localData);
        
        // Ensure all required arrays exist (migration for older data)
        const migratedData = {
          cursorPrompts: parsedData.cursorPrompts || [],
          designPrompts: parsedData.designPrompts || [],
          rupertPrompts: parsedData.rupertPrompts || Array.from({length: 7}, (_, i) => ({
            id: `rupert-${i + 1}`,
            title: `Rupert ${i + 1}`,
            content: 'Enter your Rupert prompt content here...'
          })),
          dataPrompts: parsedData.dataPrompts || Array.from({length: 7}, (_, i) => ({
            id: `data-${i + 1}`,
            title: `Data ${i + 1}`,
            content: 'Enter your data prompt content here...'
          }))
        };
        
        setPromptsData(migratedData);
        // Save the migrated data back to localStorage
        localStorage.setItem('promptsData', JSON.stringify(migratedData));
        return;
      }

      // Fallback to default data file
      const response = await fetch('/data/prompts.json');
      if (response.ok) {
        const data = await response.json();
        setPromptsData(data);
        // Save to localStorage for future use
        localStorage.setItem('promptsData', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error loading prompts data:', error);
      // Initialize with default data if loading fails
      const defaultData: PromptsData = {
        cursorPrompts: Array.from({length: 7}, (_, i) => ({
          id: `prompt-${i + 1}`,
          title: `Prompt ${i + 1}`,
          content: 'Enter your prompt content here...'
        })),
        designPrompts: Array.from({length: 7}, (_, i) => ({
          id: `design-${i + 1}`,
          title: `Design ${i + 1}`,
          content: 'Enter your design prompt content here...'
        })),
        rupertPrompts: Array.from({length: 7}, (_, i) => ({
          id: `rupert-${i + 1}`,
          title: `Rupert ${i + 1}`,
          content: 'Enter your Rupert prompt content here...'
        })),
        dataPrompts: Array.from({length: 7}, (_, i) => ({
          id: `data-${i + 1}`,
          title: `Data ${i + 1}`,
          content: 'Enter your data prompt content here...'
        }))
      };
      setPromptsData(defaultData);
      localStorage.setItem('promptsData', JSON.stringify(defaultData));
    }
  };

  const openPrompt = (prompt: Prompt) => {
    setCurrentPrompt(prompt);
    setEditableTitle(prompt.title);
    setEditableContent(prompt.content);
    setIsModalOpen(true);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!currentPrompt) return;

    // Update the prompt in the data structure
    const updatedPromptsData = { ...promptsData };
    
    if (currentPrompt.id.startsWith('prompt-')) {
      const index = updatedPromptsData.cursorPrompts.findIndex(p => p.id === currentPrompt.id);
      if (index !== -1) {
        updatedPromptsData.cursorPrompts[index] = {
          ...currentPrompt,
          title: editableTitle,
          content: editableContent
        };
      }
    } else if (currentPrompt.id.startsWith('design-')) {
      const index = updatedPromptsData.designPrompts.findIndex(p => p.id === currentPrompt.id);
      if (index !== -1) {
        updatedPromptsData.designPrompts[index] = {
          ...currentPrompt,
          title: editableTitle,
          content: editableContent
        };
      }
    } else if (currentPrompt.id.startsWith('rupert-')) {
      if (!updatedPromptsData.rupertPrompts) {
        updatedPromptsData.rupertPrompts = [];
      }
      const index = updatedPromptsData.rupertPrompts.findIndex(p => p.id === currentPrompt.id);
      if (index !== -1) {
        updatedPromptsData.rupertPrompts[index] = {
          ...currentPrompt,
          title: editableTitle,
          content: editableContent
        };
      }
    } else if (currentPrompt.id.startsWith('data-')) {
      if (!updatedPromptsData.dataPrompts) {
        updatedPromptsData.dataPrompts = [];
      }
      const index = updatedPromptsData.dataPrompts.findIndex(p => p.id === currentPrompt.id);
      if (index !== -1) {
        updatedPromptsData.dataPrompts[index] = {
          ...currentPrompt,
          title: editableTitle,
          content: editableContent
        };
      }
    }

    // Save to state and localStorage
    setPromptsData(updatedPromptsData);
    localStorage.setItem('promptsData', JSON.stringify(updatedPromptsData));

    // Save to file system (this will create/update the JSON file)
    try {
      await fetch('/api/save-prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPromptsData),
      });
    } catch (error) {
      console.error('Error saving to file system:', error);
    }

    // Show "Saved!" feedback
    setJustSaved(true);
    
    // Hide feedback after 1 second, then close modal
    setTimeout(() => {
      setJustSaved(false);
      setIsEditing(false);
      setIsModalOpen(false);
    }, 1000);
  };

  const handleCopy = () => {
    const textToCopy = `Title: ${editableTitle}\n\nContent: ${editableContent}`;
    navigator.clipboard.writeText(textToCopy);
    
    // Show "Copied!" feedback
    setJustCopied(true);
    
    // Hide feedback after 2 seconds
    setTimeout(() => {
      setJustCopied(false);
    }, 2000);
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(editableContent);
    
    // Show "Copied!" feedback
    setJustCopiedContent(true);
    
    // Hide feedback after 2 seconds
    setTimeout(() => {
      setJustCopiedContent(false);
    }, 2000);
  };

  return (
    <div className="bg-white text-black font-inter">
      {/* Page Header */}
      <header className="border-b border-gray-200 px-4">
        <div className="page-wrap flex justify-between items-center">
          <div className="text-xl">Prompt Hub</div>
          <nav className="hidden md:flex space-x-4">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => window.location.href = '/'}
            >
              Home
            </Button>

          </nav>
        </div>
      </header>

      <main className="page-wrap">
        {/* Full Width Layout */}
        <div className="min-h-[calc(100vh-300px)] -mt-4">
          
          {/* Content Area - Full Width */}
          <div className="w-full">
            <div className="bg-white border border-gray-200 rounded-xl p-10 shadow-lg h-full">
              <h2 className="text-sm text-gray-900 mb-6">Cursor Prompts</h2>
              
              {/* Grid of 5 boxes */}
              <div className="mb-8">
                <div className="grid grid-cols-5 gap-4">
                  {(promptsData.cursorPrompts || []).slice(0, 5).map((prompt) => (
                    <div 
                      key={prompt.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => openPrompt(prompt)}
                    >
                      <div className="text-gray-600 text-sm">{prompt.title}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cursor design prompts Section */}
              <h3 className="text-sm text-gray-900 mb-4">Cursor design prompts</h3>
              
              {/* Grid of 5 boxes */}
              <div className="mb-8">
                <div className="grid grid-cols-5 gap-4">
                  {(promptsData.designPrompts || []).slice(0, 5).map((prompt) => (
                    <div 
                      key={prompt.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => openPrompt(prompt)}
                    >
                      <div className="text-gray-600 text-sm">{prompt.title}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rupert Prompts Section */}
              <h3 className="text-sm text-gray-900 mb-4 mt-8">Rupert Prompts</h3>
              
              {/* Grid of 5 boxes */}
              <div className="mb-8">
                <div className="grid grid-cols-5 gap-4">
                  {(promptsData.rupertPrompts || []).slice(0, 5).map((prompt) => (
                    <div 
                      key={prompt.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => openPrompt(prompt)}
                    >
                      <div className="text-gray-600 text-sm">{prompt.title}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Prompts Section */}
              <h3 className="text-sm text-gray-900 mb-4 mt-8">Data prompts</h3>
              
              {/* Grid of 5 boxes */}
              <div className="mb-8">
                <div className="grid grid-cols-5 gap-4">
                  {(promptsData.dataPrompts || []).slice(0, 5).map((prompt) => (
                    <div 
                      key={prompt.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => openPrompt(prompt)}
                    >
                      <div className="text-gray-600 text-sm">{prompt.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Window */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-[600px] max-h-[80vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex-1">
                {isEditing ? (
                  <input
                    value={editableTitle}
                    onChange={(e) => setEditableTitle(e.target.value)}
                    className="text-xl text-gray-900 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 w-full"
                  />
                ) : (
                  <h3 className="text-xl text-gray-900">{editableTitle}</h3>
                )}
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                >
                  {justCopied ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="text-2xl font-light"
                >
                  ×
                </Button>
              </div>
            </div>

            {/* Editable Title */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">Title</label>
              <input
                value={editableTitle}
                onChange={(e) => setEditableTitle(e.target.value)}
                disabled={!isEditing}
                className={`w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!isEditing ? 'bg-gray-50 text-gray-600' : ''}`}
                placeholder="Enter prompt title..."
              />
            </div>

            {/* Editable Content */}
            <div className="mb-6">
              <label className="block text-sm text-gray-700 mb-2">Prompt Content</label>
              <div className="relative">
                <textarea
                  value={editableContent}
                  onChange={(e) => setEditableContent(e.target.value)}
                  disabled={!isEditing}
                  className={`w-full h-64 p-4 pr-12 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!isEditing ? 'bg-gray-50 text-gray-600' : ''}`}
                  placeholder="Enter your prompt content here..."
                />
                <div className="absolute top-2 right-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyContent}
                    className="!h-8 !w-8 !p-0 text-gray-500 hover:text-gray-700"
                    title="Copy content only"
                  >
                    {justCopiedContent ? (
                      <span className="text-xs">✓</span>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant={isEditing ? "danger" : "secondary"}
                size="md"
                onClick={() => setIsEditing(!isEditing)}
                className={!isEditing ? "!border-yellow-600 !text-yellow-600 hover:!bg-yellow-50" : ""}
              >
                {isEditing ? 'Stop Editing' : 'Edit'}
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleSave}
              >
                {justSaved ? 'Saved!' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
