'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { Header } from '@/components/layout/Header';

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
    })),
    dataPrompts: Array.from({length: 7}, (_, i) => ({
      id: `data-${i + 1}`,
      title: `Data ${i + 1}`,
      content: 'Enter your data prompt content here...'
    }))
  });
  const [justCopied, setJustCopied] = useState(false);
  const [justCopiedContent, setJustCopiedContent] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Load prompts data on component mount
  useEffect(() => {
    loadPromptsData();
  }, []);

  // Debug: Log final prompts data whenever it changes
  useEffect(() => {
    console.log('📊 Final prompts data state:', {
      cursorPrompts: promptsData.cursorPrompts?.length || 0,
      designPrompts: promptsData.designPrompts?.length || 0,
      rupertPrompts: promptsData.rupertPrompts?.length || 0,
      dataPrompts: promptsData.dataPrompts?.length || 0
    });

    // Check specifically for Helpers prompt
    const helpersPrompt = promptsData.rupertPrompts?.find(p => p.title === 'Helpers');
    if (helpersPrompt) {
      console.log('🎯 "Helpers" prompt is available:', helpersPrompt.title);
    } else {
      console.log('❓ "Helpers" prompt not found in current state');
      console.log('Available Rupert prompts:', promptsData.rupertPrompts?.map(p => p.title));
    }
  }, [promptsData]);

  const loadPromptsData = async () => {
    try {
      console.log('🔄 Starting prompts data load...');

      // First load the base data from the file
      let baseData = null;
      try {
        console.log('📂 Loading base data from /data/prompts.json...');
        const response = await fetch('/data/prompts.json');
        if (response.ok) {
          baseData = await response.json();
          console.log('✅ Base data loaded successfully:', {
            cursorPrompts: baseData?.cursorPrompts?.length || 0,
            designPrompts: baseData?.designPrompts?.length || 0,
            rupertPrompts: baseData?.rupertPrompts?.length || 0,
            dataPrompts: baseData?.dataPrompts?.length || 0
          });
        } else {
          console.log('❌ Failed to load base data, status:', response.status);
        }
      } catch (error) {
        console.error('❌ Error loading base prompts file:', error);
      }

      // Then try to load from localStorage for user modifications
      const localData = localStorage.getItem('promptsData');
      console.log('💾 Loading prompts - localStorage data found:', !!localData);
      if (localData) {
        try {
          const parsedData = JSON.parse(localData);
          console.log('✅ Parsed localStorage data:', {
            cursorPrompts: parsedData?.cursorPrompts?.length || 0,
            designPrompts: parsedData?.designPrompts?.length || 0,
            rupertPrompts: parsedData?.rupertPrompts?.length || 0,
            dataPrompts: parsedData?.dataPrompts?.length || 0
          });
          
          // Merge with base data, giving priority to localStorage but ensuring all categories exist
          const mergedData = {
            cursorPrompts: parsedData.cursorPrompts || baseData?.cursorPrompts || Array.from({length: 7}, (_, i) => ({
              id: `prompt-${i + 1}`,
              title: `Prompt ${i + 1}`,
              content: 'Enter your prompt content here...'
            })),
            designPrompts: parsedData.designPrompts || baseData?.designPrompts || Array.from({length: 7}, (_, i) => ({
              id: `design-${i + 1}`,
              title: `Design ${i + 1}`,
              content: 'Enter your design prompt content here...'
            })),
            rupertPrompts: parsedData.rupertPrompts || baseData?.rupertPrompts || Array.from({length: 7}, (_, i) => ({
              id: `rupert-${i + 1}`,
              title: `Rupert ${i + 1}`,
              content: 'Enter your Rupert prompt content here...'
            })),
            dataPrompts: parsedData.dataPrompts || baseData?.dataPrompts || Array.from({length: 7}, (_, i) => ({
              id: `data-${i + 1}`,
              title: `Data ${i + 1}`,
              content: 'Enter your data prompt content here...'
            }))
          };

          console.log('🔍 Checking for "Helpers" prompt in rupertPrompts...');
          const helpersPrompt = mergedData.rupertPrompts?.find(p => p.title === 'Helpers');
          if (helpersPrompt) {
            console.log('✅ Found "Helpers" prompt:', helpersPrompt);
          } else {
            console.log('❌ "Helpers" prompt not found in merged data');
            console.log('Available rupertPrompts:', mergedData.rupertPrompts?.map(p => p.title));
          }

          setPromptsData(mergedData);
          console.log('✅ Final prompts data set with merged data');
          return;
        } catch (error) {
          console.error('Error parsing localStorage data:', error);
        }
      }

      // Fallback to base data if localStorage failed or doesn't exist
      if (baseData) {
        console.log('🔄 Using base data as fallback');
        console.log('🔍 Checking for "Helpers" prompt in base rupertPrompts...');
        const helpersPrompt = baseData.rupertPrompts?.find(p => p.title === 'Helpers');
        if (helpersPrompt) {
          console.log('✅ Found "Helpers" prompt in base data:', helpersPrompt);
        } else {
          console.log('❌ "Helpers" prompt not found in base data');
          console.log('Available base rupertPrompts:', baseData.rupertPrompts?.map(p => p.title));
        }

        setPromptsData(baseData);
        // Save to localStorage for future modifications
        localStorage.setItem('promptsData', JSON.stringify(baseData));
        console.log('💾 Saved base data to localStorage');

        // Also sync to public directory
        try {
          console.log('🔄 Syncing base data to public directory...');
          await fetch('/api/save-prompts?public=true', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(baseData),
          });
          console.log('✅ Public directory synced successfully');
        } catch (error) {
          console.error('❌ Error syncing to public directory:', error);
        }
      }
    } catch (error) {
      console.error('Error loading prompts data:', error);
      // Initialize with default data if everything fails
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
    console.log('Saving prompts data:', updatedPromptsData);
    setPromptsData(updatedPromptsData);
    localStorage.setItem('promptsData', JSON.stringify(updatedPromptsData));
    console.log('Saved to localStorage successfully');

    // Save to file system (this will create/update the JSON file)
    try {
      console.log('💾 Saving to main data file...');
      const mainResponse = await fetch('/api/save-prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPromptsData),
      });

      if (mainResponse.ok) {
        console.log('✅ Main data file saved successfully');
      } else {
        console.error('❌ Failed to save main data file:', mainResponse.status);
      }

      // Also save to public directory for consistency
      console.log('💾 Saving to public data file...');
      const publicResponse = await fetch('/api/save-prompts?public=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPromptsData),
      });

      if (publicResponse.ok) {
        console.log('✅ Public data file saved successfully');
      } else {
        console.error('❌ Failed to save public data file:', publicResponse.status);
      }
    } catch (error) {
      console.error('❌ Error saving to file system:', error);
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
    <div className="bg-white text-black">
      <Header title="Prompt Hub" />

      <main className="page-wrap">
        {/* Full Width Layout */}
        <div className="min-h-[calc(100vh-300px)] -mt-4">
          
          {/* Content Area - Full Width */}
          <div className="w-full">
            <div className="bg-white border border-gray-200 rounded-lg p-10 shadow-lg h-full">
              <h2 className="text-sm text-gray-900 mb-6">Cursor Prompts</h2>
              
              {/* Grid of all boxes */}
              <div className="mb-8">
                <div className="grid grid-cols-5 gap-4">
                  {(promptsData.cursorPrompts || []).map((prompt) => (
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
              
              {/* Grid of all boxes */}
              <div className="mb-8">
                <div className="grid grid-cols-5 gap-4">
                  {(promptsData.designPrompts || []).map((prompt) => (
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
              
              {/* Grid of all boxes */}
              <div className="mb-8">
                <div className="grid grid-cols-5 gap-4">
                  {(promptsData.rupertPrompts || []).map((prompt) => (
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
              
              {/* Grid of all boxes */}
              <div className="mb-8">
                <div className="grid grid-cols-5 gap-4">
                  {(promptsData.dataPrompts || []).map((prompt) => (
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
          <div className="bg-white rounded-lg p-8 w-[600px] max-h-[80vh] overflow-y-auto shadow-2xl">
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
