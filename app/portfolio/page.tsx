'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/Button';

interface Prompt {
  id: string;
  title: string;
  content: string;
}

export default function CompanyData() {
  const [userInput, setUserInput] = useState<string>('');
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  const [selectedDataPrompt, setSelectedDataPrompt] = useState<string>('');
  const [showBottomBox, setShowBottomBox] = useState<boolean>(false);
  const [rupertPrompts, setRupertPrompts] = useState<Prompt[]>([]);
  const [dataPrompts, setDataPrompts] = useState<Prompt[]>([]);
  const [isTestingAPI, setIsTestingAPI] = useState<boolean>(false);
  const [testSuccess, setTestSuccess] = useState<boolean>(false);
  const [showPromptModal, setShowPromptModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string>('');

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      // First try to load from localStorage
      const localData = localStorage.getItem('promptsData');
      if (localData) {
        const parsedData = JSON.parse(localData);
        if (parsedData.rupertPrompts) {
          setRupertPrompts(parsedData.rupertPrompts);
        }
        if (parsedData.dataPrompts) {
          setDataPrompts(parsedData.dataPrompts);
        }
        return;
      }

      // Fallback to JSON file
      const response = await fetch('/data/prompts.json');
      if (response.ok) {
        const data = await response.json();
        if (data.rupertPrompts) {
          setRupertPrompts(data.rupertPrompts);
        }
        if (data.dataPrompts) {
          setDataPrompts(data.dataPrompts);
        }
      }
    } catch (error) {
      console.error('Error loading prompts:', error);
      // Fallback to empty arrays
      setRupertPrompts([]);
      setDataPrompts([]);
    }
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
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('API test failed:', error);
    } finally {
      setIsTestingAPI(false);
    }
  };

  const getCompletePrompt = () => {
    const selectedRupertPrompt = rupertPrompts.find(p => p.id === selectedPrompt);
    const selectedDataPromptObj = dataPrompts.find(p => p.id === selectedDataPrompt);
    
    let prompt = '';
    
    if (selectedRupertPrompt) {
      prompt += `Rupert's Prompt:\n${selectedRupertPrompt.content}\n\n`;
    }
    
    if (selectedDataPromptObj) {
      prompt += `Data Prompt:\n${selectedDataPromptObj.content}\n\n`;
    }
    
    if (userInput.trim()) {
      prompt += `Company Information:\n${userInput}`;
    }
    
    return prompt || 'No prompts or company information selected.';
  };

  const handleGetCompanyData = async () => {
    setIsLoading(true);
    setResponse('');

    try {
      const completePrompt = getCompletePrompt();
      
      if (!completePrompt || completePrompt === 'No prompts or company information selected.') {
        setResponse('Please select prompts and enter company information before proceeding.');
        return;
      }

      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: completePrompt,
          action: 'data-handling'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResponse(data.response || 'Response received but no content available.');
      } else {
        const errorText = await response.text();
        if (response.status === 401) {
          setResponse('API authentication failed. Please check your OpenAI API key.');
        } else if (response.status === 429) {
          setResponse('Rate limit exceeded. Please try again later.');
        } else {
          setResponse(`API error (${response.status}): ${errorText}`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setResponse(`Network error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white text-black font-inter">
      {/* Page Header */}
      <header className="border-b border-gray-200 px-4">
        <div className="page-wrap flex justify-between items-center">
          <div className="text-3xl">Company Data</div>
          <nav className="hidden md:flex space-x-4">
            <Button 
              variant="secondary" 
              size="sm"
              className="!rounded-lg"
              onClick={() => {
                // Static - no functionality
              }}
            >
              Reset
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              className="!rounded-lg"
              onClick={() => {
                window.location.href = '/';
              }}
            >
              Home
            </Button>
          </nav>
        </div>
      </header>

      <main className="page-wrap">
        {/* Two Column Layout */}
        <div className="flex gap-6 min-h-[calc(100vh-300px)] -mt-4">
          
          {/* Left Content Area - Inputs (25%) */}
          <div className="w-1/4">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg h-full">
              <h2 className="text-xl text-gray-900 mb-3">Company Inputs</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Company information</label>
                  <textarea 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type or paste company information here..."
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-vertical min-h-[120px]"
                    rows={5}
                  />
                </div>
                <Button 
                  variant="primary" 
                  size="sm"
                  className="w-full mt-6 !rounded-lg"
                  onClick={handleGetCompanyData}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Get Company Data'}
                </Button>

                {/* Collapsible Bottom Box */}
                <div className="mt-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg">
                    <div 
                      className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => setShowBottomBox(!showBottomBox)}
                    >
                      <div className="text-sm text-gray-700">Admin</div>
                      <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                        {showBottomBox ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    
                    {showBottomBox && (
                      <div className="border-t border-gray-200 p-4 bg-white">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm text-gray-700 mb-2">Rupert's prompts</label>
                            <select 
                              value={selectedPrompt}
                              onChange={(e) => setSelectedPrompt(e.target.value)}
                              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            >
                              <option value="">Select a prompt...</option>
                              {rupertPrompts.map((prompt) => (
                                <option key={prompt.id} value={prompt.id}>
                                  {prompt.title}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm text-gray-700 mb-2">Data prompts</label>
                            <select 
                              value={selectedDataPrompt}
                              onChange={(e) => setSelectedDataPrompt(e.target.value)}
                              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            >
                              <option value="">Select a data prompt...</option>
                              {dataPrompts.map((prompt) => (
                                <option key={prompt.id} value={prompt.id}>
                                  {prompt.title}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="flex space-x-3">
                            <Button 
                              variant="secondary"
                              size="sm"
                              className="!rounded-lg flex-1"
                              onClick={() => setShowPromptModal(true)}
                            >
                              Prompt
                            </Button>
                            <Button 
                              variant={testSuccess ? "primary" : "secondary"}
                              size="sm"
                              className={`!rounded-lg flex-1 ${testSuccess ? '!bg-green-600 hover:!bg-green-700' : ''}`}
                              onClick={handleTestAPI}
                              disabled={isTestingAPI}
                            >
                              {isTestingAPI ? 'Testing...' : testSuccess ? '✓ Success!' : 'Test API'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Area - Outputs (75%) */}
          <div className="w-3/4">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg h-full relative">
              <h2 className="text-xl text-gray-900 mb-3">Data Results</h2>
              
              {/* Content area */}
              <div className="mt-4">
                {isLoading ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-700">
                      Processing your request...
                    </p>
                  </div>
                ) : response ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-800 whitespace-pre-wrap">
                      {response}
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-700">
                      Enter company information above, then click "Get Company Data" to see the company data analysis.
                    </p>
                  </div>
                )}
              </div>

              {/* Reset Button - Bottom Right Corner */}
              <div className="absolute bottom-6 right-6">
                <Button 
                  variant="secondary"
                  size="sm"
                  className="!rounded-lg"
                  onClick={() => {
                    // Clear all form inputs and selections
                    setUserInput('');
                    setSelectedPrompt('');
                    setSelectedDataPrompt('');
                    setShowBottomBox(false);
                    setShowPromptModal(false);
                    setResponse('');
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Complete Prompt Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Complete Prompt</h3>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowPromptModal(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                {getCompletePrompt()}
              </pre>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setShowPromptModal(false)}
              >
                Close
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(getCompletePrompt());
                  // Could add a toast notification here
                }}
              >
                Copy Prompt
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
