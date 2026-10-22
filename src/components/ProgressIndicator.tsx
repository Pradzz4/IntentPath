interface ProgressIndicatorProps {
  step: number;
  remaining: number;
  percent: number;
  label: string;
}

export function ProgressIndicator({ step, remaining, percent, label }: ProgressIndicatorProps) {
  const total = Math.max(step + remaining, 2);

  return (
    <div className="py-2 mb-2">
      <div className="flex items-center justify-between text-xs sm:text-sm font-sans text-app-muted">
        <span className="font-semibold text-app-text">
          {label}
        </span>
        <span className="font-medium text-app-muted">
          Step {step} of about {total}
        </span>
      </div>

      {/* Calm, rounded segmented progress bar */}
      <div
        className="mt-2.5 flex h-2 w-full gap-1.5"
        role="progressbar"
        aria-label={`${label}: step ${step} of about ${total}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        {Array.from({ length: total }).map((_, i) => {
          const isComplete = i < step;
          const isCurrent = i === step - 1;
          return (
            <div
              key={i}
              className={`h-full flex-1 rounded-full transition-colors duration-200 ${
                isComplete
                  ? isCurrent
                    ? 'bg-app-accent'
                    : 'bg-app-accent/60'
                  : 'bg-app-border'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
