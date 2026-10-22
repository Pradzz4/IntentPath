import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AccuracyOutcome, TrialResult } from '../types';
import {
  STORAGE_KEYS,
  isStorageAvailable,
  readStoredJSON,
  removeStoredItem,
  writeStoredJSON,
} from '../utils/storage';

function isTrialResult(value: unknown): value is TrialResult {
  if (!value || typeof value !== 'object') return false;
  const trial = value as Partial<TrialResult>;
  return (
    typeof trial.id === 'string' &&
    typeof trial.taskId === 'string' &&
    typeof trial.scenarioTitle === 'string' &&
    (trial.condition === 'guided' || trial.condition === 'static') &&
    typeof trial.elapsedMs === 'number' &&
    typeof trial.selectionCount === 'number' &&
    typeof trial.completed === 'boolean' &&
    typeof trial.confirmedMessage === 'string' &&
    typeof trial.timestamp === 'string'
  );
}

function sanitizeResults(input: unknown): TrialResult[] {
  if (!Array.isArray(input)) return [];
  return input.filter(isTrialResult).slice(0, 500).map((trial) => ({
    ...trial,
    backCount: typeof trial.backCount === 'number' ? trial.backCount : 0,
    notes: typeof trial.notes === 'string' ? trial.notes : '',
    expectedMessage: typeof trial.expectedMessage === 'string' ? trial.expectedMessage : '',
    accuracy: (['exact', 'equivalent', 'incorrect', 'uncompleted'] as string[]).includes(
      trial.accuracy,
    )
      ? trial.accuracy
      : 'uncompleted',
    manuallyAdjusted: trial.manuallyAdjusted === true,
  }));
}

export function useDemoResults() {
  const [storageAvailable] = useState(() => isStorageAvailable());
  const [results, setResults] = useState<TrialResult[]>(() => {
    const stored = readStoredJSON<unknown>(STORAGE_KEYS.demoResults, []);
    return sanitizeResults(stored);
  });
  const [persistenceError, setPersistenceError] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const saved = writeStoredJSON(STORAGE_KEYS.demoResults, results);
    setPersistenceError(!saved);
  }, [results]);

  const addResult = useCallback((result: TrialResult) => {
    setResults((current) => [result, ...current].slice(0, 500));
  }, []);

  const updateResult = useCallback(
    (
      id: string,
      patch: Partial<Pick<TrialResult, 'accuracy' | 'notes' | 'manuallyAdjusted'>> & {
        accuracy?: AccuracyOutcome;
      },
    ) => {
      setResults((current) =>
        current.map((result) => (result.id === id ? { ...result, ...patch } : result)),
      );
    },
    [],
  );

  const clearResults = useCallback(() => {
    setResults([]);
    if (storageAvailable) removeStoredItem(STORAGE_KEYS.demoResults);
  }, [storageAvailable]);

  const counts = useMemo(
    () => ({
      total: results.length,
      guided: results.filter((result) => result.condition === 'guided').length,
      static: results.filter((result) => result.condition === 'static').length,
    }),
    [results],
  );

  return {
    results,
    addResult,
    updateResult,
    clearResults,
    storageAvailable,
    persistenceError,
    counts,
  };
}
