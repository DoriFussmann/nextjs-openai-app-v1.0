'use client';

import { useState, useEffect } from 'react';
import PriceTrackerCard from '@/components/PriceTrackerCard';
import { BookOpen, BarChart3, Bot, TrendingUp, PieChart, Wrench, LayoutDashboard, HelpCircle, Plus } from 'lucide-react';
import Image from 'next/image';

interface Advisor {
  name: string;
  role: string;
  imageName: string;
  description: string;
}

export default function Home() {
  const [currentWord, setCurrentWord] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentAdvisorIndex, setCurrentAdvisorIndex] = useState(0);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);

  const words = [
    { text: 'build', color: 'from-blue-600 to-purple-600' },
    { text: 'prompt', color: 'from-green-600 to-blue-600' },
    { text: 'design', color: 'from-purple-600 to-pink-600' },
    { text: 'analyze', color: 'from-orange-600 to-red-600' },
    { text: 'model', color: 'from-teal-600 to-green-600' },
    { text: 'create', color: 'from-indigo-600 to-purple-600' }
  ];

  useEffect(() => {
    const word = words[currentWord];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (currentText.length < word.text.length) {
          setCurrentText(word.text.slice(0, currentText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        if (currentText.length > 0) {
          setCurrentText(word.text.slice(0, currentText.length - 1));
        } else {
          setIsDeleting(false);
          setCurrentWord((prev) => (prev + 1) % words.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentWord, words]);

  // Parse Advisors from prompts data
  const parseAdvisorsFromPrompts = async () => {
    const advisors: Advisor[] = [];

    // Try to load from prompts.json first, fallback to hardcoded
    let advisorsContent = '';

    try {
      console.log('🔍 Attempting to load prompts.json dynamically...');
      const response = await fetch('/data/prompts.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const promptsData = await response.json();
      console.log('📂 prompts.json loaded successfully:', promptsData.length, 'entries');

      const advisorsPrompt = promptsData.find((prompt: any) => prompt.title === 'Advisors');
      console.log('🎯 Advisors prompt found:', advisorsPrompt ? 'YES' : 'NO');

      if (advisorsPrompt) {
        advisorsContent = advisorsPrompt.content;
        console.log('📝 Loaded advisors from prompts.json');
        console.log('📋 Content preview:', advisorsContent.substring(0, 50) + '...');
      } else {
        console.log('⚠️ Advisors prompt not found in prompts.json');
      }
    } catch (error) {
      console.log('❌ Error loading prompts.json:', error instanceof Error ? error.message : String(error));
      console.log('📝 Using fallback advisor data');
    }

    // Fallback content if prompts.json not available
    if (!advisorsContent) {
      advisorsContent = "Rupert — Strategy Master\n   Think Gandalf, if Gandalf was a killer entrepreneur.\n\nJade — Modeling Ninja\n   Slices through spreadsheets like they're sushi rolls.\n\nDante — Wall Street Insider\n   It's like Jamie Dimon had a baby with Paddington Bear.\n\nNoah — Pitch Whisperer\n   Makes VCs cry, clap, and wire — sometimes all at once.\n\nZane — Data Strategist\n   Knows your numbers better than you know your kids' birthdays.\n\nKai — GTM Guru\n   Could launch a lemonade stand into a Fortune 500.\n\nLena — Growth Hacker\n   Breaks the internet before breakfast, fixes it by lunch.";
    }

    // Parse the content
    const lines = advisorsContent.split('\n');
    console.log('📝 Parsing advisors from content...');
    console.log('📄 Raw content:', advisorsContent);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      console.log(`📍 Line ${i}: "${lines[i]}" (trimmed: "${line}")`);

      if (!line) continue;

      // Only match advisor entries that start with a name (not indented descriptions)
      // and ensure the line starts at the beginning (no leading spaces)
      const match = line.match(/^([A-Za-z]+)\s*—\s*(.+)$/);
      console.log(`🔍 Match result for line ${i}:`, match);

      if (match && !lines[i].match(/^\s/)) { // Ensure it doesn't start with spaces
        const name = match[1].trim();
        const role = match[2].trim();
        console.log(`✅ Found advisor: ${name} -> ${role}`);

        // Get the next non-empty line as description
        let description = '';
        for (let j = i + 1; j < lines.length; j++) {
          const originalLine = lines[j];
          const descLine = originalLine.trim();
          if (descLine && originalLine.match(/^\s/) && !descLine.includes('—')) {
            description = descLine;
            break;
          } else if (descLine && !originalLine.match(/^\s/)) {
            // Stop if we hit another advisor entry (line that doesn't start with spaces)
            break;
          }
        }

        const imageName = name.toLowerCase().replace(/\s+/g, '');
        console.log(`👤 Advisor ${advisors.length + 1}: ${name} -> ${role}`);
        advisors.push({
          name,
          role,
          description,
          imageName
        });
      }
    }

    console.log('📋 Final advisor order:', advisors.map(a => a.name).join(' → '));
    return advisors;
  };

  // Load advisors data on mount
  useEffect(() => {
    const loadAdvisors = async () => {
      try {
        const advisors = await parseAdvisorsFromPrompts();
        setAdvisors(advisors);
        console.log('✅ Advisors loaded successfully:', advisors.length, 'advisors');
      } catch (error) {
        console.error('❌ Failed to load advisors:', error instanceof Error ? error.message : String(error));
        setAdvisors([]); // Set empty array on error
      }
    };

    loadAdvisors();
  }, []);

  // Carousel auto-rotation effect
  useEffect(() => {
    if (advisors.length === 0) return;

    const interval = setInterval(() => {
      setCurrentAdvisorIndex((prev) => (prev + 1) % advisors.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [advisors.length]);

  // Check if advisor image exists
  const checkImageExists = (imageName: string) => {
    // Assume images exist for all parsed advisors
    return true;
  };

  // Generate tool cards for each advisor
  const generateAdvisorTools = (advisorName: string) => {
    const allTools = {
      strategyPlanner: {
        title: "Strategy Planner",
        description: "Strategic planning and execution framework.",
        href: `/${advisorName.toLowerCase()}/strategy`,
        icon: <LayoutDashboard />,
        iconColor: "bg-blue-600"
      },
      analyticsPro: {
        title: "Analytics Pro",
        description: "Advanced analytics and reporting tools.",
        href: `/${advisorName.toLowerCase()}/analytics`,
        icon: <TrendingUp />,
        iconColor: "bg-green-600"
      },
      performanceTracker: {
        title: "Performance Tracker",
        description: "Monitor and optimize business performance.",
        href: `/${advisorName.toLowerCase()}/performance`,
        icon: <PieChart />,
        iconColor: "bg-purple-600"
      },
      dataMapper: {
        title: "Data Mapper",
        description: "AI-powered data mapping and analysis.",
        href: `/${advisorName.toLowerCase()}/data-mapper`,
        icon: <BarChart3 />,
        iconColor: "bg-red-600"
      },
      modelBuilder: {
        title: "Model Builder",
        description: "Build financial models with AI guidance.",
        href: `/${advisorName.toLowerCase()}/model-builder`,
        icon: <Wrench />,
        iconColor: "bg-orange-600"
      },
      helperAssistant: {
        title: "Helper Assistant",
        description: "AI assistant for guidance and support.",
        href: `/${advisorName.toLowerCase()}/helper`,
        icon: <HelpCircle />,
        iconColor: "bg-teal-600"
      },
      promptHub: {
        title: "Prompt Hub",
        description: "Manage and organize AI prompts.",
        href: "/prompt-hub",
        icon: <BookOpen />,
        iconColor: "bg-indigo-600"
      },
      integrationSuite: {
        title: "Integration Suite",
        description: "Seamless integration with external platforms.",
        href: `/${advisorName.toLowerCase()}/integrations`,
        icon: <Bot />,
        iconColor: "bg-pink-600"
      },
      theCreator: {
        title: "The Creator",
        description: "AI-powered content creation and design tools.",
        href: `/${advisorName.toLowerCase()}/creator`,
        icon: <Bot />,
        iconColor: "bg-purple-600"
      },
      sharePrice: {
        title: "Share Price",
        description: "Real-time stock market data and price tracking tools.",
        href: "/share-price",
        icon: <TrendingUp />,
        iconColor: "bg-emerald-600"
      },
      fpaKit: {
        title: "FP&A Kit",
        description: "Financial planning and analysis toolkit for strategic decisions.",
        href: `/${advisorName.toLowerCase()}/fpa-kit`,
        icon: <BarChart3 />,
        iconColor: "bg-cyan-600"
      },
      growthAccelerator: {
        title: "Growth Accelerator",
        description: "Accelerate business growth with data-driven insights and strategies.",
        href: `/${advisorName.toLowerCase()}/growth-accelerator`,
        icon: <TrendingUp />,
        iconColor: "bg-violet-600"
      }
    };

    // Define specific tools for each advisor (dynamic)
    const advisorTools: Record<string, any[]> = {};

    // Default tool sets for different advisor types
    const strategyAdvisors = ['rupert', 'kai', 'sage'];
    const technicalAdvisors = ['jade', 'zane', 'arlo'];
    const marketingAdvisors = ['lena', 'ivy'];
    const financialAdvisors = ['dante'];
    const generalAdvisors = ['noah', 'mila'];

    // Assign tools based on advisor type and name
    advisors.forEach(advisor => {
      const name = advisor.name.toLowerCase();

      if (name === 'rupert') {
        advisorTools[name] = [allTools.promptHub, allTools.theCreator, allTools.strategyPlanner, allTools.growthAccelerator];
      } else if (name === 'jade') {
        advisorTools[name] = [allTools.modelBuilder, allTools.fpaKit, allTools.performanceTracker, allTools.analyticsPro];
      } else if (name === 'zane') {
        advisorTools[name] = [allTools.dataMapper, allTools.integrationSuite, allTools.strategyPlanner, allTools.promptHub];
      } else if (strategyAdvisors.includes(name)) {
        advisorTools[name] = [allTools.promptHub, allTools.theCreator, allTools.strategyPlanner, allTools.growthAccelerator];
      } else if (technicalAdvisors.includes(name)) {
        advisorTools[name] = [allTools.integrationSuite, allTools.strategyPlanner, allTools.promptHub, allTools.helperAssistant];
      } else if (marketingAdvisors.includes(name)) {
        advisorTools[name] = [allTools.performanceTracker, allTools.analyticsPro, allTools.integrationSuite, allTools.helperAssistant];
      } else if (financialAdvisors.includes(name)) {
        advisorTools[name] = [allTools.sharePrice, allTools.promptHub, allTools.dataMapper, allTools.helperAssistant];
      } else if (generalAdvisors.includes(name)) {
        advisorTools[name] = [allTools.helperAssistant, allTools.promptHub, allTools.dataMapper, allTools.theCreator];
      } else {
        // Default tools for new advisors
        advisorTools[name] = [allTools.promptHub, allTools.dataMapper, allTools.helperAssistant, allTools.strategyPlanner];
      }
    });

    // Return tools for specific advisor, or default set if not found
    return advisorTools[advisorName.toLowerCase()] || [allTools.promptHub, allTools.dataMapper, allTools.helperAssistant];
  };

  // rupertTools removed - now using dynamic advisor system

  return (
    <div className="bg-white text-black">
      {/* Page Header */}
      <header className="border-b border-gray-200 px-4">
        <div className="page-wrap flex justify-between items-center">
          <div className="text-3xl leading-none">Hey Rupert!</div>
          <nav className="hidden md:flex space-x-4">
            {/* Refresh advisors button */}
            <button
              onClick={async () => {
                console.log('🔄 Refreshing advisors...');
                try {
                  const newAdvisors = await parseAdvisorsFromPrompts();
                  setAdvisors(newAdvisors);
                  console.log('✅ Advisors refreshed:', newAdvisors.length, 'advisors');
                } catch (error) {
                  console.error('❌ Failed to refresh advisors:', error instanceof Error ? error.message : String(error));
                }
              }}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Refresh advisors from prompts.json"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh Advisors</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="page-wrap">
        {/* Main Header Section */}
        <header className="py-8 md:py-10 lg:py-12">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            {/* Left Side - Hero Text */}
            <div className="w-full lg:w-[70%] pt-4 lg:pt-8">
              <h1 className="text-5xl md:text-7xl lg:text-6xl xl:text-7xl text-gray-900 mb-1 leading-tight">
                What would you like
                <br />
                the power to{' '}
                <span className="text-blue-600">
                  {currentText}
                  <span className="animate-pulse">|</span>
                </span>
              </h1>

              <p className="text-base md:text-lg lg:text-xl text-black mt-8 lg:mt-12 leading-relaxed max-w-2xl">
                Your all-in-one business command center - AI-driven toolkit to master your company with the clarity of world-class advisors.
              </p>
            </div>

            {/* Right Side - Advisor Image Carousel */}
            <div className="w-full lg:w-[30%]">
              <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-lg">
                {/* Advisor Image Carousel - 5:6 aspect ratio */}
                <div className="aspect-[5/6] relative">
                  {advisors.length > 0 && advisors[currentAdvisorIndex] && (
                    <>
                      {/* Advisor Image */}
                      <div className="absolute inset-0">
                        {checkImageExists(advisors[currentAdvisorIndex].imageName) ? (
                          <>
                            <Image
                              src={`/images/advisors/${advisors[currentAdvisorIndex].imageName}.jpg`}
                              alt={advisors[currentAdvisorIndex].name}
                              fill
                              className="object-cover"
                            />
                            {/* Dark overlay for text readability */}
                            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                          </>
                        ) : (
                          /* Gradient background for advisors without images */
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
                        )}
                      </div>

                      {/* Advisor Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="text-lg font-semibold mb-1 drop-shadow-lg">
                          {advisors[currentAdvisorIndex].name}
                        </h3>
                        <p className="text-sm opacity-90 drop-shadow-md">
                          {advisors[currentAdvisorIndex].role}
                        </p>
                      </div>
                    </>
                  )}

                  {/* Carousel Navigation Dots */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {advisors.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentAdvisorIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentAdvisorIndex
                            ? 'bg-white'
                            : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Carousel Navigation Arrows */}
                  <button
                    onClick={() => setCurrentAdvisorIndex((prev) => (prev - 1 + advisors.length) % advisors.length)}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <button
                    onClick={() => setCurrentAdvisorIndex((prev) => (prev + 1) % advisors.length)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>



              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Advisor Tools Sections */}
        {advisors.length > 0 ? advisors.map((advisor, advisorIndex) => {
          const advisorTools = generateAdvisorTools(advisor.name);
          return (
            <section key={advisor.name} className="mt-8 md:mt-10 lg:mt-12">
              <div className="w-full">
                <h2 className="text-[1.25rem] md:text-[1.5rem] font-normal mb-6">{advisor.name} - your {advisor.role.toLowerCase()}</h2>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  {/* Advisor Image Card - First Position */}
                  <div
                    className="relative bg-white border-2 border-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-[235px] overflow-hidden"
                  >
                    {/* Full-size Image Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      {/* Only render Image component if the image exists */}
                      {checkImageExists(advisor.imageName) ? (
                        <>
                          <Image
                            src={`/images/advisors/${advisor.imageName}.jpg`}
                            alt={advisor.name}
                            width={400}
                            height={300}
                            className="w-full h-full object-cover"
                          />
                          {/* Dark overlay for text readability */}
                          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                        </>
                      ) : (
                        /* Blank gradient background for advisors without images */
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200"></div>
                      )}
                    </div>

                    {/* Content Overlay */}
                    <div className={`relative z-10 p-5 flex flex-col h-full ${checkImageExists(advisor.imageName) ? 'text-white' : 'text-gray-800'}`}>
                      {/* Role Badge and Description - Bottom */}
                      <div className="mt-auto space-y-2">
                        <div className={`h-7 px-3 rounded-lg bg-white bg-opacity-90 text-gray-800 font-normal text-[0.781rem] flex items-center justify-center w-fit ${checkImageExists(advisor.imageName) ? 'drop-shadow-sm' : ''}`}>
                          {advisor.role}
                        </div>
                        <p className={`text-xs leading-tight text-left ${checkImageExists(advisor.imageName) ? 'drop-shadow-md opacity-85' : 'text-gray-500'}`}>
                          {advisor.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Regular Tool Cards */}
                  {advisorTools.map((tool: any, toolIndex: number) => (
                    <PriceTrackerCard
                      key={toolIndex}
                      title={tool.title}
                      description={tool.description}
                      href={tool.href}
                      icon={tool.icon}
                      iconColor={tool.iconColor}
                    />
                  ))}
                </div>
              </div>
            </section>
          );
        }) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No advisors found. Check your prompts.json file.</p>
          </div>
        )}


      </main>
    </div>
  )
}
