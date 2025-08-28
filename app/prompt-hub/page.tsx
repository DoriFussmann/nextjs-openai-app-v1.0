'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { Header } from '@/components/layout/Header';
import { PromptEditor } from '@/components/PromptEditor';

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
  aiAdvisors: Prompt[];
}

export default function InstructionsHub() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [promptsData, setPromptsData] = useState<PromptsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load prompts from JSON file
  useEffect(() => {
    const loadPrompts = async () => {
      try {
        setIsLoading(true);
        
        // First try to load from localStorage (saved changes)
        const localData = localStorage.getItem('promptsData');
        if (localData) {
          try {
            const parsedData = JSON.parse(localData);
            
            // Ensure AI Advisors exist in localStorage data
            if (!parsedData.aiAdvisors) {
              parsedData.aiAdvisors = [
                { id: "advisor-1", title: "Rupert — Business Advisor", content: "" },
                { id: "advisor-2", title: "Sofia — Financial Advisor", content: "" },
                { id: "advisor-3", title: "Ethan — Presentation Advisor", content: "" },
                { id: "advisor-4", title: "Maya — Sales Advisor", content: "" },
                { id: "advisor-5", title: "Daniel — Marketing Advisor", content: "" },
                { id: "advisor-6", title: "Aisha — Product Advisor", content: "" },
                { id: "advisor-7", title: "Liam — Technology Advisor", content: "" },
                { id: "advisor-8", title: "Clara — Operations Advisor", content: "" },
                { id: "advisor-9", title: "Marcus — Legal Advisor", content: "" },
                { id: "advisor-10", title: "Elena — HR & Talent Advisor", content: "" }
              ];
            }
            
            // Update AI Advisors prompt content
            const updatedData = updateAIAdvisorsPrompt(parsedData);
            setPromptsData(updatedData);
            setIsLoading(false);
            return; // Use localStorage data if available
          } catch (error) {
            console.error('Error parsing localStorage data:', error);
          }
        }
        
        // Fallback to JSON file
        const response = await fetch('/data/prompts.json');
        if (!response.ok) {
          throw new Error('Failed to load prompts');
        }
        const data = await response.json();
        
        // Initialize AI Advisors if they don't exist
        if (!data.aiAdvisors) {
          data.aiAdvisors = [
            { id: "advisor-1", title: "Rupert — Business Advisor", content: "" },
            { id: "advisor-2", title: "Sofia — Financial Advisor", content: "" },
            { id: "advisor-3", title: "Ethan — Presentation Advisor", content: "" },
            { id: "advisor-4", title: "Maya — Sales Advisor", content: "" },
            { id: "advisor-5", title: "Daniel — Marketing Advisor", content: "" },
            { id: "advisor-6", title: "Aisha — Product Advisor", content: "" },
            { id: "advisor-7", title: "Liam — Technology Advisor", content: "" },
            { id: "advisor-8", title: "Clara — Operations Advisor", content: "" },
            { id: "advisor-9", title: "Marcus — Legal Advisor", content: "" },
            { id: "advisor-10", title: "Elena — HR & Talent Advisor", content: "" }
          ];
        }
        
        // Update AI Advisors prompt content
        const updatedData = updateAIAdvisorsPrompt(data);
        setPromptsData(updatedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load prompts');
      } finally {
        setIsLoading(false);
      }
    };

    loadPrompts();
  }, []);

  const openPrompt = (prompt: Prompt) => {
    setCurrentPrompt(prompt);
    setEditingPrompt({ ...prompt }); // Create a copy for editing
    setIsModalOpen(true);
  };

  const openReadOnlyPrompt = (prompt: Prompt) => {
    setCurrentPrompt(prompt);
    setEditingPrompt(null); // No editing for read-only
    setIsModalOpen(true);
  };

  const savePrompt = async () => {
    if (!editingPrompt || !promptsData) return;
    
    setIsSaving(true);
    try {
      // Update the prompts data
      const updatedData = { ...promptsData };
      
      // Find and update the prompt in the correct category
      if (updatedData.cursorPrompts) {
        const index = updatedData.cursorPrompts.findIndex(p => p.id === editingPrompt.id);
        if (index !== -1) {
          updatedData.cursorPrompts[index] = editingPrompt;
        }
      }
      if (updatedData.designPrompts) {
        const index = updatedData.designPrompts.findIndex(p => p.id === editingPrompt.id);
        if (index !== -1) {
          updatedData.designPrompts[index] = editingPrompt;
        }
      }
      if (updatedData.rupertPrompts) {
        const index = updatedData.rupertPrompts.findIndex(p => p.id === editingPrompt.id);
        if (index !== -1) {
          updatedData.rupertPrompts[index] = editingPrompt;
        }
      }
      if (updatedData.dataPrompts) {
        const index = updatedData.dataPrompts.findIndex(p => p.id === editingPrompt.id);
        if (index !== -1) {
          updatedData.dataPrompts[index] = editingPrompt;
        }
      }
      if (updatedData.aiAdvisors) {
        const index = updatedData.aiAdvisors.findIndex(p => p.id === editingPrompt.id);
        if (index !== -1) {
          updatedData.aiAdvisors[index] = editingPrompt;
        }
      }

      // Update AI Advisors prompt content if we're editing an AI Advisor
      const finalData = updateAIAdvisorsPrompt(updatedData);
      
      // Save to localStorage
      localStorage.setItem('promptsData', JSON.stringify(finalData));
      
      // Update state
      setPromptsData(finalData);
      setCurrentPrompt(editingPrompt);
      
      // Optionally save to file (you can uncomment this if you want to save to the actual JSON file)
      // await fetch('/api/save-prompts', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updatedData)
      // });
      
      alert('Prompt saved successfully!');
    } catch (error) {
      console.error('Error saving prompt:', error);
      alert('Error saving prompt. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentPrompt(null);
    setEditingPrompt(null);
  };

  // Function to update the AI Advisors prompt content
  const updateAIAdvisorsPrompt = (data: PromptsData) => {
    if (!data.aiAdvisors || data.aiAdvisors.length === 0) return data;

    // Find the AI Advisors prompt in rupertPrompts
    const rupertPrompts = data.rupertPrompts || [];
    const aiAdvisorsPromptIndex = rupertPrompts.findIndex(p => p.id === 'rupert-3');
    
    if (aiAdvisorsPromptIndex !== -1) {
      // Build the new content from AI Advisors
      const advisorsContent = data.aiAdvisors
        .map((advisor, index) => {
          const nameRole = advisor.title; // Name and role are in the title
          const oneLiner = advisor.content || '';
          return `${index + 1}. **${nameRole}**\n   ${oneLiner}`;
        })
        .join('\n\n');

      // Update the AI Advisors prompt content
      rupertPrompts[aiAdvisorsPromptIndex] = {
        ...rupertPrompts[aiAdvisorsPromptIndex],
        content: advisorsContent
      };

      // Update the data
      return {
        ...data,
        rupertPrompts
      };
    }

    return data;
  };



  if (isLoading) {
    return (
      <div className="bg-white text-black">
        <Header title="Prompt Hub" />
        <main className="page-wrap">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white text-black">
        <Header title="Prompt Hub" />
        <main className="page-wrap">
          <div className="text-red-600">Failed to load prompts: {error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-white text-black">
      <Header title="Prompt Hub" />

      <main className="page-wrap">
        <div className="min-h-[calc(100vh-300px)] -mt-4">
          <div className="w-full">
            <div className="bg-white border border-gray-200 rounded-lg p-10 shadow-lg h-full">
              {promptsData && (
                <>
                  {/* Cursor Prompts */}
                  <div className="mb-8">
                    <h2 className="text-lg text-gray-900 mb-6">Cursor Prompts</h2>
                    <div className="grid grid-cols-5 gap-4">
                      {promptsData.cursorPrompts?.map((prompt) => (
                        <div
                          key={prompt.id}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 cursor-pointer hover:bg-gray-100 transition-colors h-12 flex items-center"
                          onClick={() => openPrompt(prompt)}
                        >
                          <div className="text-gray-600 text-sm">{prompt.title}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Design Prompts */}
                  <div className="mb-8">
                    <h2 className="text-lg text-gray-900 mb-6">Design Prompts</h2>
                    <div className="grid grid-cols-5 gap-4">
                      {promptsData.designPrompts?.map((prompt) => (
                        <div
                          key={prompt.id}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 cursor-pointer hover:bg-gray-100 transition-colors h-12 flex items-center"
                          onClick={() => openPrompt(prompt)}
                        >
                          <div className="text-gray-600 text-sm">{prompt.title}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rupert Prompts */}
                  <div className="mb-8">
                    <h2 className="text-lg text-gray-900 mb-6">Rupert Prompts</h2>
                    <div className="grid grid-cols-5 gap-4">
                      {promptsData.rupertPrompts?.map((prompt) => (
                        <div
                          key={prompt.id}
                          className={`rounded-lg p-2.5 transition-colors h-12 flex items-center ${
                            prompt.id === 'rupert-3' 
                              ? 'bg-blue-100 border border-blue-200 cursor-pointer hover:bg-blue-200' 
                              : 'bg-gray-50 border border-gray-200 cursor-pointer hover:bg-gray-100'
                          }`}
                          onClick={() => prompt.id === 'rupert-3' ? openReadOnlyPrompt(prompt) : openPrompt(prompt)}
                        >
                          <div className={`text-sm ${
                            prompt.id === 'rupert-3' ? 'text-blue-700' : 'text-gray-600'
                          }`}>
                            {prompt.title}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Data Prompts */}
                  <div className="mb-8">
                    <h2 className="text-lg text-gray-900 mb-6">Data Prompts</h2>
                    <div className="grid grid-cols-5 gap-4">
                      {promptsData.dataPrompts?.map((prompt) => (
                        <div
                          key={prompt.id}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 cursor-pointer hover:bg-gray-100 transition-colors h-12 flex items-center"
                          onClick={() => openPrompt(prompt)}
                        >
                          <div className="text-gray-600 text-sm">{prompt.title}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Advisors */}
                  <div className="mb-8">
                    <h2 className="text-lg text-gray-900 mb-6">AI Advisors</h2>
                    <div className="grid grid-cols-5 gap-4">
                      {promptsData.aiAdvisors?.map((prompt) => (
                        <div
                          key={prompt.id}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 cursor-pointer hover:bg-gray-100 transition-colors h-12 flex items-center"
                          onClick={() => openPrompt(prompt)}
                        >
                          <div className="text-gray-600 text-sm">{prompt.title}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal Window */}
      {isModalOpen && currentPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[900px] max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {editingPrompt ? 'Edit Prompt' : 'View Prompt'}
                </h2>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              {editingPrompt ? (
                // Edit Mode
                <div className="space-y-4">
                  {/* Title Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editingPrompt.title}
                      onChange={(e) => setEditingPrompt({ ...editingPrompt, title: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Content Textarea */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content
                    </label>
                    <textarea
                      value={editingPrompt.content}
                      onChange={(e) => setEditingPrompt({ ...editingPrompt, content: e.target.value })}
                      rows={15}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={savePrompt}
                      disabled={isSaving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              ) : (
                // Read-only Mode
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <div className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-900">
                      {currentPrompt.title}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content
                    </label>
                    <div className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 max-h-[60vh] overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm font-mono">{currentPrompt.content}</pre>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
