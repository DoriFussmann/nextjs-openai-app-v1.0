import React from 'react';

interface PriceTrackerCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  status?: 'active' | 'inactive' | 'pending';
  className?: string;
  href?: string;
  iconColor?: string;
}

export default function PriceTrackerCard({
  title,
  description,
  icon,
  status = 'active',
  className = '',
  href,
  iconColor = 'bg-red-600'
}: PriceTrackerCardProps) {
  const statusConfig = {
    active: {
      bg: 'bg-[#EAFBF1]',
      text: 'text-[#16A34A]',
      label: 'Active'
    },
    inactive: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      label: 'Inactive'
    },
    pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      label: 'Pending'
    }
  };

  const currentStatus = statusConfig[status];

  const handleClick = () => {
    if (href && href !== '#') {
      window.location.href = href;
    }
  };

  return (
    <div
      className={`
        bg-white
        border border-gray-200
        rounded-lg
        p-5
        shadow-lg
        hover:scale-105
        transition-all duration-300
        cursor-pointer
        flex flex-col
        h-[235px]
        ${className}
      `}
      onClick={handleClick}
    >
      {/* Top - Icon left-aligned */}
      <div className="flex justify-start mb-4">
        <div className={`${iconColor} rounded-lg w-12 h-12 flex items-center justify-center`}>
          {icon ? (
            <div className="w-5 h-5 text-white flex items-center justify-center">
              {icon}
            </div>
          ) : (
            <div className="w-5 h-5 flex items-center justify-center">
              <svg className="w-full h-full" fill="none" stroke="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Title - left-aligned */}
      <div className="text-left mb-3">
        <h3 className="text-lg text-gray-900 font-medium">
          {title}
        </h3>
      </div>

      {/* Description - left-aligned */}
      <div className="text-left flex-grow mb-4">
        <p className="text-gray-600 text-sm leading-relaxed">
          {description}
        </p>
      </div>

      {/* Status pill - bottom left */}
      <div className="flex justify-start">
        <div className={`
          h-6 px-2 rounded-lg
          ${currentStatus.bg}
          ${currentStatus.text}
          font-normal text-[0.688rem]
          flex items-center justify-center
          w-fit
        `}>
          {currentStatus.label}
        </div>
      </div>
    </div>
  );
}
