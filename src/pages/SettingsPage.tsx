import { Icon } from '../components/Icon';
import { SettingsPanel } from '../components/SettingsPanel';
import type { AppScreen } from '../types';

interface SettingsPageProps {
  resultsCount: number;
  onClearResults: () => void;
  onNavigate: (screen: AppScreen) => void;
}

export function SettingsPage({ resultsCount, onClearResults, onNavigate }: SettingsPageProps) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-4">
        <button
          type="button"
          onClick={() => onNavigate('welcome')}
          className="btn-ghost -ml-2 text-sm font-medium"
        >
          <Icon name="ArrowLeft" className="h-4 w-4" />
          <span>Back to home</span>
        </button>
      </div>

      <div className="max-w-2xl border-b border-app-border pb-6">
        <h1 className="font-sans text-3xl sm:text-4xl font-semibold tracking-tight text-app-text">
          Accessibility &amp; Settings
        </h1>
        <p className="mt-2 text-sm sm:text-base leading-relaxed text-app-muted">
          Adjust text size, display contrast, motion, and speech voice to suit your needs.
          All settings are saved privately on this device.
        </p>
      </div>

      <div className="mt-8">
        <SettingsPanel resultsCount={resultsCount} onClearResults={onClearResults} />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3 pt-6 border-t border-app-border">
        <button
          type="button"
          onClick={() => onNavigate('communicate')}
          className="btn-primary"
        >
          <Icon name="MessageCircle" className="h-4 w-4" />
          <span>Go to communication</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('demo')}
          className="btn-secondary"
        >
          <Icon name="ClipboardList" className="h-4 w-4" />
          <span>Practice tasks</span>
        </button>
      </div>
    </div>
  );
}
