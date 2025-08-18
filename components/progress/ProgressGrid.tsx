import type { ModelResponse } from "@/types/progress";
import { calcProgress } from "@/lib/calc-progress";
import TopicCard from "./TopicCard";

export default function ProgressGrid({ data }: { data: ModelResponse }) {
  console.log('ProgressGrid received data:', data);
  
  const { topics, summary } = calcProgress(data);
  
  console.log('Calculated progress:', { topics, summary });

  if (!topics || topics.length === 0) {
    return (
      <section className="w-full flex flex-col gap-4">
        <div className="text-sm text-neutral-500">
          No valid topic data found for progress calculation.
        </div>
      </section>
    );
  }

  return (
    <section className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium">Coverage</h2>
        <span className="text-xs px-2 py-1 rounded-full border border-neutral-200">
          Overall: {summary.coveragePercent}%
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((t) => (
          <TopicCard
            key={t.topic}
            topic={t.topic}
            totalSub={t.totalSub}
            answeredSub={t.answeredSub}
            percent={t.percent}
          />
        ))}
      </div>
    </section>
  );
}
