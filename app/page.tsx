'use client';

import { useState, useEffect } from 'react';
import PriceTrackerCard from '@/components/PriceTrackerCard';

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

  const items = [
    {
      title: "Price tracker",
      description: "Track share prices with intelligent annotations.",
      iconColor: "bg-blue-500"
    },
    {
      title: "Deck builder",
      description: "AI-powered presentation creation with professional templates.",
      iconColor: "bg-purple-500"
    },
    {
      title: "Investor hub",
      description: "Investor relations platform with secure document sharing.",
      iconColor: "bg-green-500"
    },
    {
      title: "Model builder",
      description: "Build financial models with automated calculations.",
      iconColor: "bg-orange-500"
    },
    {
      title: "Data analytics",
      description: "Advanced analytics and insights with real-time dashboards.",
      iconColor: "bg-red-500"
    }
  ];

  return (
    <div className="bg-white text-black">
      {/* Page Header */}
      <header className="border-b border-gray-200 px-4 py-4">
        <div className="page-wrap flex justify-between items-center">
          <div className="text-xl">My project</div>
          <nav className="hidden md:flex space-x-4">
            <a href="/openai-call" className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200 text-sm">OpenAI</a>
          </nav>
        </div>
      </header>

      <main className="page-wrap">
        {/* Main Header Section */}
        <header className="py-8 md:py-10 lg:py-12">
          <div className="w-full">
            <h1 className="text-5xl md:text-7xl text-gray-900 mb-6 leading-tight">
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

        {/* Main Grid Section */}
        <section className="mt-8 md:mt-10 lg:mt-12">
          <div className="w-full">
            <h2 className="text-[1.5rem] md:text-[1.75rem] font-normal mb-6">Financial tools</h2>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.map((item, index) => (
                <PriceTrackerCard
                  key={index}
                  title={item.title}
                  description={item.description}
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
