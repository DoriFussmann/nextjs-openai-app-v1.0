"use client";
import React from "react";

interface TopicBoxProps {
  topicId: string;
  title: string;
  percent: number;
}

export default function TopicBoxes({ topics }: { topics: TopicBoxProps[] }) {
  const handleClick = (topicId: string) => {
    if ((window as any).scrollToTopic) {
      (window as any).scrollToTopic(topicId);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {topics.map((topic) => (
        <div
          key={topic.topicId}
          onClick={() => handleClick(topic.topicId)}
          className="cursor-pointer border rounded-lg p-4 hover:bg-gray-50 transition"
        >
          <h3 className="font-normal text-sm">{topic.title}</h3>
          <div className="w-full bg-gray-200 h-2 rounded mt-2">
            <div
              className={`h-2 rounded ${topic.percent < 100 ? 'bg-orange-500' : 'bg-blue-500'}`}
              style={{ width: `${topic.percent}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}
