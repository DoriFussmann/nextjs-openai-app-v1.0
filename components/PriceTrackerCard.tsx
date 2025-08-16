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
      w-full aspect-square
      bg-white
      border border-[#EAEAEA]
      rounded-lg
      shadow-[0_4px_18px_rgba(0,0,0,0.06)]
      p-5
      ${className}
    `}>
                    <div className="flex flex-col h-full">
         <div className="space-y-6">
                       {/* Icon tile */}
            <div className={`w-14 h-14 ${iconColor} rounded-xl flex items-center justify-center`}>
             {icon ? (
               <div className="w-6 h-6 text-white">
                 {icon}
               </div>
             ) : (
               <div className="w-6 h-6 bg-white rounded-sm"></div>
             )}
           </div>

           {/* Content */}
           <div className="space-y-3">
                                    {/* Title */}
            <h3 className="text-[1.125rem] leading-[1.25] font-normal text-[#111827]">
              {title}
            </h3>

                       {/* Description */}
            <p className="text-[0.906rem] leading-[1.9] text-[#6B7280]">
              {description}
            </p>
           </div>
         </div>

         {/* Status pill - pushed to bottom */}
         <div className="mt-auto pt-6">
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
    </div>
  );
}
