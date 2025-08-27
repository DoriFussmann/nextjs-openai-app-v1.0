"use client";

import React, { useState, useEffect } from "react";
import { Home } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/Header";

interface AdvisorImageProps {
  name: string;
  role: string;
  colors: Record<string, string>;
}

const AdvisorImage: React.FC<AdvisorImageProps> = ({ name, role, colors }) => {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className={`w-full h-full bg-gradient-to-br ${colors[role] || 'from-gray-100 to-gray-200'} rounded-full flex items-center justify-center`}>
        <span className="text-2xl">🤖</span>
      </div>
    );
  }

  return (
    <>
      <Image
        src={`/images/advisors/${name.toLowerCase()}.jpg`}
        alt={`${name} avatar`}
        width={64}
        height={64}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
    </>
  );
};

export default function HelperPage() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [isTestingAPI, setIsTestingAPI] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [helpers, setHelpers] = useState<Array<{name: string, role: string, id: string}>>([]);
  const [allAdvisors, setAllAdvisors] = useState<Array<{name: string, role: string, description: string}>>([]);
  const [selectedHelper, setSelectedHelper] = useState<string>("");
  const [userQuery, setUserQuery] = useState<string>("");
  const [suggestedHelper, setSuggestedHelper] = useState<string | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState<string>("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    loadHelpersFromHub();
  }, []);

  const loadHelpersFromHub = async () => {
    try {
      console.log('🔄 Loading helpers from Prompts Hub...');

      // First try to load from localStorage (where Instructions Hub saves changes)
      const localData = localStorage.getItem('promptsData');
      if (localData) {
        try {
          const parsedData = JSON.parse(localData);
          console.log('📦 Helpers loaded from localStorage:', parsedData);

          if (parsedData.rupertPrompts) {
            console.log('✅ Found rupertPrompts in localStorage, parsing...');
            parseHelpersFromPrompts(parsedData.rupertPrompts);
            return; // Exit early if localStorage data found
          } else {
            console.log('❌ No rupertPrompts found in localStorage');
          }
        } catch (error) {
          console.error('❌ Error parsing localStorage data:', error);
        }
      } else {
        console.log('📭 No localStorage data found');
      }

      // Fallback to JSON file if localStorage is empty or invalid
      console.log('📂 Loading from JSON file...');
      const response = await fetch('/data/prompts.json');
      if (response.ok) {
        const data = await response.json();
        console.log('📄 Prompts Hub data loaded from file:', data);

        if (data.rupertPrompts) {
          console.log('✅ Found rupertPrompts in JSON file, parsing...');
          parseHelpersFromPrompts(data.rupertPrompts);
        } else {
          console.log('❌ No rupertPrompts found in JSON file');
        }
      } else {
        console.error('❌ Failed to load prompts from hub, status:', response.status);
      }
    } catch (error) {
      console.error('❌ Error loading helpers from Prompts Hub:', error);
    }
  };

  const parseHelpersFromPrompts = (rupertPrompts: Array<{id: string, title: string, content: string}>) => {
    console.log('🔍 parseHelpersFromPrompts called with:', rupertPrompts?.length, 'prompts');

    // Debug: Log all prompt titles to see what's available
    if (rupertPrompts) {
      console.log('📋 Available prompt titles:', rupertPrompts.map(p => p.title));
    }

    // Find the "Helpers" prompt
    const helpersPrompt = rupertPrompts?.find(prompt => prompt.title === "Helpers");
    console.log('📋 Found helpers prompt:', helpersPrompt ? 'YES' : 'NO');

    if (helpersPrompt && helpersPrompt.content) {
      console.log('📝 Raw helpers content:', helpersPrompt.content);
      console.log('📝 Parsing helpers content...');

      // Parse the new format with numbers and descriptions
      const lines = helpersPrompt.content.split('\n');
      console.log('📝 Content lines:', lines.length);

      const parsedAdvisors: Array<{name: string, role: string, description: string}> = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        console.log(`📝 Processing line ${i}: "${line}"`);

        // Look for numbered lines with advisor names
        const match = line.match(/^(\d+)\.\s*\*\*([^*]+)\*\*\s*—\s*([^*]+)\*\*$/);
        if (match) {
          const name = match[2].trim();
          const role = match[3].trim();
          console.log(`✅ Found advisor: ${name} - ${role}`);

          // Get the description from the next line
          let description = '';
          if (i + 1 < lines.length) {
            const descLine = lines[i + 1].trim();
            console.log(`📝 Description line: "${descLine}"`);
            if (descLine.startsWith('   ')) {
              description = descLine.replace(/^\s+/, '');
            }
          }

          parsedAdvisors.push({
            name,
            role,
            description
          });
        }
      }

      console.log('✅ Successfully parsed advisors:', parsedAdvisors.length, 'advisors');
      console.log('📋 Advisors list:', parsedAdvisors.map(a => `${a.name} (${a.role})`));

      setAllAdvisors(parsedAdvisors);
      setHelpers(parsedAdvisors.map((advisor, index) => ({
        id: `helper-${index}`,
        name: advisor.name,
        role: advisor.role
      })));
    } else {
      console.log('❌ No helpers prompt found or no content');
      console.log('🔄 Falling back to hardcoded data...');
      // Load fallback data
      loadFallbackAdvisors();
    }
  };

  const loadFallbackAdvisors = () => {
    console.log('🔄 Loading fallback advisor data...');
    const fallbackAdvisors = [
      { name: 'Rupert', role: 'Business Advisor', description: 'Guides overall business strategy, positioning, and growth.' },
      { name: 'Sofia', role: 'Financial Advisor', description: 'Expert in financial modeling, fundraising, and capital planning.' },
      { name: 'Ethan', role: 'Presentation Advisor', description: 'Crafts sharp investor decks and compelling pitch storytelling.' },
      { name: 'Maya', role: 'Sales Advisor', description: 'Builds go-to-market playbooks and drives pipeline growth.' },
      { name: 'Daniel', role: 'Marketing Advisor', description: 'Focuses on brand, demand generation, and digital strategy.' },
      { name: 'Aisha', role: 'Product Advisor', description: 'Provides insight on product strategy, UX, and roadmap design.' },
      { name: 'Liam', role: 'Technology Advisor', description: 'Guides architecture, scalability, and system implementation.' },
      { name: 'Clara', role: 'Operations Advisor', description: 'Optimizes processes, supply chain, and organizational efficiency.' },
      { name: 'Marcus', role: 'Legal Advisor', description: 'Ensures compliance, contracts, and IP protection.' },
      { name: 'Elena', role: 'HR & Talent Advisor', description: 'Specializes in recruiting, culture, and performance management.' }
    ];

    setAllAdvisors(fallbackAdvisors);
    setHelpers(fallbackAdvisors.map((advisor, index) => ({
      id: `helper-${index}`,
      name: advisor.name,
      role: advisor.role
    })));
    console.log('✅ Loaded fallback advisors:', fallbackAdvisors.length);
  };

  const suggestHelper = (query: string) => {
    if (!query.trim()) {
      setSuggestedHelper(null);
      setShowSuggestion(false);
      return;
    }

    const lowerQuery = query.toLowerCase();
    console.log('🔍 suggestHelper called with query:', query);
    console.log('🔍 lowerQuery:', lowerQuery);

    // Define keywords for each helper based on their roles and expertise
    const helperKeywords = {
      'Rupert': {
        keywords: [
          'business strategy', 'business plan', 'business advisory', 'business advisor',
          'growth', 'positioning', 'market', 'company strategy', 'business development',
          'strategic planning', 'business model', 'market positioning', 'competitive advantage',
          'business expansion', 'strategic direction', 'market opportunity', 'startup',
          'company growth', 'business operations', 'organizational strategy'
        ],
        role: 'Business Advisor'
      },
      'Sofia': {
        keywords: [
          'financial modeling', 'fundraising', 'capital planning', 'finance',
          'investment', 'budget', 'cash flow', 'financial planning', 'funding',
          'capital', 'financial strategy', 'revenue model', 'valuation',
          'financial analysis', 'accounting', 'p&l', 'balance sheet'
        ],
        role: 'Financial Advisor'
      },
      'Ethan': {
        keywords: [
          'presentation', 'investor deck', 'pitch', 'storytelling', 'slides',
          'presentation design', 'pitch deck', 'investor presentation',
          'presentation skills', 'compelling presentation', 'visual storytelling',
          'presentation delivery', 'communication', 'public speaking'
        ],
        role: 'Presentation Advisor'
      },
      'Maya': {
        keywords: [
          'sales', 'go-to-market', 'playbook', 'pipeline', 'sales strategy',
          'customer acquisition', 'revenue growth', 'sales process', 'selling',
          'customer engagement', 'conversion', 'sales funnel', 'business development'
        ],
        role: 'Sales Advisor'
      },
      'Daniel': {
        keywords: [
          'marketing', 'brand', 'demand generation', 'digital strategy',
          'marketing strategy', 'brand building', 'marketing campaign',
          'digital marketing', 'content marketing', 'social media',
          'marketing plan', 'brand positioning', 'customer acquisition'
        ],
        role: 'Marketing Advisor'
      },
      'Aisha': {
        keywords: [
          'product strategy', 'ux', 'roadmap', 'product design', 'user experience',
          'product development', 'product management', 'user interface',
          'product roadmap', 'feature development', 'product planning',
          'customer needs', 'product vision'
        ],
        role: 'Product Advisor'
      },
      'Liam': {
        keywords: [
          'technology', 'architecture', 'scalability', 'system implementation',
          'tech stack', 'technical architecture', 'software development',
          'system design', 'scalability', 'performance', 'infrastructure',
          'technical strategy', 'platform development'
        ],
        role: 'Technology Advisor'
      },
      'Clara': {
        keywords: [
          'operations', 'processes', 'supply chain', 'organizational efficiency',
          'operations management', 'process optimization', 'operational excellence',
          'supply chain management', 'workflow', 'efficiency', 'operations strategy',
          'business processes', 'operational efficiency'
        ],
        role: 'Operations Advisor'
      },
      'Marcus': {
        keywords: [
          'legal', 'compliance', 'contracts', 'ip protection', 'law',
          'legal compliance', 'contract management', 'intellectual property',
          'regulatory', 'legal strategy', 'corporate law', 'legal advice',
          'contract negotiation', 'legal protection'
        ],
        role: 'Legal Advisor'
      },
      'Elena': {
        keywords: [
          'hr', 'talent', 'recruiting', 'culture', 'performance management',
          'human resources', 'employee management', 'talent acquisition',
          'company culture', 'performance', 'recruitment', 'team building',
          'employee development', 'workforce planning'
        ],
        role: 'HR & Talent Advisor'
      }
    };

    // Calculate relevance scores for each helper
    const scores = Object.entries(helperKeywords).map(([name, data]) => {
      let score = 0;
      let matchedKeywords: string[] = [];

      data.keywords.forEach(keyword => {
        if (lowerQuery.includes(keyword)) {
          score += 1;
          matchedKeywords.push(keyword);
          // Give bonus points for exact matches
          if (keyword.split(' ').every(word => lowerQuery.includes(word))) {
            score += 0.5;
          }
        } else {
          // Check for partial word matches (e.g., "business" in "Business advisory")
          const keywordWords = keyword.split(' ');
          keywordWords.forEach(word => {
            if (word.length > 3 && lowerQuery.includes(word)) { // Only check words longer than 3 chars
              score += 0.3;
              if (!matchedKeywords.includes(word)) {
                matchedKeywords.push(word);
              }
            }
          });
        }
      });

      console.log(`📊 ${name} score: ${score}, matched: [${matchedKeywords.join(', ')}]`);
      return { name, score, role: data.role, matchedKeywords };
    });

    // Sort by score and get the highest scoring helper
    const bestMatch = scores.sort((a, b) => b.score - a.score)[0];

    console.log('🏆 Best match:', bestMatch);
    console.log('📋 All scores:', scores.map(s => `${s.name}: ${s.score}`).join(', '));

    if (bestMatch && bestMatch.score > 0) {
      const helper = helpers.find(h => h.name === bestMatch.name);
      console.log('✅ Found helper:', helper ? `${helper.name} (${helper.role})` : 'NOT FOUND');

      if (helper) {
        console.log('🎯 Setting suggested helper to:', helper.name);
        setSuggestedHelper(helper.id);
        setShowSuggestion(true);
        // Auto-select the suggested helper
        setSelectedHelper(helper.id);
      }
    } else {
      console.log('❌ No match found with score > 0');
      setSuggestedHelper(null);
      setShowSuggestion(false);
    }
  };

  const getSelectedHelperInfo = () => {
    const selectedHelperData = helpers.find(h => h.id === selectedHelper);
    if (!selectedHelperData) return null;

    // Define helper information with silhouettes and descriptions for all 10 advisors
    const helperInfo = {
      'Rupert': {
        silhouette: (
          <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 10C35 10 25 20 25 35C25 45 30 55 40 60L35 85C35 90 40 95 45 95H55C60 95 65 90 65 85L60 60C70 55 75 45 75 35C75 20 65 10 50 10Z" fill="#3B82F6"/>
            <circle cx="42" cy="32" r="4" fill="white"/>
            <circle cx="58" cy="32" r="4" fill="white"/>
            <path d="M45 42C45 45 47 47 50 47C53 47 55 45 55 42" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ),
        description: "Guides overall business strategy, positioning, and growth."
      },
      'Sofia': {
        silhouette: (
          <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 8C38 8 30 16 30 28C30 35 33 42 40 47L37 75C37 80 40 83 43 83H57C60 83 63 80 63 75L60 47C67 42 70 35 70 28C70 16 62 8 50 8Z" fill="#10B981"/>
            <circle cx="44" cy="26" r="3" fill="white"/>
            <circle cx="56" cy="26" r="3" fill="white"/>
            <path d="M47 36C47 38 48 39 50 39C52 39 53 38 53 36" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <rect x="35" y="50" width="30" height="8" rx="4" fill="white" opacity="0.8"/>
          </svg>
        ),
        description: "Expert in financial modeling, fundraising, and capital planning."
      },
      'Ethan': {
        silhouette: (
          <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 12C40 12 33 19 33 29C33 36 36 43 42 47L38 80C38 85 42 88 46 88H54C58 88 62 85 62 80L58 47C64 43 67 36 67 29C67 19 60 12 50 12Z" fill="#8B5CF6"/>
            <circle cx="43" cy="28" r="3" fill="white"/>
            <circle cx="57" cy="28" r="3" fill="white"/>
            <path d="M46 38C46 40 47 41 50 41C53 41 54 40 54 38" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <rect x="30" y="52" width="40" height="6" rx="3" fill="white" opacity="0.8"/>
            <circle cx="35" cy="55" r="2" fill="#8B5CF6"/>
            <circle cx="65" cy="55" r="2" fill="#8B5CF6"/>
          </svg>
        ),
        description: "Crafts sharp investor decks and compelling pitch storytelling."
      },
      'Maya': {
        silhouette: (
          <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 15C42 15 36 21 36 29C36 35 39 41 45 45L42 78C42 83 46 86 50 86C54 86 58 83 58 78L55 45C61 41 64 35 64 29C64 21 58 15 50 15Z" fill="#F97316"/>
            <circle cx="46" cy="27" r="3" fill="white"/>
            <circle cx="54" cy="27" r="3" fill="white"/>
            <path d="M48 37C48 39 49 40 50 40C51 40 52 39 52 37" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M40 52C40 55 42 57 45 57H55C58 57 60 55 60 52V50C60 47 58 45 55 45H45C42 45 40 47 40 50V52Z" fill="white" opacity="0.8"/>
          </svg>
        ),
        description: "Builds go-to-market playbooks and drives pipeline growth."
      },
      'Daniel': {
        silhouette: (
          <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 10C38 10 28 18 28 30C28 38 33 45 42 50L38 82C38 87 43 90 48 90H52C57 90 62 87 62 82L58 50C67 45 72 38 72 30C72 18 62 10 50 10Z" fill="#06B6D4"/>
            <circle cx="44" cy="28" r="3" fill="white"/>
            <circle cx="56" cy="28" r="3" fill="white"/>
            <path d="M47 38C47 40 48 41 50 41C52 41 53 40 53 38" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="50" cy="55" r="8" fill="white" opacity="0.8"/>
            <path d="M45 50L50 55L55 50" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
        description: "Focuses on brand, demand generation, and digital strategy."
      },
      'Aisha': {
        silhouette: (
          <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 12C40 12 32 20 32 32C32 40 36 48 44 52L40 85C40 90 45 93 50 93C55 93 60 90 60 85L56 52C64 48 68 40 68 32C68 20 60 12 50 12Z" fill="#EC4899"/>
            <circle cx="44" cy="28" r="3" fill="white"/>
            <circle cx="56" cy="28" r="3" fill="white"/>
            <path d="M47 38C47 40 48 41 50 41C52 41 53 40 53 38" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <rect x="35" y="55" width="30" height="4" rx="2" fill="white" opacity="0.8"/>
            <rect x="40" y="62" width="20" height="4" rx="2" fill="white" opacity="0.8"/>
          </svg>
        ),
        description: "Provides insight on product strategy, UX, and roadmap design."
      },
      'Liam': {
        silhouette: (
          <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 8C35 8 25 18 25 33C25 43 30 53 40 58L35 88C35 93 40 96 45 96H55C60 96 65 93 65 88L60 58C70 53 75 43 75 33C75 18 65 8 50 8Z" fill="#84CC16"/>
            <circle cx="42" cy="28" r="3" fill="white"/>
            <circle cx="58" cy="28" r="3" fill="white"/>
            <path d="M45 38C45 40 47 41 50 41C53 41 55 40 55 38" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <rect x="30" y="65" width="40" height="6" rx="3" fill="white" opacity="0.8"/>
            <circle cx="35" cy="68" r="1" fill="#84CC16"/>
            <circle cx="45" cy="68" r="1" fill="#84CC16"/>
            <circle cx="55" cy="68" r="1" fill="#84CC16"/>
            <circle cx="65" cy="68" r="1" fill="#84CC16"/>
          </svg>
        ),
        description: "Guides architecture, scalability, and system implementation."
      },
      'Clara': {
        silhouette: (
          <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 15C42 15 36 23 36 33C36 40 39 47 45 51L42 78C42 83 46 86 50 86C54 86 58 83 58 78L55 51C61 47 64 40 64 33C64 23 58 15 50 15Z" fill="#F59E0B"/>
            <circle cx="46" cy="28" r="3" fill="white"/>
            <circle cx="54" cy="28" r="3" fill="white"/>
            <path d="M48 38C48 40 49 41 50 41C51 41 52 40 52 38" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <rect x="35" y="55" width="30" height="3" rx="1.5" fill="white" opacity="0.8"/>
            <rect x="35" y="60" width="30" height="3" rx="1.5" fill="white" opacity="0.8"/>
            <rect x="35" y="65" width="30" height="3" rx="1.5" fill="white" opacity="0.8"/>
          </svg>
        ),
        description: "Optimizes processes, supply chain, and organizational efficiency."
      },
      'Marcus': {
        silhouette: (
          <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 10C38 10 28 18 28 30C28 38 33 45 42 50L38 82C38 87 43 90 48 90H52C57 90 62 87 62 82L58 50C67 45 72 38 72 30C72 18 62 10 50 10Z" fill="#6366F1"/>
            <circle cx="44" cy="26" r="3" fill="white"/>
            <circle cx="56" cy="26" r="3" fill="white"/>
            <path d="M47 36C47 38 48 39 50 39C52 39 53 38 53 36" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <rect x="40" y="55" width="20" height="8" rx="4" fill="white" opacity="0.8"/>
            <path d="M42 57L45 60L50 57L55 60L58 57" stroke="#6366F1" strokeWidth="1" strokeLinecap="round"/>
          </svg>
        ),
        description: "Ensures compliance, contracts, and IP protection."
      },
      'Elena': {
        silhouette: (
          <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 12C40 12 33 20 33 32C33 40 37 47 44 51L40 83C40 88 44 91 49 91H51C56 91 60 88 60 83L56 51C63 47 67 40 67 32C67 20 60 12 50 12Z" fill="#14B8A6"/>
            <circle cx="44" cy="28" r="3" fill="white"/>
            <circle cx="56" cy="28" r="3" fill="white"/>
            <path d="M47 38C47 40 48 41 50 41C52 41 53 40 53 38" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="50" cy="55" r="6" fill="white" opacity="0.8"/>
            <circle cx="50" cy="55" r="3" fill="#14B8A6"/>
            <path d="M47 52L50 55L53 52" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
        description: "Specializes in recruiting, culture, and performance management."
      }
    };

    const name = selectedHelperData.name;
    return {
      ...selectedHelperData,
      silhouette: helperInfo[name]?.silhouette || (
        <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="35" r="20" fill="#6B7280"/>
          <path d="M35 55C35 65 42 75 50 75C58 75 65 65 65 55" fill="#6B7280"/>
        </svg>
      ),
      description: helperInfo[name]?.description || "This AI advisor is here to help you with specialized guidance and expertise."
    };
  };

  const handleTestAPI = async () => {
    setIsTestingAPI(true);
    setTestSuccess(false);
    setError(null);

    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: "Hello, this is a test message from Helper."
        }),
      });

      if (response.ok) {
        setTestSuccess(true);
        // Hide success indicator after 2 seconds
        setTimeout(() => {
          setTestSuccess(false);
        }, 2000);
      } else {
        const errorText = await response.text();
        console.error('API test failed:', errorText);
        setError('API test failed: ' + errorText);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('API test failed:', error);
      setError('API test failed: ' + errorMessage);
    } finally {
      setIsTestingAPI(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <Header title="Helper" />

      <div className="page-wrap">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Input - 25% width */}
        <div className="lg:col-span-1">
          {/* User Query Input Box */}
          <div className="border rounded-lg p-4 bg-white shadow-sm sticky top-6 mb-4">
            <h2 className="text-lg font-normal mb-3">How can I help you today?</h2>
            <div className="relative">
              <textarea
                value={userQuery}
                onChange={(e) => {
                  setUserQuery(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (userQuery.trim()) {
                      const query = userQuery.trim();
                      console.log('Enter pressed! Query:', query);

                      setHasSubmitted(true);
                      setIsSubmitting(true);
                      setSubmissionMessage("🎯 Matching an Expert...");

                      // Trigger the suggestion system
                      suggestHelper(query);

                      // Reset submitting state after a delay
                      setTimeout(() => {
                        setIsSubmitting(false);
                      }, 1500);
                    }
                  }
                }}
                placeholder="Describe what you need help with..."
                className={`w-full border rounded-lg p-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 ${
                  isSubmitting
                    ? 'border-green-500 bg-green-50 shadow-lg shadow-green-200'
                    : 'border-gray-300'
                }`}
                rows={4}
              />
              <div className="text-xs text-gray-500 mt-1">
                <span>Press Enter to submit • Shift+Enter for new line</span>
              </div>


              {userQuery && (
                <button
                  onClick={() => {
                    setUserQuery("");
                    setSuggestedHelper(null);
                    setShowSuggestion(false);
                    setSelectedHelper("");
                    setHasSubmitted(false);
                    setSubmissionMessage("");
                    setIsSubmitting(false);
                  }}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-sm"
                  title="Clear query"
                >
                  ✕
                </button>
              )}
            </div>
            {showSuggestion && suggestedHelper && !isSubmitting && (
              <div className="mt-4 relative overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-xl shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg">🎯</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-sm mb-1">Perfect Match Found!</h4>
                      <p className="text-green-100 text-sm">
                        Connecting you with <span className="font-bold text-white">{helpers.find(h => h.id === suggestedHelper)?.name}</span>
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-green-400 border-opacity-30">
                    <p className="text-green-100 text-xs">
                      ✨ Specialized AI advisor automatically selected based on your needs
                    </p>
                  </div>
                </div>

                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl blur-sm opacity-20 -z-10 transform scale-105"></div>
              </div>
            )}

            {hasSubmitted && isSubmitting && (
              <div className="mt-4 relative overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 rounded-xl shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg">🤔</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-sm">Matching an Expert</h4>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-blue-300 rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-blue-300 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-1 h-1 bg-blue-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl blur-sm opacity-20 -z-10 transform scale-105"></div>
              </div>
            )}
          </div>

          <div className="border rounded-lg p-4 bg-white shadow-sm sticky top-6">
            <h2 className="text-lg font-normal mb-3">Chat to Helper</h2>

            <button
              className="w-full rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-50 text-sm text-left"
            >
              Start a conversation...
            </button>

            <button
              className="mt-2 w-full rounded-lg bg-blue-600 text-white px-3 py-2 hover:bg-blue-700 text-sm"
            >
              Send Message
            </button>
            {error && (
              <div className="mt-3 text-sm text-red-600">
                {error}
              </div>
            )}



            {/* Admin Section */}
            <div className="mt-4 border-t pt-4">
              <button
                onClick={() => setShowAdmin(!showAdmin)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-50 text-sm"
              >
                {showAdmin ? 'Hide Admin' : 'Show Admin'}
              </button>

              {showAdmin && (
                <div className="mt-3 space-y-3">
                {/* Rupert Prompts Dropdown */}
                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-2">
                    Rupert's Prompts
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="1">Business Analysis</option>
                    <option value="2">Financial Planning</option>
                    <option value="3">Market Research</option>
                  </select>
                </div>

                {/* Data Prompts Dropdown */}
                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-2">
                    Data Prompts
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="1">Company Overview</option>
                    <option value="2">Financial Data</option>
                    <option value="3">Market Analysis</option>
                  </select>
                </div>

                {/* Second Rupert Prompts Dropdown */}
                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-2">
                    Rupert's Prompts
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="1">Business Analysis</option>
                    <option value="2">Financial Planning</option>
                    <option value="3">Market Research</option>
                  </select>
                </div>

                {/* API Controls Section */}
                <div className="mt-6 pt-4 border-t">
                  <h3 className="text-sm font-normal text-gray-700 mb-3">API checks & controls</h3>
                </div>

                {/* Prompt and Test API Buttons */}
                <div className="flex flex-col space-y-3">
                  <button
                    className="w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 hover:bg-blue-100 text-sm text-blue-800"
                  >
                    Data Analysis Prompt
                  </button>
                  <button
                    className="w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 hover:bg-blue-100 text-sm text-blue-800"
                  >
                    Data Analysis Prompt
                  </button>
                  <button
                    onClick={handleTestAPI}
                    disabled={isTestingAPI}
                    className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors ${
                      testSuccess
                        ? 'bg-green-600 hover:bg-green-700 text-white border-green-600'
                        : 'hover:bg-gray-50 border-gray-300'
                    }`}
                  >
                    {isTestingAPI ? 'Testing...' : testSuccess ? '✓ Success!' : 'Test API'}
                  </button>
                </div>
              </div>
              )}
            </div>

            {/* Recommended Helper Information Box */}
            {selectedHelper && (
              <div className="mt-4 border-t pt-4">
                <div className="border rounded-lg p-4 bg-gradient-to-br from-green-50 to-emerald-50 shadow-sm">
                  <div className="text-center">
                    <div className="mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        🎯 Recommended AI Advisor
                      </span>
                    </div>
                    {/* Helper Silhouette */}
                    <div className="flex justify-center mb-3">
                      {getSelectedHelperInfo()?.silhouette}
                    </div>

                    {/* Helper Name */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {getSelectedHelperInfo()?.name}
                    </h3>

                    {/* Helper Role */}
                    <p className="text-sm text-blue-600 font-medium mb-3">
                      {getSelectedHelperInfo()?.role}
                    </p>

                    {/* Helper Description */}
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {getSelectedHelperInfo()?.description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Output - 75% width */}
        <div className="lg:col-span-3">
          {/* Placeholder box to show the output area */}
          <div className="border rounded-lg p-4 bg-gray-50 shadow-sm">
            <h3 className="text-lg font-normal mb-3">Results</h3>
            <p className="text-gray-600 text-sm">
              Describe your needs above and I'll recommend the perfect AI advisor to help you.
            </p>
          </div>

          {/* Conversation Area */}
          <div className="mt-6 border rounded-lg p-4 bg-white shadow-sm">
            <h4 className="text-md font-normal mb-3">Conversation</h4>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500 text-sm">Your conversation with the recommended AI advisor will appear here</p>
            </div>
          </div>

          {/* All Advisors Grid - Right Side */}
          <div className="mt-6">
            <h3 className="text-lg font-normal mb-4">Our AI Advisors</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {allAdvisors.length === 0 ? (
                <div className="col-span-full p-4 bg-yellow-100 border border-yellow-300 rounded">
                  <p>No advisors loaded yet. Check console for errors.</p>
                </div>
              ) : (
                allAdvisors.map((advisor, index) => {
                  const colors = {
                    'Business Advisor': 'from-blue-100 to-blue-200 border-blue-300',
                    'Financial Advisor': 'from-green-100 to-green-200 border-green-300',
                    'Presentation Advisor': 'from-purple-100 to-purple-200 border-purple-300',
                    'Sales Advisor': 'from-orange-100 to-orange-200 border-orange-300',
                    'Marketing Advisor': 'from-cyan-100 to-cyan-200 border-cyan-300',
                    'Product Advisor': 'from-pink-100 to-pink-200 border-pink-300',
                    'Technology Advisor': 'from-lime-100 to-lime-200 border-lime-300',
                    'Operations Advisor': 'from-yellow-100 to-yellow-200 border-yellow-300',
                    'Legal Advisor': 'from-indigo-100 to-indigo-200 border-indigo-300',
                    'HR & Talent Advisor': 'from-teal-100 to-teal-200 border-teal-300'
                  };

                  return (
                    <div
                      key={index}
                      className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden border-2 border-gray-200">
                          <AdvisorImage
                            name={advisor.name}
                            role={advisor.role}
                            colors={colors}
                          />
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">{advisor.name}</h4>
                        <p className="text-sm text-blue-600 mb-2">{advisor.role}</p>
                        <p className="text-xs text-gray-600 leading-relaxed">{advisor.description}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
        </div>
      </div>
    </div>
  );
}
