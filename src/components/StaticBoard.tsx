import { useMemo, useState } from 'react';
import type { StaticPhrase } from '../types';
import { staticBoardCategories, staticBoardPhrases } from '../data/staticBoardData';
import { Icon } from './Icon';
import { SpeechControls } from './SpeechControls';

interface StaticBoardProps {
  onConfirm: (message: string) => void;
  onPhraseSelected: () => void;
  confirmHint?: string;
}

export function StaticBoard({ onConfirm, onPhraseSelected, confirmHint }: StaticBoardProps) {
  const [category, setCategory] = useState<string>('all');
  const [selected, setSelected] = useState<StaticPhrase | null>(null);

  const phrases = useMemo(
    () =>
      category === 'all'
        ? staticBoardPhrases
        : staticBoardPhrases.filter((phrase) => phrase.category === category),
    [category],
  );

  const choosePhrase = (phrase: StaticPhrase) => {
    setSelected(phrase);
    onPhraseSelected();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.55fr_1fr] lg:items-start">
      <div>
        <div className="mb-4 border-b border-app-border pb-3 flex items-baseline justify-between">
          <div>
            <h3 className="font-sans text-xl font-semibold text-app-text">
              Static Communication Board
            </h3>
            <p className="text-xs text-app-muted mt-0.5">
              Traditional grid of fixed phrases for comparative practice
            </p>
          </div>
          <span className="text-xs text-app-muted font-medium">
            {phrases.length} phrases
          </span>
        </div>

        {/* Category Tabs */}
        <div
          className="mb-5 flex flex-wrap gap-2"
          role="group"
          aria-label="Filter phrases by category"
        >
          <button
            type="button"
            onClick={() => setCategory('all')}
            aria-pressed={category === 'all'}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              category === 'all'
                ? 'bg-app-accent text-app-onAccent shadow-sm'
                : 'border border-app-border bg-app-surface text-app-muted hover:border-app-borderStrong hover:text-app-text'
            }`}
          >
            All phrases ({staticBoardPhrases.length})
          </button>
          {staticBoardCategories.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              aria-pressed={category === item.id}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                category === item.id
                  ? 'bg-app-accent text-app-onAccent shadow-sm'
                  : 'border border-app-border bg-app-surface text-app-muted hover:border-app-borderStrong hover:text-app-text'
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>

        {/* Phrases Grid */}
        <ul className="grid gap-2.5 sm:grid-cols-2" aria-label="Static phrases list">
          {phrases.map((phrase) => {
            const isSelected = selected?.id === phrase.id;
            return (
              <li key={phrase.id}>
                <button
                  type="button"
                  onClick={() => choosePhrase(phrase)}
                  aria-pressed={isSelected}
                  className={`flex h-full min-h-[4.75rem] w-full items-center gap-3.5 rounded-xl border p-3.5 text-left transition-all ${
                    isSelected
                      ? 'border-app-accent bg-app-accentSoft text-app-text ring-1 ring-app-accent/40 shadow-sm'
                      : 'border-app-border bg-app-surface hover:border-app-borderStrong hover:bg-app-surfaceSoft/60 shadow-sm'
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-app-accent text-app-onAccent'
                        : 'bg-app-surfaceSoft text-app-text'
                    }`}
                  >
                    <Icon name={phrase.icon} className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <span className="min-w-0 flex-1 font-sans text-sm font-medium leading-snug text-app-text">
                    {phrase.text}
                  </span>
                  {isSelected && (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-app-accent text-white text-xs">
                      ✓
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Selected phrase confirmation console */}
      <div className="lg:sticky lg:top-24">
        <section
          className="rounded-xl border border-app-border bg-app-surface p-5 sm:p-6 shadow-card"
          aria-labelledby="selected-phrase-heading"
        >
          <div className="border-b border-app-border pb-3 flex items-center justify-between">
            <h4 id="selected-phrase-heading" className="text-sm font-semibold text-app-text">
              Selected Phrase
            </h4>
            <span className="text-xs text-app-muted">Review &amp; Speak</span>
          </div>

          {selected ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-lg border-l-4 border-app-accent bg-app-accentSoft/40 p-4">
                <p className="font-sans text-lg sm:text-xl font-semibold leading-relaxed text-app-text">
                  “{selected.text}”
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-app-border">
                <SpeechControls text={selected.text} label="Listen to phrase" />
                <button
                  type="button"
                  onClick={() => onConfirm(selected.text)}
                  className="btn-primary w-full min-h-[3.25rem] text-sm font-semibold shadow-sm"
                >
                  <Icon name="CheckCircle2" className="h-4 w-4" />
                  <span>Confirm message</span>
                </button>
                <p className="text-xs text-app-muted leading-relaxed">
                  {confirmHint ??
                    'Listening does not confirm. Select another phrase at any time.'}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-app-border bg-app-surfaceSoft/60 p-4 text-center text-xs sm:text-sm text-app-muted leading-relaxed">
              Select any phrase from the board to preview and confirm.
            </p>
          )}
        </section>

        <p className="sr-only" aria-live="polite">
          {selected ? `Selected message: ${selected.text}` : ''}
        </p>
      </div>
    </div>
  );
}
