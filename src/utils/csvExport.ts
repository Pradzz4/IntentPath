import type { TrialResult } from '../types';
import { formatAccuracy, formatCondition } from '../engine/evaluation';

const HEADERS = [
  'Trial ID',
  'Task ID',
  'Scenario',
  'Condition',
  'Elapsed (ms)',
  'Elapsed (s)',
  'Selections',
  'Back operations',
  'Completed',
  'Accuracy outcome',
  'Expected message',
  'Confirmed message',
  'Evaluator notes',
  'Manually adjusted',
  'Timestamp (ISO)',
];

function escapeCell(value: string | number | boolean): string {
  const text = String(value);
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function resultsToCsv(results: TrialResult[]): string {
  const rows = results.map((result) => [
    result.id,
    result.taskId,
    result.scenarioTitle,
    formatCondition(result.condition),
    Math.round(result.elapsedMs),
    (result.elapsedMs / 1000).toFixed(2),
    result.selectionCount,
    result.backCount,
    result.completed ? 'Yes' : 'No',
    formatAccuracy(result.accuracy),
    result.expectedMessage,
    result.confirmedMessage,
    result.notes,
    result.manuallyAdjusted ? 'Yes' : 'No',
    result.timestamp,
  ]);

  return `\uFEFF${[HEADERS, ...rows]
    .map((row) => row.map((cell) => escapeCell(cell)).join(','))
    .join('\r\n')}`;
}

export function downloadCsv(filename: string, csv: string): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  try {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    return false;
  }
}

export function comparisonFilename(): string {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  return `intentpath-results-${stamp}.csv`;
}
