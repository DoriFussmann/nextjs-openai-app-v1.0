"use client";

import React, { useState, useMemo } from "react";

/**
 * Design notes (match home page):
 * - Inter font, white background, black text
 * - Max width container with side margins: max-w-7xl mx-auto px-6 lg:px-8
 * - Soft cards: rounded-2xl border border-gray-200 shadow-sm bg-white
 * - Hover states on interactive elements (buttons/cards)
 * - Header row with page icon/title on left; Home and Reset on right
 * - Screen split: 25% left (inputs), 75% right (output) on md+; stack on mobile
 * - Use this page to send one combined payload to OpenAI and render response
 */

export default function OpenAICallPage() {
      // Inputs from the three drawers
    const [inputA, setInputA] = useState("");
    const [inputB, setInputB] = useState("");
    const [inputC, setInputC] = useState("");
    
    // Data collection inputs
    const [fileContent, setFileContent] = useState("");
    const [urlContent, setUrlContent] = useState("");
    const [pastedText, setPastedText] = useState("");
    
            // Section names
    const [sectionNameA, setSectionNameA] = useState("Data");
    const [sectionNameB, setSectionNameB] = useState("Prompt");
    const [sectionNameC, setSectionNameC] = useState("Reference");

         // UI: which drawers are open
    const [openA, setOpenA] = useState(false);
    const [openB, setOpenB] = useState(false);
    const [openC, setOpenC] = useState(false);
   const [showModal, setShowModal] = useState(false);
   const [showModalC, setShowModalC] = useState(false);
   const [showPayloadModal, setShowPayloadModal] = useState(false);
   const [showApiTestModal, setShowApiTestModal] = useState(false);
   const [apiTestResult, setApiTestResult] = useState<string | null>(null);
   const [apiTestStatus, setApiTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
     const [apiTestErrorType, setApiTestErrorType] = useState<string | null>(null);
  const [dataSaved, setDataSaved] = useState(false);
  const [resetClicked, setResetClicked] = useState(false);
  
  // Payload name
   const [payloadName, setPayloadName] = useState("Combined Payload");

  // API state
  const [isSending, setIsSending] = useState(false);
  const [apiResult, setApiResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Combine data inputs into one string
  const combinedDataInput = useMemo(() => {
    const parts = [];
    if (fileContent.trim()) parts.push(`File Content:\n${fileContent.trim()}`);
    if (urlContent.trim()) parts.push(`URL Content:\n${urlContent.trim()}`);
    if (pastedText.trim()) parts.push(`Pasted Text:\n${pastedText.trim()}`);
    return parts.join('\n\n');
  }, [fileContent, urlContent, pastedText]);

  // Combined preview (compiled from the three inputs)
  const combinedPayload = useMemo(() => {
    const payload = {
      [sectionNameA]: combinedDataInput || "",
      [sectionNameB]: inputB?.trim() || "",
      [sectionNameC]: inputC?.trim() || "",
    };
    return JSON.stringify(payload, null, 2);
  }, [combinedDataInput, inputB, inputC, sectionNameA, sectionNameB, sectionNameC]);

           // Reset everything
    const resetAll = () => {
      setResetClicked(true);
      
                  setInputA("");
      setInputB("");
      setInputC("");
      setFileContent("");
      setUrlContent("");
      setPastedText("");
      setSectionNameA("Data");
      setSectionNameB("Prompt");
      setSectionNameC("Reference");
      setPayloadName("Combined Payload");
             setApiResult(null);
       setErrorMsg(null);
       setOpenA(false);
       setOpenB(false);
       setOpenC(false);
             setShowModal(false);
       setShowModalC(false);
       setShowPayloadModal(false);
       setShowApiTestModal(false);
       setApiTestResult(null);
       setApiTestStatus('idle');
       setApiTestErrorType(null);
       
      // Reset visual feedback after 1 second
      setTimeout(() => {
        setResetClicked(false);
      }, 1000);
    };

  // File handling functions
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setFileContent(content);
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setFileContent(content);
      };
      reader.readAsText(file);
    }
  };

  const handleUrlFetch = async () => {
    if (!urlContent.trim()) return;
    try {
      const response = await fetch(urlContent.trim());
      const text = await response.text();
      setUrlContent(text);
    } catch (error) {
      console.error('Error fetching URL:', error);
      // Keep the original URL if fetch fails
    }
  };

     // Send to OpenAI via our API route
   const sendToOpenAI = async () => {
     try {
       setIsSending(true);
       setErrorMsg(null);
       setApiResult(null);

       const res = await fetch("/api/openai", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: combinedPayload, // already JSON
       });

       if (!res.ok) {
         const txt = await res.text();
         throw new Error(txt || `HTTP ${res.status}`);
       }

       const data = await res.json();
       // Expect { result: string } from the API route
       setApiResult(typeof data?.result === "string" ? data.result : JSON.stringify(data, null, 2));
     } catch (err: any) {
       setErrorMsg(err?.message || "Failed to call OpenAI.");
     } finally {
       setIsSending(false);
     }
   };

       // API test function
    const testApiConnection = async () => {
      try {
        setApiTestStatus('testing');
        setApiTestResult(null);
        setApiTestErrorType(null);

        const testPayload = JSON.stringify({
          test: "Hello, this is a test message to verify API connectivity."
        });

        const res = await fetch("/api/openai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: testPayload,
        });

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `HTTP ${res.status}`);
        }

        const data = await res.json();
        setApiTestResult(typeof data?.result === "string" ? data.result : JSON.stringify(data, null, 2));
        setApiTestStatus('success');
        
        // Reset to normal state after 2 seconds
        setTimeout(() => {
          setApiTestStatus('idle');
        }, 2000);
      } catch (err: any) {
        const errorMessage = err?.message || "Failed to test API connection.";
        setApiTestResult(errorMessage);
        setApiTestStatus('error');
        
        // Determine error type for common reasons
        if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('Authentication failed')) {
          setApiTestErrorType('authentication');
        } else if (errorMessage.includes('429') || errorMessage.includes('rate limit') || errorMessage.includes('Rate limit exceeded')) {
          setApiTestErrorType('rate_limit');
        } else if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error') || errorMessage.includes('OpenAI service error')) {
          setApiTestErrorType('server_error');
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch')) {
          setApiTestErrorType('network');
        } else if (errorMessage.includes('API key is not configured') || errorMessage.includes('OPENAI_API_KEY')) {
          setApiTestErrorType('authentication');
        } else {
          setApiTestErrorType('unknown');
        }
      }
    };

  // Save data to localStorage
  const saveData = () => {
    const dataToSave = {
      fileContent,
      urlContent,
      pastedText,
      inputA,
      inputB,
      inputC,
      sectionNameA,
      sectionNameB,
      sectionNameC
    };
    localStorage.setItem('openai-call-data', JSON.stringify(dataToSave));
    setDataSaved(true);
    
    // Close the data window after 1 second (after showing saved indicator)
    setTimeout(() => {
      setDataSaved(false);
      setOpenA(false);
    }, 1000);
  };

  // Load data from localStorage
  const loadData = () => {
    try {
      const savedData = localStorage.getItem('openai-call-data');
      if (savedData) {
        const data = JSON.parse(savedData);
        setFileContent(data.fileContent || '');
        setUrlContent(data.urlContent || '');
        setPastedText(data.pastedText || '');
        setInputA(data.inputA || '');
        setInputB(data.inputB || '');
        setInputC(data.inputC || '');
        setSectionNameA(data.sectionNameA || 'Data');
        setSectionNameB(data.sectionNameB || 'Prompt');
        setSectionNameC(data.sectionNameC || 'Reference');
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  // Load data on component mount
  React.useEffect(() => {
    loadData();
  }, []);

     return (
     <main className="page-wrap bg-white text-black">
       {/* Page Header */}
               <header className="border-b border-gray-200 px-4 py-4">
          <div className="w-full flex justify-between items-center">
            <div className="text-xl">My project</div>
            <nav className="hidden md:flex space-x-4">
              <a href="/" className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200 text-sm">Home</a>
            </nav>
          </div>
        </header>

       {/* Body: 25% / 75% split on md+ */}
       <div className="w-full mt-8 md:mt-10 lg:mt-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                     {/* Left column: inputs (25%) */}
           <section className="md:col-span-1 space-y-4">
             <div className="rounded-lg border border-[#EAEAEA] bg-white shadow-[0_4px_18px_rgba(0,0,0,0.06)] p-5">
               <h2 className="text-[1.125rem] font-normal mb-6">Inputs</h2>

                                                                                               {/* Data Collection Section */}
                  <div className="rounded-lg border border-[#EAEAEA] mb-4">
                                                          <button
                        className="w-full flex items-center justify-between px-4 py-2 text-left hover:bg-gray-50 rounded-lg h-9"
                       onClick={() => setOpenA((v) => !v)}
                     >
                      <span className="text-xs">{sectionNameA}</span>
                      <span className="text-xs text-gray-500">{openA ? "Hide" : "Edit"}</span>
                    </button>
                   {openA && (
                     <div className="px-4 pb-4 space-y-4">
                                                                      {/* File Upload */}
                         <div>
                           <label className="block text-xs font-normal text-gray-700 mb-2">Upload file</label>
                           <div
                             onDragOver={handleDragOver}
                             onDrop={handleDrop}
                             className="relative border border-dashed border-blue-200 rounded-lg p-6 text-center hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
                           >
                             <div className="flex flex-col items-center space-y-2">
                               <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                               </svg>
                               <div>
                                 <p className="text-xs text-gray-600 font-normal">Drop your file here or</p>
                                 <p className="text-xs text-blue-600 font-normal">browse files</p>
                               </div>
                               <p className="text-xs text-gray-400">Supports .txt, .csv, .json, .pdf and more</p>
                             </div>
                             <input
                               type="file"
                               onChange={handleFileUpload}
                               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                             />
                           </div>
                           {fileContent && (
                             <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                               <div className="flex items-center space-x-2">
                                 <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                 </svg>
                                 <span className="text-xs text-green-700 font-normal">File loaded: {fileContent.length} characters</span>
                               </div>
                             </div>
                           )}
                         </div>

                                                                        {/* URL Input */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">URL Content</label>
                            <input
                              type="url"
                              placeholder="Enter URL to fetch content..."
                              value={urlContent}
                              onChange={(e) => setUrlContent(e.target.value)}
                              className="w-full rounded-lg border border-gray-200 p-2 text-sm outline-none focus:ring-2 focus:ring-gray-200"
                            />
                          </div>

                        {/* Text Paste */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">Paste Text</label>
                          <textarea
                            className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:ring-2 focus:ring-gray-200"
                            rows={4}
                            placeholder="Paste or type text here..."
                            value={pastedText}
                            onChange={(e) => setPastedText(e.target.value)}
                          />
                        </div>

                        {/* Combined Data Preview */}
                        {combinedDataInput && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">Combined Data Preview</label>
                            <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-700 max-h-32 overflow-y-auto">
                              {combinedDataInput}
                            </div>
                          </div>
                        )}

                        {/* Save Button */}
                        <div className="pt-2">
                          <button
                            onClick={saveData}
                            className={`w-full rounded-lg border px-4 py-2 text-xs font-normal transition-all duration-200 h-9 flex items-center justify-center ${
                              dataSaved 
                                ? 'bg-green-50 border-green-200 text-green-700' 
                                : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                            }`}
                          >
                            {dataSaved ? (
                              <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Data saved</span>
                              </div>
                            ) : (
                              'Save data'
                            )}
                          </button>
                        </div>
                     </div>
                   )}
                 </div>

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    {/* Section Two and Three Buttons */}
                                          <div className="flex gap-3 mb-4">
                                                                      <button
                           className="flex-1 rounded-lg border border-[#EAEAEA] px-4 py-2 text-center hover:bg-gray-50 transition-colors duration-200 h-9 flex items-center justify-center"
                          onClick={() => setShowModal(true)}
                        >
                          <span className="text-xs">{sectionNameB}</span>
                        </button>
                         <button
                           className="flex-1 rounded-lg border border-[#EAEAEA] px-4 py-2 text-center hover:bg-gray-50 transition-colors duration-200 h-9 flex items-center justify-center"
                          onClick={() => setShowModalC(true)}
                        >
                          <span className="text-xs">{sectionNameC}</span>
                        </button>
                      </div>
                                            
                                                                                           <div className="flex gap-3 mb-4">
                                                    <button
                              className="flex-1 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors duration-200 px-4 py-2 text-center h-9 flex items-center justify-center"
                              onClick={() => setShowPayloadModal(true)}
                            >
                              <span className="text-xs">View payload</span>
                            </button>
                            
                            <button
                              onClick={resetAll}
                              className={`flex-1 rounded-lg border px-4 py-2 text-center transition-colors duration-200 h-9 flex items-center justify-center ${
                                resetClicked 
                                  ? 'border-green-200 bg-green-50 text-green-600' 
                                  : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                              }`}
                            >
                              <span className="text-xs">Reset payload</span>
                            </button>
                         </div>
                        
                        <div className="flex gap-3 mb-0">
                                                       <button
                               className={`flex-1 rounded-lg border px-4 py-2 text-center transition-all duration-200 flex items-center justify-center h-9 ${
                                 apiTestStatus === 'testing' 
                                   ? 'border-gray-300 bg-gray-100' 
                                   : apiTestStatus === 'success'
                                   ? 'border-green-500 bg-green-50 text-green-700'
                                   : apiTestStatus === 'error'
                                   ? 'border-red-500 bg-red-50 text-red-700 hover:bg-red-100'
                                   : 'border-[#EAEAEA] hover:bg-gray-50'
                               }`}
                               onClick={() => {
                                 if (apiTestStatus === 'error') {
                                   setShowApiTestModal(true);
                                 } else {
                                   testApiConnection();
                                 }
                               }}
                               disabled={apiTestStatus === 'testing'}
                             >
                               {apiTestStatus === 'testing' ? (
                                 <>
                                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                                   <span className="text-xs">Testing...</span>
                                 </>
                               ) : (
                                 <span className="text-xs">API test</span>
                               )}
                             </button>
                        
                          <button
                            className="flex-1 rounded-lg bg-black text-white px-4 py-2 text-center hover:opacity-90 transition-colors duration-200 h-9 flex items-center justify-center"
                            onClick={sendToOpenAI}
                            disabled={isSending}
                          >
                            <span className="text-xs">{isSending ? "Sending..." : "Send payload"}</span>
                          </button>
                        </div>

                                                             
                           </div>
           </section>

          {/* Right column: output (75%) */}
          <section className="md:col-span-3">
            <div className="rounded-lg border border-[#EAEAEA] bg-white shadow-[0_4px_18px_rgba(0,0,0,0.06)] p-5 h-full min-h-[540px] flex flex-col">
               <h2 className="text-[1.125rem] font-normal mb-4">Response</h2>

              {!apiResult && !errorMsg && (
                <div className="flex-1">
                  <textarea
                    className="w-full h-full min-h-[400px] rounded-lg border border-gray-200 p-4 text-sm font-mono bg-white resize-none outline-none focus:ring-2 focus:ring-gray-200"
                    placeholder="API response will appear here..."
                    readOnly
                  />
                </div>
              )}

              {errorMsg && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {errorMsg}
                </div>
              )}

                             {apiResult && (
                 <div className="rounded-lg border border-[#EAEAEA] bg-gray-50 p-4 text-gray-800 overflow-auto">
                   <textarea
                     className="w-full h-full min-h-[400px] bg-transparent border-none outline-none resize-none text-sm font-mono"
                     value={apiResult}
                     readOnly
                   />
                 </div>
               )}
            </div>
          </section>
                 </div>
       </div>

               {/* Modal for Section Two */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg border border-[#EAEAEA] shadow-[0_4px_18px_rgba(0,0,0,0.06)] max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
                             <div className="p-6 border-b border-gray-200">
                 <div className="flex items-center justify-between">
                   <h3 className="text-lg font-normal">Edit section</h3>
                   <button
                     onClick={() => setShowModal(false)}
                     className="text-gray-400 hover:text-gray-600 transition-colors"
                   >
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                   </button>
                 </div>
               </div>
               <div className="p-6 space-y-4">
                 <div>
                   <label className="block text-sm font-normal text-gray-700 mb-2">Section name</label>
                   <input
                     type="text"
                     className="w-full rounded-lg border border-[#EAEAEA] p-3 text-sm outline-none focus:ring-2 focus:ring-gray-200"
                     placeholder="Enter section name..."
                     value={sectionNameB}
                     onChange={(e) => setSectionNameB(e.target.value)}
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-normal text-gray-700 mb-2">Content</label>
                   <textarea
                     className="w-full rounded-lg border border-[#EAEAEA] p-3 text-sm outline-none focus:ring-2 focus:ring-gray-200 resize-none"
                     rows={10}
                     placeholder="Type content for this section…"
                     value={inputB}
                     onChange={(e) => setInputB(e.target.value)}
                   />
                 </div>
               </div>
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#EAEAEA] hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-black text-white hover:opacity-90 transition text-sm"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Section Three */}
        {showModalC && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg border border-[#EAEAEA] shadow-[0_4px_18px_rgba(0,0,0,0.06)] max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
                             <div className="p-6 border-b border-gray-200">
                 <div className="flex items-center justify-between">
                   <h3 className="text-lg font-normal">Edit section</h3>
                   <button
                     onClick={() => setShowModalC(false)}
                     className="text-gray-400 hover:text-gray-600 transition-colors"
                   >
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                   </button>
                 </div>
               </div>
               <div className="p-6 space-y-4">
                 <div>
                   <label className="block text-sm font-normal text-gray-700 mb-2">Section name</label>
                   <input
                     type="text"
                     className="w-full rounded-lg border border-[#EAEAEA] p-3 text-sm outline-none focus:ring-2 focus:ring-gray-200"
                     placeholder="Enter section name..."
                     value={sectionNameC}
                     onChange={(e) => setSectionNameC(e.target.value)}
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-normal text-gray-700 mb-2">Content</label>
                   <textarea
                     className="w-full rounded-lg border border-[#EAEAEA] p-3 text-sm outline-none focus:ring-2 focus:ring-gray-200 resize-none"
                     rows={10}
                     placeholder="Type content for this section…"
                     value={inputC}
                     onChange={(e) => setInputC(e.target.value)}
                   />
                 </div>
               </div>
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModalC(false)}
                  className="px-4 py-2 rounded-lg border border-[#EAEAEA] hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowModalC(false)}
                  className="px-4 py-2 rounded-lg bg-black text-white hover:opacity-90 transition text-sm"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
                 )}

         {/* Modal for Combined Payload */}
         {showPayloadModal && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
             <div className="bg-white rounded-lg border border-[#EAEAEA] shadow-[0_4px_18px_rgba(0,0,0,0.06)] max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
               <div className="p-6 border-b border-gray-200">
                 <div className="flex items-center justify-between">
                   <h3 className="text-lg font-normal">View payload</h3>
                   <button
                     onClick={() => setShowPayloadModal(false)}
                     className="text-gray-400 hover:text-gray-600 transition-colors"
                   >
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                   </button>
                 </div>
               </div>
               <div className="p-6">
                 <textarea
                   className="w-full rounded-lg border border-[#EAEAEA] p-3 text-sm outline-none focus:ring-2 focus:ring-gray-200 resize-none font-mono bg-gray-50"
                   rows={20}
                   value={combinedPayload}
                   readOnly
                 />
               </div>
               <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                 <button
                   onClick={() => setShowPayloadModal(false)}
                   className="px-4 py-2 rounded-lg border border-[#EAEAEA] hover:bg-gray-50 transition-colors text-sm"
                 >
                   Close
                 </button>
                 <button
                   onClick={() => {
                     navigator?.clipboard?.writeText(combinedPayload);
                     setShowPayloadModal(false);
                   }}
                   className="px-4 py-2 rounded-lg bg-black text-white hover:opacity-90 transition text-sm"
                 >
                   Copy & close
                 </button>
               </div>
             </div>
           </div>
                   )}

          {/* Modal for API Test */}
          {showApiTestModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg border border-[#EAEAEA] shadow-[0_4px_18px_rgba(0,0,0,0.06)] max-w-md w-full mx-4 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-normal">API test</h3>
                    <button
                      onClick={() => setShowApiTestModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {apiTestStatus === 'idle' && (
                    <div className="text-center text-gray-500">
                      <p>Click the button to test API connectivity</p>
                    </div>
                  )}
                  
                  {apiTestStatus === 'testing' && (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                      <p className="text-gray-600">Testing API connection...</p>
                    </div>
                  )}
                  
                                     {apiTestStatus === 'success' && (
                     <div className="space-y-4">
                       <div className="flex items-center space-x-2">
                         <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                         <span className="text-green-700 font-medium">Success</span>
                       </div>
                                               <div className="bg-gray-50 rounded-lg p-3 text-sm">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-gray-700">Technical details:</p>
                            <button
                              onClick={() => {
                                const debugInfo = `API Test Debug Info:
Status: ${apiTestStatus}
Response: ${apiTestResult || 'N/A'}
Timestamp: ${new Date().toISOString()}
Environment: ${process.env.NODE_ENV}
API Key Configured: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No'}`;
                                navigator?.clipboard?.writeText(debugInfo);
                              }}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                          <div className="text-gray-600 space-y-1 font-mono text-xs">
                            <div>• Status: 200 OK</div>
                            <div>• Model: gpt-3.5-turbo</div>
                            <div>• Response length: {apiTestResult?.length || 0} chars</div>
                            <div>• API key: {process.env.OPENAI_API_KEY ? 'Configured' : 'Missing'}</div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-gray-700 mb-2">Response:</p>
                            <div className="bg-white rounded border p-2 text-xs text-gray-600 max-h-24 overflow-y-auto">
                              {apiTestResult}
                            </div>
                          </div>
                        </div>
                     </div>
                   )}
                   
                   {apiTestStatus === 'error' && (
                     <div className="space-y-4">
                       <div className="flex items-center space-x-2">
                         <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                         <span className="text-red-700 font-medium">Error</span>
                       </div>
                                               <div className="bg-red-50 rounded-lg p-3 text-sm">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-red-700">Technical details:</p>
                            <button
                              onClick={() => {
                                const debugInfo = `API Test Debug Info:
Status: ${apiTestStatus}
Error Type: ${apiTestErrorType || 'N/A'}
Error Message: ${apiTestResult || 'N/A'}
Timestamp: ${new Date().toISOString()}
Environment: ${process.env.NODE_ENV}
API Key Configured: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No'}`;
                                navigator?.clipboard?.writeText(debugInfo);
                              }}
                              className="text-red-400 hover:text-red-600 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                          <div className="text-red-600 space-y-1 font-mono text-xs">
                            <div>• Error type: {apiTestErrorType}</div>
                            <div>• API key: {process.env.OPENAI_API_KEY ? 'Configured' : 'Missing'}</div>
                            <div>• Environment: {process.env.NODE_ENV}</div>
                            <div>• Timestamp: {new Date().toISOString()}</div>
                          </div>

                        </div>
                     </div>
                   )}
                </div>
                                 <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                   <button
                     onClick={() => setShowApiTestModal(false)}
                     className="px-4 py-2 rounded-lg border border-[#EAEAEA] hover:bg-gray-50 transition-colors text-sm"
                   >
                     Close
                   </button>
                   {apiTestStatus !== 'testing' && (
                     <button
                       onClick={testApiConnection}
                       className="px-4 py-2 rounded-lg bg-black text-white hover:opacity-90 transition text-sm"
                     >
                       Test again
                     </button>
                   )}
                 </div>
              </div>
            </div>
          )}
        </main>
      );
    }
