import { useId, useState } from 'react';
import type { TextSize } from '../types';
import { usePreferences } from '../hooks/usePreferences';
import { useSpeech } from '../hooks/useSpeech';
import { ConfirmAction } from './ConfirmAction';
import { Icon } from './Icon';

const TEXT_SIZE_OPTIONS: Array<{ value: TextSize; label: string; sample: string }> = [
  { value: 'small', label: 'Small', sample: 'text-base' },
  { value: 'medium', label: 'Medium', sample: 'text-lg' },
  { value: 'large', label: 'Large', sample: 'text-2xl' },
];

const VOICE_PREVIEW_TEXT = 'This is how your message will sound.';

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon: string;
}

function ToggleRow({ label, description, checked, onChange, icon }: ToggleRowProps) {
  const descriptionId = useId();
  return (
    <div className="flex items-start gap-3.5 py-4 first:pt-0 last:pb-0">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-app-bgSubtle text-app-accentInk">
        <Icon name={icon} className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-app-text">{label}</p>
        <p id={descriptionId} className="mt-0.5 text-xs sm:text-sm leading-relaxed text-app-muted">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        aria-describedby={descriptionId}
        onClick={() => onChange(!checked)}
        className={`relative mt-1 inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors ${
          checked
            ? 'border-app-accent bg-app-accent'
            : 'border-app-borderStrong bg-app-surfaceSoft'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-app-surface shadow-subtle transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
        <span className="sr-only">{checked ? 'On' : 'Off'}</span>
      </button>
    </div>
  );
}

interface SettingsPanelProps {
  resultsCount: number;
  onClearResults: () => void;
}

export function SettingsPanel({ resultsCount, onClearResults }: SettingsPanelProps) {
  const {
    preferences,
    updatePreferences,
    resetPreferences,
    storageAvailable,
    persistenceError,
  } = usePreferences();
  const preview = useSpeech();
  const [notice, setNotice] = useState('');

  const sizeGroupName = useId();
  const rateId = useId();
  const pitchId = useId();
  const volumeId = useId();
  const voiceId = useId();
  const voiceHelpId = useId();

  const savedVoiceAvailable =
    preferences.voiceURI === null ||
    preview.voices.some((voice) => voice.voiceURI === preferences.voiceURI);

  return (
    <div className="space-y-6">
      {/* Appearance */}
      <section className="rounded-xl border border-app-border bg-app-surface p-5 sm:p-6 shadow-card" aria-labelledby="appearance-heading">
        <div className="mb-5 flex items-center gap-3 border-b border-app-border pb-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-app-bgSubtle text-app-accentInk">
            <Icon name="Eye" className="h-5 w-5" />
          </span>
          <div>
            <h2 id="appearance-heading" className="text-lg font-semibold text-app-text">
              Appearance
            </h2>
            <p className="text-xs sm:text-sm text-app-muted">Adjust text sizing and contrast for maximum clarity.</p>
          </div>
        </div>

        <fieldset>
          <legend className="field-label mb-2 text-sm font-medium">Text size</legend>
          <div className="grid grid-cols-3 gap-2.5">
            {TEXT_SIZE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`cursor-pointer rounded-lg border p-3 text-center transition-colors ${
                  preferences.textSize === option.value
                    ? 'border-app-accent bg-app-accentSoft ring-1 ring-app-accent'
                    : 'border-app-border bg-app-surface hover:border-app-borderStrong hover:bg-app-surfaceSoft'
                }`}
              >
                <input
                  type="radio"
                  name={sizeGroupName}
                  value={option.value}
                  checked={preferences.textSize === option.value}
                  onChange={() => updatePreferences({ textSize: option.value })}
                  className="peer sr-only"
                />
                <span
                  className={`block font-semibold leading-tight text-app-text ${option.sample} peer-focus-visible:outline peer-focus-visible:outline-[2px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-app-focus`}
                >
                  Aa
                </span>
                <span className="mt-1 block text-xs font-medium text-app-muted">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 divide-y divide-app-border border-t border-app-border pt-1">
          <ToggleRow
            label="High-contrast mode"
            description="Uses a dark background, bright text and higher-contrast borders."
            checked={preferences.highContrast}
            onChange={(highContrast) => updatePreferences({ highContrast })}
            icon="Contrast"
          />
          <ToggleRow
            label="Reduce motion"
            description="Turns off transitions and animations. System preferences are also respected."
            checked={preferences.reducedMotion}
            onChange={(reducedMotion) => updatePreferences({ reducedMotion })}
            icon="Waves"
          />
        </div>
      </section>

      {/* Speech */}
      <section className="rounded-xl border border-app-border bg-app-surface p-5 sm:p-6 shadow-card" aria-labelledby="speech-heading">
        <div className="mb-5 flex items-center gap-3 border-b border-app-border pb-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-app-bgSubtle text-app-accentInk">
            <Icon name="Volume2" className="h-5 w-5" />
          </span>
          <div>
            <h2 id="speech-heading" className="text-lg font-semibold text-app-text">
              Speech Voice &amp; Speed
            </h2>
            <p className="text-xs sm:text-sm text-app-muted">
              Configure playback when you press Speak on a message.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor={rateId} className="field-label">
                Speaking rate
              </label>
              <output htmlFor={rateId} className="text-sm font-semibold text-app-accentInk">
                {preferences.speechRate.toFixed(2)}×
              </output>
            </div>
            <input
              id={rateId}
              type="range"
              min={0.5}
              max={1.5}
              step={0.05}
              value={preferences.speechRate}
              onChange={(event) => updatePreferences({ speechRate: Number(event.target.value) })}
              className="mt-2 h-2 w-full cursor-pointer accent-app-accent"
              aria-valuetext={`${preferences.speechRate.toFixed(2)} times normal speed`}
            />
            <p className="mt-1 text-xs text-app-muted">Slower speeds are often easier to process.</p>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor={pitchId} className="field-label">
                Voice pitch
              </label>
              <output htmlFor={pitchId} className="text-sm font-semibold text-app-accentInk">
                {preferences.speechPitch.toFixed(2)}
              </output>
            </div>
            <input
              id={pitchId}
              type="range"
              min={0.5}
              max={1.8}
              step={0.05}
              value={preferences.speechPitch}
              onChange={(event) => updatePreferences({ speechPitch: Number(event.target.value) })}
              className="mt-2 h-2 w-full cursor-pointer accent-app-accent"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor={volumeId} className="field-label">
                Volume
              </label>
              <output htmlFor={volumeId} className="text-sm font-semibold text-app-accentInk">
                {Math.round(preferences.speechVolume * 100)}%
              </output>
            </div>
            <input
              id={volumeId}
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={preferences.speechVolume}
              onChange={(event) => updatePreferences({ speechVolume: Number(event.target.value) })}
              className="mt-2 h-2 w-full cursor-pointer accent-app-accent"
            />
          </div>

          <div>
            <label htmlFor={voiceId} className="field-label">
              Voice selection
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <select
                id={voiceId}
                value={savedVoiceAvailable ? (preferences.voiceURI ?? '') : ''}
                onChange={(event) =>
                  updatePreferences({ voiceURI: event.target.value || null })
                }
                aria-describedby={voiceHelpId}
                className="select-field flex-1"
              >
                <option value="">Browser default voice</option>
                {preview.voices.map((voice) => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={preview.refreshVoices}
                className="btn-secondary whitespace-nowrap"
              >
                <Icon name="RefreshCcw" className="h-4 w-4" />
                Refresh voices
              </button>
            </div>
            <p id={voiceHelpId} className="mt-1.5 text-xs leading-relaxed text-app-muted">
              {preview.supported
                ? preview.voices.length > 0
                  ? 'Voices are provided by your operating system and web browser.'
                  : 'Voices list will update once browser audio permissions initialize.'
                : 'Speech synthesis is not supported on this browser.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() =>
                preview.speaking ? preview.stop() : preview.speak(VOICE_PREVIEW_TEXT)
              }
              disabled={!preview.supported}
              className="btn-secondary"
            >
              <Icon name={preview.speaking ? 'Square' : 'Play'} className="h-4 w-4" />
              {preview.speaking ? 'Stop preview' : 'Test speech voice'}
            </button>
            <span className="text-xs text-app-muted font-serif italic">“{VOICE_PREVIEW_TEXT}”</span>
          </div>

          {preview.error && (
            <p role="alert" className="rounded-lg bg-app-dangerSoft p-3 text-sm text-app-danger">
              {preview.error}
            </p>
          )}
        </div>
      </section>

      {/* Data and privacy */}
      <section className="rounded-xl border border-app-border bg-app-surface p-5 sm:p-6 shadow-card" aria-labelledby="data-heading">
        <div className="mb-4 flex items-center gap-3 border-b border-app-border pb-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-app-bgSubtle text-app-accentInk">
            <Icon name="ShieldCheck" className="h-5 w-5" />
          </span>
          <div>
            <h2 id="data-heading" className="text-lg font-semibold text-app-text">
              Local Storage &amp; Privacy
            </h2>
            <p className="text-xs sm:text-sm text-app-muted">
              All data stays entirely inside your browser. No server, accounts, or trackers.
            </p>
          </div>
        </div>

        <div
          className={`flex items-start gap-2.5 rounded-lg p-3.5 text-sm leading-relaxed ${
            storageAvailable
              ? 'bg-app-surfaceSoft text-app-muted border border-app-border'
              : 'bg-app-warmSoft text-app-warm border border-app-warm'
          }`}
        >
          <Icon
            name={storageAvailable ? 'ShieldCheck' : 'AlertTriangle'}
            className="mt-0.5 h-4 w-4 shrink-0 text-app-accent"
          />
          <p>
            {storageAvailable
              ? 'Preferences and demo results are saved locally in your browser storage. Your messages are never sent over the internet.'
              : 'Local storage is unavailable in this environment. The app functions for this session, but settings will not persist.'}
            {persistenceError &&
              ' Note: Storage may be full or blocked in this browser.'}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-app-muted font-medium">
            {resultsCount} evaluation {resultsCount === 1 ? 'trial' : 'trials'} stored locally
          </span>
          <ConfirmAction
            label="Clear demo results"
            confirmLabel="Delete all trials"
            description="Erase all recorded evaluation trials?"
            onConfirm={onClearResults}
            icon="Trash2"
            variant="danger"
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-app-border pt-4">
          <ConfirmAction
            label="Reset preferences"
            confirmLabel="Reset to defaults"
            description="Reset appearance and speech settings to defaults?"
            onConfirm={() => {
              resetPreferences();
              setNotice('Preferences reset to defaults.');
            }}
            icon="RotateCcw"
            variant="secondary"
          />
        </div>

        <p className="sr-only" role="status" aria-live="polite">
          {notice}
        </p>
      </section>
    </div>
  );
}
