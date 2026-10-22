import { useSpeech } from '../hooks/useSpeech';
import { Icon } from './Icon';

interface SpeechControlsProps {
  text: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function SpeechControls({
  text,
  label = 'Speak aloud',
  className = '',
  disabled = false,
}: SpeechControlsProps) {
  const { supported, speaking, error, speak, stop } = useSpeech();
  const hasText = text.trim().length > 0;
  const isDisabled = disabled || !supported || !hasText;

  const handleSpeak = () => {
    speak(text);
  };

  const handleRepeat = () => {
    stop();
    window.setTimeout(() => {
      speak(text);
    }, 40);
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-3">
        {!speaking ? (
          <button
            type="button"
            onClick={handleSpeak}
            disabled={isDisabled}
            className="btn-primary min-h-[3.25rem] px-6 text-base font-semibold shadow-sm"
            aria-label={label}
          >
            <Icon name="Volume2" className="h-5 w-5" />
            <span>{label}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={stop}
            className="btn-urgent min-h-[3.25rem] px-6 text-base font-semibold shadow-sm"
            aria-label="Stop speaking"
          >
            <Icon name="Square" className="h-5 w-5" />
            <span>Stop speech</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleRepeat}
          disabled={isDisabled}
          className="btn-secondary min-h-[3.25rem] px-4 text-sm font-medium"
          title="Repeat statement from the beginning"
          aria-label="Repeat message"
        >
          <Icon name="RotateCcw" className="h-4 w-4" />
          <span>Repeat</span>
        </button>
      </div>

      <p className="sr-only" aria-live="polite">
        {speaking ? 'Audio playback active.' : ''}
        {error ?? ''}
      </p>

      {speaking && (
        <div className="mt-3.5 flex items-center gap-2.5 rounded-lg border border-app-accent/30 bg-app-accentSoft p-3 text-sm font-medium text-app-accentInk">
          <span className="speak-indicator inline-flex h-4 items-end gap-1" aria-hidden="true">
            <span className="h-4 w-1.5 rounded-full origin-bottom animate-speak-wave bg-app-accent [animation-delay:-300ms]" />
            <span className="h-4 w-1.5 rounded-full origin-bottom animate-speak-wave bg-app-accent [animation-delay:-150ms]" />
            <span className="h-4 w-1.5 rounded-full origin-bottom animate-speak-wave bg-app-accent" />
          </span>
          <span>Speaking message aloud...</span>
        </div>
      )}

      {!supported && (
        <p className="mt-3 rounded-lg border border-app-warm/30 bg-app-warmSoft p-3 text-xs sm:text-sm text-app-warm leading-relaxed">
          Speech synthesis is not available on this browser. You can still create and visually show your confirmed message.
        </p>
      )}

      {supported && error && (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-app-danger/30 bg-app-dangerSoft p-3 text-xs sm:text-sm font-medium text-app-danger"
        >
          Audio playback error: {error}
        </p>
      )}
    </div>
  );
}
