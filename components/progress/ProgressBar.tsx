export default function ProgressBar({ percent }: { percent: number }) {
  const safe = Math.max(0, Math.min(100, percent));
  return (
    <div className="w-full h-[6px] bg-neutral-200 rounded" aria-label="progress">
      <div
        className="h-[6px] rounded"
        style={{ width: `${safe}%`, background: "black" }}
        role="progressbar"
        aria-valuenow={safe}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}
