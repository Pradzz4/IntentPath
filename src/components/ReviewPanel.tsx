import { useEffect, useId, useState } from 'react';
import { Icon } from './Icon';
import { SpeechControls } from './SpeechControls';

interface ReviewPanelProps {
  initialMessage: string;
  alternatives: string[];
  confirmed: boolean;
  confirmedMessage: string | null;
  onConfirm: (message: string) => void;
  onUnconfirm?: () => void;
  onChangeChoices: () => void;
  onStartOver: () => void;
  allowUnconfirm?: boolean;
  confirmHint?: string;
  contextLabel?: string;
}

export function ReviewPanel({
  initialMessage,
  alternatives,
  confirmed,
  confirmedMessage,
  onConfirm,
  onUnconfirm,
  onChangeChoices,
  onStartOver,
  allowUnconfirm = true,
  confirmHint,
  contextLabel,
}: ReviewPanelProps) {
  const [message, setMessage] = useState(initialMessage);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialMessage);
  const textareaId = useId();
  const helpId = useId();

  useEffect(() => {
    setMessage(initialMessage);
    setDraft(initialMessage);
    setEditing(false);
  }, [initialMessage]);

  const displayMessage = confirmed ? (confirmedMessage ?? message) : message;

  const chooseAlternative = (alternative: string) => {
    setMessage(alternative);
    setDraft(alternative);
  };

  const saveEdit = () => {
    const next = draft.trim();
    if (!next) return;
    setMessage(next);
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Primary Message Card */}
      <section
        className="rounded-xl border border-app-border bg-app-surface shadow-card overflow-hidden"
        aria-labelledby="message-card-heading"
      >
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-app-border bg-app-surfaceSoft/60 px-5 py-3">
          <span id="message-card-heading" className="font-sans text-xs font-semibold uppercase tracking-wider text-app-muted">
            {contextLabel ? `Message · ${contextLabel}` : 'Formulated Message'}
          </span>
          {confirmed ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-app-successSoft px-2 py-0.5 text-xs font-semibold text-app-success">
              <Icon name="Check" className="h-3.5 w-3.5" />
              Confirmed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md bg-app-bgSubtle px-2 py-0.5 text-xs font-medium text-app-muted">
              Ready to verify
            </span>
          )}
        </div>

        {/* Message Content or Editor */}
        <div className="p-6 sm:p-8">
          {editing ? (
            <div className="space-y-4">
              <div>
                <label htmlFor={textareaId} className="block text-sm font-semibold text-app-text mb-1">
                  Edit your message
                </label>
                <p id={helpId} className="text-xs text-app-muted">
                  You can type or adjust any words.
                </p>
              </div>

              <textarea
                id={textareaId}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={300}
                rows={3}
                aria-describedby={helpId}
                className="text-field font-sans text-xl sm:text-2xl leading-relaxed p-4"
              />

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={saveEdit}
                    disabled={!draft.trim()}
                    className="btn-primary text-sm font-semibold"
                  >
                    Save changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDraft(message);
                      setEditing(false);
                    }}
                    className="btn-secondary text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
                <span className="text-xs text-app-muted">{draft.length}/300</span>
              </div>
            </div>
          ) : (
            <div>
              <p className="font-sans text-2xl sm:text-3xl lg:text-4xl font-semibold leading-relaxed text-app-text">
                “{displayMessage}”
              </p>

              {!confirmed && (
                <div className="mt-6 pt-4 border-t border-app-border flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setDraft(message);
                      setEditing(true);
                    }}
                    className="btn-ghost text-sm font-medium text-app-accent -ml-2 hover:bg-app-accentSoft"
                  >
                    <Icon name="Pencil" className="h-4 w-4" />
                    <span>Edit wording</span>
                  </button>

                  <span className="text-xs text-app-muted hidden sm:inline">
                    Created from your guided choices
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Alternative Phrasings (if available and not yet confirmed) */}
      {!confirmed && alternatives.length > 0 && !editing && (
        <section
          className="rounded-xl border border-app-border bg-app-surface p-5 shadow-sm"
          aria-labelledby="alternatives-heading"
        >
          <div className="border-b border-app-border pb-2.5">
            <h2 id="alternatives-heading" className="text-sm font-semibold text-app-text">
              Other ways to say this
            </h2>
            <p className="text-xs text-app-muted mt-0.5">
              Select any alternative to use it as your message.
            </p>
          </div>

          <ul className="mt-3 space-y-2">
            {alternatives.map((alt) => {
              const isSelected = alt === message;
              return (
                <li key={alt}>
                  <button
                    type="button"
                    onClick={() => chooseAlternative(alt)}
                    className={`w-full flex items-center justify-between rounded-lg p-3 text-left transition-all ${
                      isSelected
                        ? 'border-2 border-app-accent bg-app-accentSoft/60 font-semibold text-app-accentInk'
                        : 'border border-app-border hover:border-app-borderStrong hover:bg-app-surfaceSoft text-app-text'
                    }`}
                  >
                    <span className="font-sans text-base sm:text-lg leading-snug">
                      “{alt}”
                    </span>
                    {isSelected && (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-app-accent text-white text-xs ml-2">
                        ✓
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Primary Action Area: Confirmation or Speech */}
      {confirmed ? (
        <div className="space-y-4">
          {/* Confirmed Reassurance Banner */}
          <div
            className="rounded-xl border border-app-success/40 bg-app-successSoft/70 p-5"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-app-success text-white font-bold text-sm">
                ✓
              </span>
              <div>
                <p className="font-sans text-base font-semibold text-app-success">
                  Message confirmed and ready
                </p>
                <p className="mt-0.5 text-sm text-app-text">
                  Press <strong>Speak aloud</strong> below whenever you are ready. You can repeat or stop it at any time.
                </p>
              </div>
            </div>
          </div>

          {/* Speech Actuation Panel */}
          <div className="rounded-xl border border-app-border bg-app-surface p-6 shadow-card">
            <span className="block font-sans text-xs font-semibold uppercase tracking-wider text-app-muted mb-3">
              Audio playback
            </span>
            <SpeechControls text={displayMessage} label="Speak message aloud" />
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-app-border bg-app-surface p-6 shadow-card">
          <div className="space-y-4">
            <div>
              <h2 className="font-sans text-lg font-semibold text-app-text">
                Confirm your message
              </h2>
              <p className="mt-1 text-sm text-app-muted leading-relaxed">
                {confirmHint ?? 'Confirming prepares your message to be spoken. Nothing will play until you choose to speak.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onConfirm(message)}
              disabled={!message.trim() || editing}
              className="btn-primary w-full min-h-[3.5rem] text-lg font-semibold shadow-sm"
            >
              <Icon name="CheckCircle2" className="h-6 w-6" />
              <span>Confirm this message</span>
            </button>

            {/* Optional quiet sound preview */}
            <div className="pt-4 border-t border-app-border flex items-center justify-between">
              <span className="text-xs text-app-muted">
                Want to listen first without confirming?
              </span>
              <SpeechControls text={message} label="Listen to preview" />
            </div>
          </div>
        </div>
      )}

      {/* Navigation & Reset Actions */}
      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-app-border">
        {confirmed && allowUnconfirm && onUnconfirm && (
          <button
            type="button"
            onClick={onUnconfirm}
            className="btn-secondary text-sm font-medium"
          >
            <Icon name="Pencil" className="h-4 w-4" />
            <span>Revise wording</span>
          </button>
        )}
        <button
          type="button"
          onClick={onChangeChoices}
          className="btn-secondary text-sm font-medium"
        >
          <Icon name="ArrowLeft" className="h-4 w-4" />
          <span>Change prior choices</span>
        </button>
        <button
          type="button"
          onClick={onStartOver}
          className="btn-ghost text-sm font-medium ml-auto text-app-muted hover:text-app-text"
        >
          <Icon name="RotateCcw" className="h-4 w-4" />
          <span>Start over</span>
        </button>
      </div>
    </div>
  );
}
