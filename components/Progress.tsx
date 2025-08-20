"use client";
import React from "react";

export const Progress: React.FC<{ percent: number }> = ({ percent }) => {
  const safe = Math.min(100, Math.max(0, percent ?? 0));
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span>Completion</span>
        <span>{safe}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${safe}%`, backgroundColor: "#16a34a" }} />
      </div>
    </div>
  );
};

