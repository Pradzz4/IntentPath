import type { FlowOption } from '../types';
import { Icon } from './Icon';

interface ChoiceCardProps {
  option: FlowOption;
  onSelect: (optionId: string) => void;
  selected?: boolean;
  index?: number;
}

export function ChoiceCard({ option, onSelect, selected = false }: ChoiceCardProps) {
  const urgent = option.tone === 'urgent';

  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      aria-pressed={selected || undefined}
      className={`group relative flex min-h-[5rem] w-full items-center justify-between gap-4 rounded-xl border p-4.5 sm:p-5 text-left transition-all duration-150 ${
        urgent
          ? 'border-app-danger/40 bg-app-surface hover:border-app-danger hover:bg-app-dangerSoft/50 shadow-sm'
          : selected
            ? 'border-app-accent bg-app-accentSoft text-app-text ring-1 ring-app-accent/40 shadow-sm'
            : 'border-app-border bg-app-surface hover:border-app-borderStrong hover:bg-app-surfaceSoft/70 shadow-sm hover:shadow-card'
      }`}
    >
      <div className="flex items-center gap-4 min-w-0">
        {/* Meaningful Icon Box */}
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${
            urgent
              ? 'bg-app-dangerSoft text-app-danger'
              : selected
                ? 'bg-app-accent text-app-onAccent shadow-sm'
                : 'bg-app-surfaceSoft text-app-text group-hover:bg-app-bgSubtle'
          }`}
          aria-hidden="true"
        >
          <Icon name={option.icon} className="h-6 w-6" strokeWidth={2} />
        </span>

        {/* Option Text and Helper */}
        <div className="min-w-0 flex-1">
          <span className="block font-sans text-lg sm:text-xl font-semibold leading-snug text-app-text">
            {option.label}
          </span>
          {option.helper && (
            <span className="mt-1 block font-sans text-xs sm:text-sm text-app-muted leading-normal">
              {option.helper}
            </span>
          )}
          {urgent && (
            <span className="mt-1 inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-sans text-[0.7rem] font-semibold uppercase tracking-wider text-app-danger bg-app-dangerSoft">
              Immediate attention
            </span>
          )}
        </div>
      </div>

      {/* Visual State / Advance Indicator */}
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform group-hover:translate-x-0.5 ${
          selected
            ? 'bg-app-accent text-app-onAccent'
            : 'text-app-muted group-hover:text-app-text'
        }`}
        aria-hidden="true"
      >
        {selected ? (
          <Icon name="Check" className="h-5 w-5" strokeWidth={2.5} />
        ) : (
          <Icon name="ChevronRight" className="h-5 w-5" strokeWidth={2} />
        )}
      </div>
    </button>
  );
}
