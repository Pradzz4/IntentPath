import type { FlowState } from '../types';
import { Icon } from './Icon';

interface MessagePreviewProps {
  state: FlowState;
  onRewind?: (selectionIndex: number) => void;
  className?: string;
}

export function MessagePreview({ state, onRewind, className = '' }: MessagePreviewProps) {
  const hasHistory = state.history.length > 0 || Boolean(state.custom);

  return (
    <section
      className={`rounded-xl border border-app-border bg-app-surface p-5 shadow-sm ${className}`}
      aria-labelledby="message-preview-heading"
    >
      <div className="flex items-center justify-between border-b border-app-border pb-3">
        <h2 id="message-preview-heading" className="font-sans text-sm font-semibold text-app-text">
          Your message so far
        </h2>
        {hasHistory && (
          <span className="font-sans text-xs text-app-muted">
            {state.history.length} {state.history.length === 1 ? 'choice made' : 'choices made'}
          </span>
        )}
      </div>

      {!hasHistory ? (
        <p className="mt-4 rounded-lg border border-dashed border-app-border bg-app-surfaceSoft/60 p-4 text-center text-xs sm:text-sm text-app-muted leading-relaxed">
          Your choices will appear here as you make them.
        </p>
      ) : (
        <ol className="mt-3 divide-y divide-app-border/70" aria-label="Sequence of recorded choices">
          {state.history.map((selection, index) => (
            <li key={`${selection.nodeId}-${selection.optionId}-${index}`} className="py-2.5 first:pt-1 last:pb-1">
              {onRewind ? (
                <button
                  type="button"
                  onClick={() => onRewind(index)}
                  className="group flex w-full items-center justify-between gap-3 rounded-lg p-2 text-left transition-colors hover:bg-app-surfaceSoft"
                  aria-label={`Go back and change choice ${index + 1}: ${selection.label}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-app-accentSoft text-app-accentInk text-xs font-semibold">
                      {index + 1}
                    </span>
                    <span className="font-sans text-sm font-medium text-app-text truncate">
                      {selection.label}
                    </span>
                  </div>

                  <span className="flex items-center gap-1 text-xs font-medium text-app-accent opacity-80 group-hover:opacity-100 shrink-0">
                    <Icon name="Undo2" className="h-3.5 w-3.5" />
                    <span>Change</span>
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-2.5 py-1">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-app-accentSoft text-app-accentInk text-xs font-semibold">
                    {index + 1}
                  </span>
                  <span className="font-sans text-sm font-medium text-app-text">{selection.label}</span>
                </div>
              )}
            </li>
          ))}

          {state.custom && (
            <li className="mt-2 rounded-lg border-l-4 border-app-accent bg-app-accentSoft/40 p-3">
              <span className="block text-[0.7rem] font-semibold uppercase tracking-wider text-app-accentInk">
                Your own words
              </span>
              <span className="mt-0.5 block text-sm font-medium text-app-text">“{state.custom.text}”</span>
            </li>
          )}
        </ol>
      )}

      {hasHistory && onRewind && (
        <p className="mt-3 border-t border-app-border pt-2.5 text-[0.75rem] text-app-muted">
          Tap any choice above to go back and change it.
        </p>
      )}
    </section>
  );
}
