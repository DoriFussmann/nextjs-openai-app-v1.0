'use client';

import { useState, useEffect } from 'react';
import PriceTrackerCard from '@/components/PriceTrackerCard';
import { BookOpen, BarChart3, Bot, TrendingUp, PieChart, Wrench, LayoutDashboard } from 'lucide-react';

export default function Home() {
  const [currentWord, setCurrentWord] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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

  const rupertTools = [
    {
      title: "Prompt Hub",
      description: "Access comprehensive guides and documentation for all platform features.",
      href: "/prompt-hub",
      icon: <BookOpen />,
      iconColor: "bg-blue-600"
    },
    {
      title: "Data Mapper",
      description: "AI-powered business plan data mapping and analysis.",
      href: "/data-mapper",
      icon: <BarChart3 />,
      iconColor: "bg-green-600"
    },
    {
      title: "Model builder",
      description: "AI-powered financial model building with schema-aware guidance.",
      href: "/model-builder",
      icon: <Wrench />,
      iconColor: "bg-purple-600"
    }
  ];

  const financialTools = [
    {
      title: "OpenAI",
      description: "AI-powered tools and integrations for enhanced productivity.",
      href: "/openai",
      icon: <Bot />,
      iconColor: "bg-orange-600"
    },
    {
      title: "Share Price",
      description: "Real-time stock market data and price tracking tools.",
      href: "/share-price",
      icon: <TrendingUp />,
      iconColor: "bg-emerald-600"
    },
    {
      title: "Portfolio Analysis",
      description: "Visual-only clone of Share Price layout (no page-level interactivity).",
      href: "/portfolio-analysis",
      icon: <PieChart />,
      iconColor: "bg-indigo-600"
    },
    {
      title: "Portfolio Dashboard",
      description: "Visual portfolio analysis dashboard with charts and insights.",
      href: "/portfolio-analysis",
      icon: <LayoutDashboard />,
      iconColor: "bg-pink-600"
    }
  ];

  return (
    <div className="bg-white text-black">
      {/* Page Header */}
      <header className="border-b border-gray-200 px-4">
        <div className="page-wrap flex justify-between items-center">
          <div className="text-3xl leading-none">Hey Rupert!</div>
          <nav className="hidden md:flex space-x-4">
            {/* Navigation buttons removed - accessible via grid cards below */}
          </nav>
        </div>
      </header>

      <main className="page-wrap">
        {/* Main Header Section */}
        <header className="py-8 md:py-10 lg:py-12">
          <div className="w-full">
            <h1 className="text-5xl md:text-7xl text-gray-900 mb-1 leading-tight">
              What would you like
              <br />
              the power to{' '}
              <span className="text-blue-600">
                {currentText}
                <span className="animate-pulse">|</span>
              </span>
            </h1>
          </div>
        </header>

        {/* Rupert's Tools Section */}
        <section className="mt-2 md:mt-2 lg:mt-3">
          <div className="w-full">
            <h2 className="text-[1.5rem] md:text-[1.75rem] font-normal mb-6">Rupert's tools</h2>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {rupertTools.map((item, index) => (
                <PriceTrackerCard
                  key={index}
                  title={item.title}
                  description={item.description}
                  href={item.href}
                  icon={item.icon}
                  iconColor={item.iconColor}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Financial Tools Section */}
        <section className="mt-8 md:mt-10 lg:mt-12">
          <div className="w-full">
            <h2 className="text-[1.5rem] md:text-[1.75rem] font-normal mb-6">Financial tools</h2>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {financialTools.map((item, index) => (
                <PriceTrackerCard
                  key={index}
                  title={item.title}
                  description={item.description}
                  href={item.href}
                  icon={item.icon}
                  iconColor={item.iconColor}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
