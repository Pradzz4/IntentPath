import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Preferences, TextSize } from '../types';
import {
  STORAGE_KEYS,
  isStorageAvailable,
  readStoredJSON,
  removeStoredItem,
  writeStoredJSON,
} from '../utils/storage';

const TEXT_SIZES: TextSize[] = ['small', 'medium', 'large'];

function systemPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function defaultPreferences(): Preferences {
  return {
    textSize: 'medium',
    highContrast: false,
    reducedMotion: systemPrefersReducedMotion(),
    speechRate: 0.95,
    speechPitch: 1,
    speechVolume: 1,
    voiceURI: null,
  };
}

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

export function sanitizePreferences(input: unknown): Preferences {
  const fallback = defaultPreferences();
  if (!input || typeof input !== 'object') return fallback;
  const raw = input as Partial<Preferences>;
  return {
    textSize: TEXT_SIZES.includes(raw.textSize as TextSize)
      ? (raw.textSize as TextSize)
      : fallback.textSize,
    highContrast: typeof raw.highContrast === 'boolean' ? raw.highContrast : fallback.highContrast,
    reducedMotion:
      typeof raw.reducedMotion === 'boolean' ? raw.reducedMotion : fallback.reducedMotion,
    speechRate: clamp(raw.speechRate, 0.5, 1.5, fallback.speechRate),
    speechPitch: clamp(raw.speechPitch, 0.5, 1.8, fallback.speechPitch),
    speechVolume: clamp(raw.speechVolume, 0, 1, fallback.speechVolume),
    voiceURI: typeof raw.voiceURI === 'string' && raw.voiceURI ? raw.voiceURI : null,
  };
}

interface PreferencesContextValue {
  preferences: Preferences;
  updatePreferences: (patch: Partial<Preferences>) => void;
  resetPreferences: () => void;
  storageAvailable: boolean;
  persistenceError: boolean;
  clearPersistenceError: () => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [storageAvailable] = useState<boolean>(() => isStorageAvailable());
  const [preferences, setPreferences] = useState<Preferences>(() => {
    const stored = readStoredJSON<unknown>(STORAGE_KEYS.preferences, null);
    return stored === null ? defaultPreferences() : sanitizePreferences(stored);
  });
  const [persistenceError, setPersistenceError] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.textSize = preferences.textSize;
    root.dataset.theme = preferences.highContrast ? 'high-contrast' : 'default';
    root.dataset.reducedMotion = preferences.reducedMotion ? 'true' : 'false';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', preferences.highContrast ? '#06121a' : '#f4f7f7');
    }
  }, [preferences]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const saved = writeStoredJSON(STORAGE_KEYS.preferences, preferences);
    setPersistenceError(!saved);
  }, [preferences]);

  const updatePreferences = useCallback((patch: Partial<Preferences>) => {
    setPreferences((current) => sanitizePreferences({ ...current, ...patch }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences());
    if (storageAvailable) {
      removeStoredItem(STORAGE_KEYS.preferences);
    }
  }, [storageAvailable]);

  const clearPersistenceError = useCallback(() => setPersistenceError(false), []);

  const value = useMemo<PreferencesContextValue>(
    () => ({
      preferences,
      updatePreferences,
      resetPreferences,
      storageAvailable,
      persistenceError,
      clearPersistenceError,
    }),
    [
      preferences,
      updatePreferences,
      resetPreferences,
      storageAvailable,
      persistenceError,
      clearPersistenceError,
    ],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used inside a PreferencesProvider.');
  }
  return context;
}
