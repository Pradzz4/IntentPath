import type { AccuracyOutcome, TrialResult } from '../types';

/**
 * Comparison is deterministic: messages are normalized for case, punctuation
 * and whitespace, then compared with the expected message or an explicitly
 * listed accepted equivalent. No semantic model is used.
 */
export function normalizeMessage(message: string): string {
  return message
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^\p{L}\p{N}\s']/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function evaluateMessage(
  confirmedMessage: string,
  expectedMessage: string,
  acceptedMessages: string[] = [],
): Exclude<AccuracyOutcome, 'manual'> {
  const confirmed = normalizeMessage(confirmedMessage);
  if (!confirmed) return 'uncompleted';
  const expected = normalizeMessage(expectedMessage);
  if (confirmed === expected) return 'exact';
  if (acceptedMessages.some((candidate) => normalizeMessage(candidate) === confirmed)) {
    return 'equivalent';
  }
  return 'incorrect';
}

export function isCorrect(accuracy: AccuracyOutcome): boolean {
  return accuracy === 'exact' || accuracy === 'equivalent';
}

export function formatAccuracy(accuracy: AccuracyOutcome): string {
  switch (accuracy) {
    case 'exact':
      return 'Exact match';
    case 'equivalent':
      return 'Accepted equivalent';
    case 'incorrect':
      return 'Incorrect';
    case 'uncompleted':
      return 'Not completed';
    default:
      return accuracy;
  }
}

export function formatCondition(condition: TrialResult['condition']): string {
  return condition === 'guided' ? 'IntentPath guided' : 'Static board';
}

export function createTrialId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `trial-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
