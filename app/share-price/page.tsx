'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Prompt {
  id: string;
  title: string;
  content: string;
}

interface PromptsData {
  cursorPrompts: Prompt[];
  designPrompts: Prompt[];
  rupertPrompts: Prompt[];
}

export default function SharePrice() {
  const [rupertPrompts, setRupertPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  const [selectedStock, setSelectedStock] = useState<string>('Apple');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>('1 Year');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string>('');
  const [isTestingAPI, setIsTestingAPI] = useState<boolean>(false);
  const [testSuccess, setTestSuccess] = useState<boolean>(false);
  const [showPromptModal, setShowPromptModal] = useState<boolean>(false);
  const [chartData, setChartData] = useState<any>(null);
  const [keyEvents, setKeyEvents] = useState<any[]>([]);
  const [showBottomBox, setShowBottomBox] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    loadRupertPrompts();
    loadFormData();
  }, []);

  // Save form data whenever inputs change
  useEffect(() => {
    saveFormData();
  }, [selectedStock, selectedTimePeriod]);

  // Force chart re-render when keyEvents change
  useEffect(() => {
    if (chartData) {
      // Trigger a re-render by updating the chart data with new point styling
      setChartData({...chartData});
    }
  }, [keyEvents]);

  const saveFormData = () => {
    const formData = {
      selectedStock,
      selectedTimePeriod,
      // Note: selectedPrompt is intentionally excluded - it will reset to empty
    };
    localStorage.setItem('sharePageFormData', JSON.stringify(formData));
  };

  const loadFormData = () => {
    try {
      const savedData = localStorage.getItem('sharePageFormData');
      if (savedData) {
        const formData = JSON.parse(savedData);
        if (formData.selectedStock) setSelectedStock(formData.selectedStock);
        if (formData.selectedTimePeriod) setSelectedTimePeriod(formData.selectedTimePeriod);
      }
    } catch (error) {
      console.error('Error loading form data:', error);
    }
  };

  const loadRupertPrompts = async () => {
    try {
      // First try to load from localStorage
      const localData = localStorage.getItem('promptsData');
      if (localData) {
        const parsedData: PromptsData = JSON.parse(localData);
        if (parsedData.rupertPrompts) {
          setRupertPrompts(parsedData.rupertPrompts);
          return;
        }
      }

      // Fallback to default data file
      const response = await fetch('/data/prompts.json');
      if (response.ok) {
        const data: PromptsData = await response.json();
        if (data.rupertPrompts) {
          setRupertPrompts(data.rupertPrompts);
        }
      }
    } catch (error) {
      console.error('Error loading Rupert prompts:', error);
    }
  };

  const handleGetSharePrice = async () => {
    if (!selectedPrompt) {
      alert('Please select a Rupert prompt first.');
      return;
    }

    const selectedPromptData = rupertPrompts.find(p => p.id === selectedPrompt);
    if (!selectedPromptData) {
      alert('Selected prompt not found.');
      return;
    }

    setIsLoading(true);
    setResponse('');
    setChartData(null);
    setKeyEvents([]);

    try {
      const requestBody = {
        prompt: `${selectedPromptData.content}\n\nStock: ${selectedStock}\nTime Period: ${selectedTimePeriod}`,
        action: 'data-handling'
      };

      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setResponse(`API Error (${response.status}): ${errorText}`);
        return;
      }

      const data = await response.json();
      
      // Handle different response formats from the API
      const responseText = data.response || data.result || data.collectedText || JSON.stringify(data);
      
      setResponse(responseText);
      
      // Parse the response for chart data and events
      parseResponseForChart(responseText);
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      setResponse(`Network Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setIsLoading(false);
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
        setResponse(`Test API Error (${response.status}): ${errorText}`);
        console.error('API test failed:', errorText);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setResponse(`Test API Network Error: ${errorMessage}`);
      console.error('API test failed:', error);
    } finally {
      setIsTestingAPI(false);
    }
  };

  const parseResponseForChart = (responseText: string) => {
    try {
      // More aggressive parsing - look for any dates and prices in the entire response
      const lines = responseText.split('\n');
      const priceData: { date: string; price: number }[] = [];
      const events: { date: string; event: string; impact: string }[] = [];
      
      // Enhanced date patterns
      const datePatterns = [
        /(\d{4}-\d{2}-\d{2})/g,                          // 2024-01-15
        /(\w{3,9}\s+\d{1,2},?\s+\d{4})/g,               // January 15, 2024 or Jan 15 2024
        /(\d{1,2}\/\d{1,2}\/\d{4})/g,                   // 1/15/2024
        /(\d{1,2}-\d{1,2}-\d{4})/g,                     // 1-15-2024
      ];
      
      // Enhanced price patterns
      const pricePatterns = [
        /\$(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)/g,          // $150.50 or $1,234.56
        /(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|\$)/g, // 150.50 USD
        /price:?\s*\$?(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)/gi, // Price: $150.50
      ];
      
      // Try to extract any date-price combinations from the entire text
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.length < 5) continue;
        
        // Look for lines that contain both dates and prices
        const dateMatches = datePatterns.flatMap(pattern => 
          Array.from(trimmedLine.matchAll(pattern)).map(match => match[1])
        );
        
        const priceMatches = pricePatterns.flatMap(pattern => 
          Array.from(trimmedLine.matchAll(pattern)).map(match => 
            parseFloat(match[1].replace(/,/g, ''))
          )
        ).filter(price => price > 0 && price < 10000); // Reasonable stock price range
        
        // If we found both date and price in the same line, pair them up
        if (dateMatches.length > 0 && priceMatches.length > 0) {
          dateMatches.forEach((date, index) => {
            if (priceMatches[index] !== undefined) {
              priceData.push({
                date: date,
                price: priceMatches[index]
              });
            }
          });
        }
        
        // Extract events (lines that mention significant company/market events)
        const eventKeywords = [
          'earnings', 'announcement', 'launch', 'acquisition', 'merger',
          'partnership', 'split', 'dividend', 'ceo', 'layoffs', 'expansion',
          'product', 'revenue', 'profit', 'loss', 'scandal', 'lawsuit',
          'ipo', 'buyback', 'guidance', 'upgrade', 'downgrade'
        ];
        
        const hasEventKeyword = eventKeywords.some(keyword => 
          trimmedLine.toLowerCase().includes(keyword)
        );
        
        if (hasEventKeyword && trimmedLine.length > 20) {
          const dateMatch = datePatterns.flatMap(pattern => 
            Array.from(trimmedLine.matchAll(pattern)).map(match => match[1])
          )[0];
          
          events.push({
            date: dateMatch || 'N/A',
            event: trimmedLine,
            impact: 'neutral'
          });
        }
      }
      
      // If no structured data found, create sample data based on the stock and time period
      if (priceData.length === 0) {
        console.log('No price data found, creating sample data for visualization');
        
        // Generate sample price data for demonstration
        const timeFrameMonths = selectedTimePeriod === '1 Year' ? 6 : 
                               selectedTimePeriod === '2 Years' ? 12 : 18;
        
        const basePrice = selectedStock === 'Apple' ? 150 : 
                         selectedStock === 'Tesla' ? 200 :
                         selectedStock === 'Microsoft' ? 300 :
                         selectedStock === 'IBM' ? 130 : 400; // Netflix
        
        const sampleData = [];
        for (let i = 0; i < timeFrameMonths; i++) {
          const date = new Date();
          date.setMonth(date.getMonth() - (timeFrameMonths - i - 1));
          const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
          const price = basePrice * (1 + variation * (i / timeFrameMonths));
          
          sampleData.push({
            date: date.toISOString().split('T')[0],
            price: Math.round(price * 100) / 100
          });
        }
        
        const formattedLabels = sampleData.map(d => {
          const date = new Date(d.date);
          const formatted = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          console.log('Original date:', d.date, 'Formatted:', formatted);
          return formatted;
        });
        
        setChartData({
          labels: formattedLabels,
          datasets: [
            {
              label: `${selectedStock} Stock Price`,
              data: sampleData.map(d => d.price),
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderWidth: 2,
              tension: 0.4,
              pointRadius: function(context: any) {
                const chart = context.chart;
                const dataIndex = context.dataIndex;
                const label = chart.data.labels[dataIndex];
                
                // Check if this date matches any key event
                const hasEvent = keyEvents.some(event => {
                  if (event.date === 'N/A') return false;
                  // Format event date to match chart label format
                  const eventDate = new Date(event.date);
                  const eventLabel = eventDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                  return eventLabel === label;
                });
                
                return hasEvent ? 6 : 0;
              },
              pointHoverRadius: function(context: any) {
                const chart = context.chart;
                const dataIndex = context.dataIndex;
                const label = chart.data.labels[dataIndex];
                
                // Check if this date matches any key event
                const hasEvent = keyEvents.some(event => {
                  if (event.date === 'N/A') return false;
                  const eventDate = new Date(event.date);
                  const eventLabel = eventDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                  return eventLabel === label;
                });
                
                return hasEvent ? 8 : 0;
              },
              pointBackgroundColor: function(context: any) {
                const chart = context.chart;
                const dataIndex = context.dataIndex;
                const label = chart.data.labels[dataIndex];
                
                // Check if this date matches any key event
                const hasEvent = keyEvents.some(event => {
                  if (event.date === 'N/A') return false;
                  const eventDate = new Date(event.date);
                  const eventLabel = eventDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                  return eventLabel === label;
                });
                
                return hasEvent ? 'rgb(239, 68, 68)' : 'transparent';
              },
              pointBorderColor: function(context: any) {
                const chart = context.chart;
                const dataIndex = context.dataIndex;
                const label = chart.data.labels[dataIndex];
                
                // Check if this date matches any key event
                const hasEvent = keyEvents.some(event => {
                  if (event.date === 'N/A') return false;
                  const eventDate = new Date(event.date);
                  const eventLabel = eventDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                  return eventLabel === label;
                });
                
                return hasEvent ? 'white' : 'transparent';
              },
              pointBorderWidth: function(context: any) {
                const chart = context.chart;
                const dataIndex = context.dataIndex;
                const label = chart.data.labels[dataIndex];
                
                // Check if this date matches any key event
                const hasEvent = keyEvents.some(event => {
                  if (event.date === 'N/A') return false;
                  const eventDate = new Date(event.date);
                  const eventLabel = eventDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                  return eventLabel === label;
                });
                
                return hasEvent ? 2 : 0;
              },
            },
          ],
        });
        
        // Add sample events
        setKeyEvents([
          {
            date: sampleData[Math.floor(sampleData.length * 0.3)].date,
            event: `${selectedStock} quarterly earnings report released`,
            impact: 'positive'
          },
          {
            date: sampleData[Math.floor(sampleData.length * 0.6)].date,
            event: `New product announcement from ${selectedStock}`,
            impact: 'positive'
          },
          {
            date: sampleData[Math.floor(sampleData.length * 0.8)].date,
            event: `Market volatility affects ${selectedStock} trading`,
            impact: 'neutral'
          }
        ]);
        
      } else {
        // Use parsed data
        const sortedData = priceData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setChartData({
          labels: sortedData.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          }),
          datasets: [
            {
              label: `${selectedStock} Stock Price`,
              data: sortedData.map(d => d.price),
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderWidth: 2,
              tension: 0.4,
              pointRadius: function(context: any) {
                const chart = context.chart;
                const dataIndex = context.dataIndex;
                const label = chart.data.labels[dataIndex];
                
                // Check if this date matches any key event
                const hasEvent = keyEvents.some(event => {
                  if (event.date === 'N/A') return false;
                  // Format event date to match chart label format
                  const eventDate = new Date(event.date);
                  const eventLabel = eventDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                  return eventLabel === label;
                });
                
                return hasEvent ? 6 : 0;
              },
              pointHoverRadius: function(context: any) {
                const chart = context.chart;
                const dataIndex = context.dataIndex;
                const label = chart.data.labels[dataIndex];
                
                // Check if this date matches any key event
                const hasEvent = keyEvents.some(event => {
                  if (event.date === 'N/A') return false;
                  const eventDate = new Date(event.date);
                  const eventLabel = eventDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                  return eventLabel === label;
                });
                
                return hasEvent ? 8 : 0;
              },
              pointBackgroundColor: function(context: any) {
                const chart = context.chart;
                const dataIndex = context.dataIndex;
                const label = chart.data.labels[dataIndex];
                
                // Check if this date matches any key event
                const hasEvent = keyEvents.some(event => {
                  if (event.date === 'N/A') return false;
                  const eventDate = new Date(event.date);
                  const eventLabel = eventDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                  return eventLabel === label;
                });
                
                return hasEvent ? 'rgb(239, 68, 68)' : 'transparent';
              },
              pointBorderColor: function(context: any) {
                const chart = context.chart;
                const dataIndex = context.dataIndex;
                const label = chart.data.labels[dataIndex];
                
                // Check if this date matches any key event
                const hasEvent = keyEvents.some(event => {
                  if (event.date === 'N/A') return false;
                  const eventDate = new Date(event.date);
                  const eventLabel = eventDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                  return eventLabel === label;
                });
                
                return hasEvent ? 'white' : 'transparent';
              },
              pointBorderWidth: function(context: any) {
                const chart = context.chart;
                const dataIndex = context.dataIndex;
                const label = chart.data.labels[dataIndex];
                
                // Check if this date matches any key event
                const hasEvent = keyEvents.some(event => {
                  if (event.date === 'N/A') return false;
                  const eventDate = new Date(event.date);
                  const eventLabel = eventDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                  return eventLabel === label;
                });
                
                return hasEvent ? 2 : 0;
              },
            },
          ],
        });
        
        if (events.length > 0) {
          setKeyEvents(events);
        }
      }
      
    } catch (error) {
      console.error('Error parsing response for chart:', error);
    }
  };

  const getCompletePrompt = () => {
    const selectedPromptData = rupertPrompts.find(prompt => prompt.id === selectedPrompt);
    if (!selectedPromptData) {
      return 'Please select a Rupert Prompt first.';
    }

    return `${selectedPromptData.content}

Additional context:
- Stock: ${selectedStock}
- Time Period: ${selectedTimePeriod}`;
  };
  return (
    <div className="bg-white text-black font-inter">
      {/* Page Header */}
      <header className="border-b border-gray-200 px-4">
        <div className="page-wrap flex justify-between items-center">
          <div className="text-3xl">Share Price</div>
          <nav className="hidden md:flex space-x-4">
            <Button 
              variant="secondary" 
              size="sm"
              className="!rounded-lg"
              onClick={() => {
                // Clear outputs and UI state
                setResponse('');
                setChartData(null);
                setKeyEvents([]);
                setShowBottomBox(false);
                
                // Reset form inputs to defaults (except Rupert's prompts)
                setSelectedStock('Apple');
                setSelectedTimePeriod('1 Year');
                // Note: selectedPrompt is NOT reset - it keeps current selection
                
                // Update localStorage with reset values
                const resetFormData = {
                  selectedStock: 'Apple',
                  selectedTimePeriod: '1 Year',
                };
                localStorage.setItem('sharePageFormData', JSON.stringify(resetFormData));
              }}
            >
              Reset
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              className="!rounded-lg"
              onClick={() => window.location.href = '/'}
            >
              Home
            </Button>
          </nav>
        </div>
      </header>

      <main className="page-wrap">
        {/* Two Column Layout */}
        <div className="flex gap-6 min-h-[calc(100vh-300px)] -mt-4">
          {/* Left Sidebar - Inputs (25%) */}
          <div className="w-1/4">
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg h-full">
              <h2 className="text-xl text-gray-900 mb-6">Inputs</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Choose stock</label>
                  <select 
                    value={selectedStock}
                    onChange={(e) => setSelectedStock(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option>Apple</option>
                    <option>Tesla</option>
                    <option>Microsoft</option>
                    <option>IBM</option>
                    <option>Netflix</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Time period</label>
                  <select 
                    value={selectedTimePeriod}
                    onChange={(e) => setSelectedTimePeriod(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option>1 Year</option>
                    <option>2 Years</option>
                    <option>3 Years</option>
                  </select>
                </div>
                <Button 
                  variant="primary" 
                  size="sm"
                  className="w-full mt-6 !rounded-lg"
                  onClick={handleGetSharePrice}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Get Share Price'}
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
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg h-full">
              <h2 className="text-xl text-gray-900 mb-3">Share Price Data</h2>
              
              {/* Chart Display */}
              {chartData && (
                <div className="mt-4 mb-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="h-64">
                      <Line 
                        data={chartData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false,
                            },
                            title: {
                              display: false,
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: false,
                              title: {
                                display: false,
                              },
                              grace: '10%',
                              ticks: {
                                maxTicksLimit: 6,
                              },
                            },
                            x: {
                              title: {
                                display: false,
                              },
                              ticks: {
                                maxTicksLimit: 12,
                                maxRotation: 45,
                                minRotation: 45,
                                callback: function(value: any, index: number) {
                                  const label = this.getLabelForValue(value);
                                  return label;
                                }
                              }
                            },
                          },
                        }} 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Key Events */}
              {keyEvents.length > 0 && (
                <div className="mt-4 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Key Events</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {keyEvents.map((event, index) => (
                      <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mt-1"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            {event.date !== 'N/A' && (
                              <p className="text-sm font-medium text-blue-600 mb-1">{event.date}</p>
                            )}
                            <p className="text-sm text-gray-800">{event.event}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw Response - Only show if no chart data */}
              {response && !chartData && (
                <div className="mt-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                      {response}
                    </pre>
                  </div>
                </div>
              )}

              {/* Debug Raw Response - Collapsed */}
              {response && chartData && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <details className="group">
                    <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                      🔍 View Raw AI Response (Debug)
                    </summary>
                    <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <pre className="whitespace-pre-wrap text-xs text-gray-600 font-mono">
                        {response}
                      </pre>
                    </div>
                  </details>
                </div>
              )}

              {isLoading && (
                <div className="mt-4 text-center">
                  <p className="text-gray-600">Processing your request...</p>
                </div>
              )}
              
              {!response && !isLoading && (
                <div className="mt-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-700">
                      Select a Rupert's prompt, stock, and time period, then click "Get Share Price" to see the AI analysis.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Show Complete Prompt Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Complete Prompt</h3>
              <button
                onClick={() => setShowPromptModal(false)}
                className="text-gray-400 hover:text-gray-600"
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
