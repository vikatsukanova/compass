type CircularProgressProps = {
  percent: number;
  strokeClass: string;
};

export function CircularProgress({ percent, strokeClass }: CircularProgressProps) {
  const rounded = Math.max(0, Math.round(percent));
  const arc = Math.min(rounded, 100);

  return (
    <div className="h-16 w-16 shrink-0">
      <svg viewBox="0 0 36 36" className="circular-chart" role="img" aria-label={`${rounded}% of weekly target`}>
        <path
          className="circle-bg"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          className={`circle ${strokeClass}`}
          strokeDasharray={`${arc}, 100`}
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <text x="18" y="20.35" className="percentage">
          {rounded}%
        </text>
      </svg>
    </div>
  );
}
