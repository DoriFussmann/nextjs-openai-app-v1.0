import React from 'react';

interface PriceTrackerCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  iconColor?: string;
  status?: 'active' | 'inactive' | 'pending';
  className?: string;
}

export default function PriceTrackerCard({
  title,
  description,
  icon,
  iconColor = 'bg-[#EF4444]',
  status = 'active',
  className = ''
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

  return (
    <div className={`
      bg-white
      border border-gray-200
      rounded-xl
      p-8
      shadow-lg
      hover:scale-105
      transition-all duration-300
      cursor-pointer
      flex flex-col h-full
      ${className}
    `}>
      {/* Icon Section */}
      <div className={`${iconColor} rounded-xl w-16 h-16 flex items-center justify-center mb-6`}>
        {icon ? (
          <div className="w-6 h-6 text-white">
            {icon}
          </div>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg text-gray-900 mb-4">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 text-sm leading-relaxed flex-grow">
        {description}
      </p>

      {/* Status pill - pushed to bottom with spacing */}
      <div className="mt-6">
        <div className={`
          h-7 px-3 rounded-full
          ${currentStatus.bg}
          ${currentStatus.text}
          font-normal text-[0.781rem]
          flex items-center justify-center
          w-fit
        `}>
          {currentStatus.label}
        </div>
      </div>
    </div>
  );
}
