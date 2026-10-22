import type { ConditionMetrics, DemoCondition, TrialResult } from '../types';
import { isCorrect } from '../engine/evaluation';

/**
 * Metric definitions (kept identical across conditions):
 * - Mean completion time / selections: completed trials only.
 * - Completion rate: completed trials / all recorded trials.
 * - Message accuracy: exact or accepted-equivalent trials / all recorded trials.
 * Uncompleted trials count against both rates.
 */
export function computeConditionMetrics(
  results: TrialResult[],
  condition: DemoCondition,
): ConditionMetrics {
  const trials = results.filter((result) => result.condition === condition);
  const completedTrials = trials.filter((result) => result.completed);
  const correct = trials.filter((result) => isCorrect(result.accuracy)).length;

  const mean = (values: number[]): number | null => {
    if (values.length === 0) return null;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  };

  return {
    condition,
    trials: trials.length,
    completed: completedTrials.length,
    correct,
    meanElapsedMs: mean(completedTrials.map((result) => result.elapsedMs)),
    meanSelections: mean(completedTrials.map((result) => result.selectionCount)),
    completionRate: trials.length > 0 ? completedTrials.length / trials.length : null,
    accuracyRate: trials.length > 0 ? correct / trials.length : null,
  };
}

export function formatDuration(ms: number | null): string {
  if (ms === null || !Number.isFinite(ms)) return '—';
  if (ms < 1000) return `${Math.round(ms)} ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)} s`;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds - minutes * 60;
  return `${minutes}m ${remaining.toFixed(0)}s`;
}

export function formatStopwatch(ms: number): string {
  const safe = Math.max(0, ms);
  const totalSeconds = Math.floor(safe / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((safe % 1000) / 100);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths}`;
}

export function formatPercent(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '—';
  return `${Math.round(value * 100)}%`;
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function resultCounts(results: TrialResult[]) {
  return {
    total: results.length,
    guided: results.filter((result) => result.condition === 'guided').length,
    static: results.filter((result) => result.condition === 'static').length,
  };
}
