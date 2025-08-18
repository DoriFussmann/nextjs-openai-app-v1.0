import ProgressBar from "./ProgressBar";

export type TopicCardProps = {
  topic: string;
  totalSub: number;
  answeredSub: number;
  percent: number;
};

export default function TopicCard({ topic, totalSub, answeredSub, percent }: TopicCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col h-full">
      {/* Icon Section */}
      <div className="bg-red-600 rounded-xl w-16 h-16 flex items-center justify-center mb-6">
        <svg className="w-6 h-6" fill="none" stroke="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>

      {/* Title */}
      <h3 className="text-lg text-gray-900 mb-4">
        {topic}
      </h3>

      {/* Description */}
      <div className="text-gray-600 text-sm leading-relaxed flex-grow">
        <div className="flex items-center justify-between mb-2">
          <span>Progress: {percent}%</span>
          <span>{answeredSub}/{totalSub}</span>
        </div>
        <ProgressBar percent={percent} />
      </div>
    </div>
  );
}
