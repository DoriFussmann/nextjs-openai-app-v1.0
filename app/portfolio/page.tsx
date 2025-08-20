'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/Button';

interface Prompt {
  id: string;
  title: string;
  content: string;
}

interface Subtopic {
  id: string;
  name: string;
  hasData: boolean;
  data: string;
}

interface Topic {
  id: string;
  title: string;
  subtopics: Subtopic[];
  completionPercentage: number;
}

interface CompanyAnalysis {
  topics: Topic[];
  analysisId: string;
  timestamp: string;
  summary?: string;
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
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [companyAnalysis, setCompanyAnalysis] = useState<CompanyAnalysis | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<Subtopic | null>(null);
  const [collapsedTopics, setCollapsedTopics] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    loadPrompts();
  }, []);

  // Load persisted data after prompts are loaded
  useEffect(() => {
    if (rupertPrompts.length > 0 || dataPrompts.length > 0) {
      loadPersistedData();
    }
  }, [rupertPrompts, dataPrompts]);

  const loadPersistedData = () => {
    // Load persisted form data from localStorage
    const savedUserInput = localStorage.getItem('companyData_userInput');
    const savedSelectedPrompt = localStorage.getItem('companyData_selectedPrompt');
    const savedSelectedDataPrompt = localStorage.getItem('companyData_selectedDataPrompt');
    
    console.log('Loading persisted data:', { savedUserInput, savedSelectedPrompt, savedSelectedDataPrompt });
    
    if (savedUserInput) {
      setUserInput(savedUserInput);
    }
    if (savedSelectedPrompt) {
      setSelectedPrompt(savedSelectedPrompt);
    }
    if (savedSelectedDataPrompt) {
      setSelectedDataPrompt(savedSelectedDataPrompt);
    }
    
    // Load persisted company analysis
    const savedAnalysis = localStorage.getItem('companyAnalysis');
    if (savedAnalysis) {
      try {
        const parsedAnalysis = JSON.parse(savedAnalysis);
        setCompanyAnalysis(parsedAnalysis);
      } catch (error) {
        console.error('Failed to parse saved analysis:', error);
      }
    }
  };

  const saveToLocalStorage = (key: string, value: string) => {
    localStorage.setItem(`companyData_${key}`, value);
  };

  const toggleTopic = (topicId: string) => {
    setCollapsedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  const openSubtopicModal = (subtopic: Subtopic) => {
    setSelectedSubtopic(subtopic);
  };

  const closeSubtopicModal = () => {
    setSelectedSubtopic(null);
  };

  // Simple rich text formatter component
  const RichTextDisplay = ({ text }: { text: string }) => {
    const formatText = (content: string) => {
      const lines = content.split('\n');
      const formattedElements: JSX.Element[] = [];
      let currentList: string[] = [];
      let lineIndex = 0;

      const flushList = () => {
        if (currentList.length > 0) {
          formattedElements.push(
            <ul key={`list-${lineIndex}`} className="list-disc pl-5 mb-4 space-y-1">
              {currentList.map((item, idx) => (
                <li key={idx} className="text-gray-800">{formatInlineText(item)}</li>
              ))}
            </ul>
          );
          currentList = [];
        }
      };

      const formatInlineText = (text: string) => {
        // Handle bold text **text**
        let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Handle italic text *text*
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
      };

      lines.forEach((line, idx) => {
        lineIndex = idx;
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
          // List item
          currentList.push(trimmedLine.substring(2));
        } else if (trimmedLine.startsWith('# ')) {
          // Heading
          flushList();
          formattedElements.push(
            <h2 key={idx} className="text-xl font-semibold text-gray-900 mb-3 mt-6">
              {formatInlineText(trimmedLine.substring(2))}
            </h2>
          );
        } else if (trimmedLine.startsWith('## ')) {
          // Subheading
          flushList();
          formattedElements.push(
            <h3 key={idx} className="text-lg font-medium text-gray-900 mb-2 mt-4">
              {formatInlineText(trimmedLine.substring(3))}
            </h3>
          );
        } else if (trimmedLine === '') {
          // Empty line - flush any pending list
          flushList();
        } else {
          // Regular paragraph
          flushList();
          if (trimmedLine) {
            formattedElements.push(
              <p key={idx} className="text-gray-800 mb-3 leading-relaxed">
                {formatInlineText(trimmedLine)}
              </p>
            );
          }
        }
      });

      // Flush any remaining list items
      flushList();

      return formattedElements;
    };

    return <div className="space-y-2">{formatText(text)}</div>;
  };

  // Progress Bar Component
  const ProgressBar = ({ percentage }: { percentage: number }) => {
    const clampedPercentage = Math.min(100, Math.max(0, percentage));
    
    // Subtle color based on completion percentage
    const getProgressColor = (percent: number) => {
      if (percent >= 80) return 'bg-emerald-400';
      if (percent >= 60) return 'bg-blue-400';
      if (percent >= 40) return 'bg-amber-400';
      return 'bg-rose-400';
    };

    return (
      <div className="mt-3">
        {/* Simple progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ease-out ${getProgressColor(clampedPercentage)}`}
            style={{ width: `${clampedPercentage}%` }}
          ></div>
        </div>
        {/* Just percentage on the right */}
        <div className="text-right mt-1">
          <span className="text-xs text-gray-500">
            {clampedPercentage}%
          </span>
        </div>
      </div>
    );
  };

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
    setDebugInfo('');

    try {
      const completePrompt = getCompletePrompt();
      
      // Set debug info to show what we're sending
      setDebugInfo(`Sending to OpenAI:\nAction: data-handling\nPrompt length: ${completePrompt.length} characters\n\nFull prompt:\n${completePrompt}`);
      
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
          data: completePrompt,
          action: 'structured-json',
          prompt: 'Analyze the provided company information and organize it into the most relevant main topics (typically 3-8 topics). For each topic, identify subtopics and assess data availability. Calculate completion percentage for each topic based on available data.',
          reference: JSON.stringify({
            "topics": [
              {
                "id": "topic1",
                "title": "Topic Name",
                "subtopics": [
                  {
                    "id": "subtopic1", 
                    "name": "Subtopic Name",
                    "hasData": true,
                    "data": "Detailed information about this subtopic or 'not available' if no data"
                  }
                ],
                "completionPercentage": 85
              }
            ]
          }),
          outputFormat: 'Must return 3-8 topics with their subtopics, data availability indicators, and completion percentages'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data); // Debug logging
        
        if (data.isValidJson && data.parsedData && data.parsedData.topics) {
          // Get summary response with a second API call
          const summaryResponse = await fetch('/api/openai', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt: `Based on the company information provided, write a comprehensive executive summary that highlights the key findings, insights, and recommendations. Focus on the most important aspects for business decision-making.

Format your response using:
- **Bold text** for key points and headings
- *Italic text* for emphasis
- # Main headings for major sections
- ## Subheadings for subsections
- - Bullet points for lists
- Clear paragraphs with line breaks

Company Information:
${completePrompt}`,
              action: 'data-handling'
            }),
          });

          let summaryText = '';
          if (summaryResponse.ok) {
            const summaryData = await summaryResponse.json();
            summaryText = summaryData.response || '';
          }

          // Process structured JSON response with summary
          const analysisData: CompanyAnalysis = {
            topics: data.parsedData.topics,
            analysisId: `analysis_${Date.now()}`,
            timestamp: new Date().toISOString(),
            summary: summaryText
          };
          
          setCompanyAnalysis(analysisData);
          setResponse(''); // Clear raw response since we're showing structured data
          
          console.log(`Displaying ${analysisData.topics.length} topics (all collapsed by default):`, analysisData.topics.map(t => t.title));
          
          // Save to localStorage
          localStorage.setItem('companyAnalysis', JSON.stringify(analysisData));
          
        } else if (data.result) {
          // Fallback to raw response if JSON parsing failed
          setResponse(data.result);
          setCompanyAnalysis(null);
        } else {
          // Show detailed debug information
          setResponse(`Debug Info: Response received but no content available.\n\nFull API Response:\n${JSON.stringify(data, null, 2)}\n\nThis usually means the API call succeeded but returned unexpected data structure.`);
        }
      } else {
        const errorText = await response.text();
        console.error('API Error Response:', errorText); // Debug logging
        
        if (response.status === 401) {
          setResponse('API authentication failed. Please check your OpenAI API key.');
        } else if (response.status === 429) {
          setResponse('Rate limit exceeded. Please try again later.');
        } else {
          setResponse(`API Error (${response.status}): ${errorText}\n\nThis error suggests there's an issue with the API request or server configuration.`);
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
                // Clear all form inputs and selections
                setUserInput('');
                setSelectedPrompt('');
                setSelectedDataPrompt('');
                setShowBottomBox(false);
                setShowPromptModal(false);
                setResponse('');
                setDebugInfo('');
                setCompanyAnalysis(null);
                
                // Clear localStorage
                localStorage.removeItem('companyData_userInput');
                localStorage.removeItem('companyData_selectedPrompt');
                localStorage.removeItem('companyData_selectedDataPrompt');
                localStorage.removeItem('companyAnalysis');
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
                    onChange={(e) => {
                      setUserInput(e.target.value);
                      saveToLocalStorage('userInput', e.target.value);
                    }}
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
                              onChange={(e) => {
                                setSelectedPrompt(e.target.value);
                                saveToLocalStorage('selectedPrompt', e.target.value);
                              }}
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
                              onChange={(e) => {
                                setSelectedDataPrompt(e.target.value);
                                saveToLocalStorage('selectedDataPrompt', e.target.value);
                              }}
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
                ) : companyAnalysis ? (
                  <>
                    {/* Topic Grid - 3 columns per row, multiple rows as needed */}
                    <div className="grid grid-cols-3 gap-4">
                      {companyAnalysis.topics.map((topic) => (
                        <div key={topic.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          {/* Topic Header */}
                          <div 
                            className="flex justify-between items-center cursor-pointer"
                            onClick={() => toggleTopic(topic.id)}
                          >
                            <h3 className="text-lg font-medium text-gray-900">{topic.title}</h3>
                            <div className="text-gray-400 hover:text-gray-600 transition-colors">
                              <svg 
                                className={`w-5 h-5 transform transition-transform duration-200 ${
                                  collapsedTopics[topic.id] ? 'rotate-180' : ''
                                }`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <ProgressBar percentage={topic.completionPercentage} />
                          
                          {/* Collapsible Subtopics */}
                          {collapsedTopics[topic.id] && (
                            <div className="mt-4 space-y-2">
                              {topic.subtopics.map((subtopic) => (
                                <div 
                                  key={subtopic.id}
                                  className="flex items-center justify-between p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                                  onClick={() => openSubtopicModal(subtopic)}
                                >
                                  <span className="text-sm text-gray-700">{subtopic.name}</span>
                                  <div className="flex items-center">
                                    {subtopic.hasData && subtopic.data && subtopic.data !== 'not available' ? (
                                      <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    ) : (
                                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Executive Summary Section */}
                    {companyAnalysis.summary && (
                      <div className="mt-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Executive Summary</h3>
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                          <RichTextDisplay text={companyAnalysis.summary} />
                        </div>
                      </div>
                    )}
                  </>
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

              {/* Debug Information - Only show when there's debug info */}
              {debugInfo && (
                <div className="mt-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Debug Information:</h4>
                    <div className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                      {debugInfo}
                    </div>
                  </div>
                </div>
              )}

              {/* Clear Button - Bottom Right Corner */}
              <div className="absolute bottom-6 right-6">
                <Button 
                  variant="secondary"
                  size="sm"
                  className="!rounded-lg"
                  onClick={() => {
                    // Clear only the output/response data
                    setResponse('');
                    setDebugInfo('');
                    setCompanyAnalysis(null);
                    localStorage.removeItem('companyAnalysis');
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Subtopic Modal */}
      {selectedSubtopic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-[700px] max-h-[80vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-medium text-gray-900">{selectedSubtopic.name}</h3>
              <Button variant="ghost" size="sm" onClick={closeSubtopicModal} className="text-2xl font-light">
                ×
              </Button>
            </div>
            
            {/* Data Status */}
            <div className="mb-4">
              <div className="flex items-center">
                {selectedSubtopic.hasData && selectedSubtopic.data && selectedSubtopic.data !== 'not available' ? (
                  <>
                    <svg className="w-5 h-5 text-emerald-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-emerald-700">
                      Data Available
                    </span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-gray-600">
                      No Data Available
                    </span>
                  </>
                )}
              </div>
            </div>
            
            {/* Content */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="text-sm text-gray-800 whitespace-pre-wrap">
                {selectedSubtopic.data || 'No data available for this subtopic.'}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex justify-end mt-6">
              <Button variant="secondary" size="md" onClick={closeSubtopicModal}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

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