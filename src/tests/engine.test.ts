import { describe, expect, it } from 'vitest';
import {
  createInitialState,
  selectOption,
  goBack,
  rewindTo,
  restartFlow,
  isTerminal,
  canGoBack,
  submitCustomMessage,
} from '../engine/decisionTree';
import { buildMessage, buildAlternatives } from '../engine/messageBuilder';
import { evaluateMessage, normalizeMessage } from '../engine/evaluation';
import { computeConditionMetrics, formatDuration, formatPercent } from '../utils/metrics';
import { resultsToCsv } from '../utils/csvExport';
import { sanitizePreferences } from '../hooks/usePreferences';
import { flows } from '../data/communicationFlows';
import type { TrialResult } from '../types';

describe('Decision Tree & Message Builder', () => {
  const basicNeeds = flows['basic-needs'];

  it('progresses from root -> drink -> water -> terminal message', () => {
    let state = createInitialState(basicNeeds);
    expect(state.nodeId).toBe('bn-root');
    expect(canGoBack(state)).toBe(false);
    expect(isTerminal(basicNeeds, state)).toBe(false);

    // Select "Something to drink"
    state = selectOption(basicNeeds, state, 'drink');
    expect(state.nodeId).toBe('bn-drink');
    expect(canGoBack(state)).toBe(true);

    // Select "Water"
    state = selectOption(basicNeeds, state, 'water');
    expect(state.nodeId).toBe('bn-drink-end');
    expect(isTerminal(basicNeeds, state)).toBe(true);

    const message = buildMessage(basicNeeds, state);
    expect(message).toBe('I would like some water, please.');

    const alternatives = buildAlternatives(basicNeeds, state);
    expect(alternatives.length).toBeGreaterThan(0);
    expect(alternatives).toContain('Could I have some water, please?');
  });

  it('allows going back one step', () => {
    let state = createInitialState(basicNeeds);
    state = selectOption(basicNeeds, state, 'drink');
    state = selectOption(basicNeeds, state, 'water');
    expect(state.nodeId).toBe('bn-drink-end');

    state = goBack(basicNeeds, state);
    expect(state.nodeId).toBe('bn-drink');
    expect(state.history.length).toBe(1);

    // Can change selection to tea
    state = selectOption(basicNeeds, state, 'tea');
    expect(state.nodeId).toBe('bn-drink-end');
    expect(buildMessage(basicNeeds, state)).toBe('I would like some tea, please.');
  });

  it('supports rewind to a previous index', () => {
    let state = createInitialState(basicNeeds);
    state = selectOption(basicNeeds, state, 'help');
    state = selectOption(basicNeeds, state, 'open');
    state = selectOption(basicNeeds, state, 'jar');
    expect(state.history.length).toBe(3);

    state = rewindTo(state, 1);
    expect(state.history.length).toBe(1);
    expect(state.nodeId).toBe('bn-help');
  });

  it('supports restart', () => {
    let state = createInitialState(basicNeeds);
    state = selectOption(basicNeeds, state, 'drink');
    state = selectOption(basicNeeds, state, 'water');
    state = restartFlow(basicNeeds, state);
    expect(state.nodeId).toBe('bn-root');
    expect(state.history.length).toBe(0);
    expect(canGoBack(state)).toBe(false);
  });

  it('supports custom message entry', () => {
    let state = createInitialState(basicNeeds);
    state = selectOption(basicNeeds, state, 'else');
    state = submitCustomMessage(basicNeeds, state, 'I need my walking stick.');
    expect(isTerminal(basicNeeds, state)).toBe(true);
    expect(buildMessage(basicNeeds, state)).toBe('I need my walking stick.');
  });
});

describe('Evaluation & Accuracy', () => {
  it('normalizes strings properly', () => {
    expect(normalizeMessage('  Hello, World!  ')).toBe('hello world');
    expect(normalizeMessage("I'd like some water.")).toBe("i'd like some water");
  });

  it('classifies exact matches', () => {
    expect(
      evaluateMessage(
        'I would like some water, please.',
        'I would like some water, please.',
        ['Could I have some water, please?'],
      ),
    ).toBe('exact');
  });

  it('classifies equivalent matches', () => {
    expect(
      evaluateMessage(
        'Could I have some water, please?',
        'I would like some water, please.',
        ['Could I have some water, please?'],
      ),
    ).toBe('equivalent');
  });

  it('classifies incorrect matches', () => {
    expect(
      evaluateMessage(
        'I would like some tea, please.',
        'I would like some water, please.',
        ['Could I have some water, please?'],
      ),
    ).toBe('incorrect');
  });

  it('classifies empty confirmed message as uncompleted', () => {
    expect(
      evaluateMessage(
        '',
        'I would like some water, please.',
        ['Could I have some water, please?'],
      ),
    ).toBe('uncompleted');
  });
});

describe('Metrics and CSV Export', () => {
  const sampleResults: TrialResult[] = [
    {
      id: 'trial-1',
      taskId: 'T01',
      scenarioTitle: 'Request water',
      condition: 'guided',
      elapsedMs: 6000,
      selectionCount: 3,
      backCount: 0,
      completed: true,
      accuracy: 'exact',
      expectedMessage: 'I would like some water, please.',
      confirmedMessage: 'I would like some water, please.',
      timestamp: '2026-10-22T12:00:00.000Z',
      notes: '',
    },
    {
      id: 'trial-2',
      taskId: 'T01',
      scenarioTitle: 'Request water',
      condition: 'static',
      elapsedMs: 12000,
      selectionCount: 1,
      backCount: 0,
      completed: true,
      accuracy: 'exact',
      expectedMessage: 'I would like some water, please.',
      confirmedMessage: 'I would like some water, please.',
      timestamp: '2026-10-22T12:05:00.000Z',
      notes: '',
    },
  ];

  it('computes condition metrics correctly', () => {
    const guidedMetrics = computeConditionMetrics(sampleResults, 'guided');
    expect(guidedMetrics.trials).toBe(1);
    expect(guidedMetrics.completed).toBe(1);
    expect(guidedMetrics.correct).toBe(1);
    expect(guidedMetrics.meanElapsedMs).toBe(6000);
    expect(guidedMetrics.completionRate).toBe(1);
    expect(guidedMetrics.accuracyRate).toBe(1);

    const staticMetrics = computeConditionMetrics(sampleResults, 'static');
    expect(staticMetrics.trials).toBe(1);
    expect(staticMetrics.meanElapsedMs).toBe(12000);
  });

  it('formats duration and percentages cleanly', () => {
    expect(formatDuration(500)).toBe('500 ms');
    expect(formatDuration(4500)).toBe('4.5 s');
    expect(formatDuration(65000)).toBe('1m 5s');
    expect(formatPercent(0.85)).toBe('85%');
    expect(formatPercent(null)).toBe('—');
  });

  it('generates valid CSV format with UTF-8 BOM', () => {
    const csv = resultsToCsv(sampleResults);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('Trial ID,Task ID,Scenario,Condition');
    expect(csv).toContain('trial-1,T01,Request water,IntentPath guided');
  });
});

describe('Preferences Sanitize & Persistence', () => {
  it('sanitizes partial or corrupted preferences', () => {
    const sanitized = sanitizePreferences({
      textSize: 'invalid-size' as any,
      speechRate: 999, // out of range
      highContrast: true,
    });
    expect(sanitized.textSize).toBe('medium');
    expect(sanitized.speechRate).toBe(1.5); // clamped
    expect(sanitized.highContrast).toBe(true);
  });
});

describe('Static Board Data & Category Integrity', () => {
  it('has non-empty phrases for every category', async () => {
    const { staticBoardCategories, staticBoardPhrases } = await import('../data/staticBoardData');
    expect(staticBoardCategories.length).toBeGreaterThan(0);
    expect(staticBoardPhrases.length).toBeGreaterThan(0);

    for (const cat of staticBoardCategories) {
      const phrasesInCat = staticBoardPhrases.filter((p) => p.category === cat.id);
      expect(phrasesInCat.length).toBeGreaterThan(0);
    }

    for (const phrase of staticBoardPhrases) {
      expect(phrase.id).toBeTruthy();
      expect(phrase.text.trim().length).toBeGreaterThan(0);
      expect(phrase.icon).toBeTruthy();
    }
  });
});

describe('Navigation Edge Cases & Errors', () => {
  const basicNeeds = flows['basic-needs'];

  it('throws FlowNavigationError on nonexistent option', () => {
    const state = createInitialState(basicNeeds);
    expect(() => selectOption(basicNeeds, state, 'nonexistent-option')).toThrow();
  });

  it('throws FlowNavigationError on empty custom message', () => {
    let state = createInitialState(basicNeeds);
    state = selectOption(basicNeeds, state, 'else');
    expect(() => submitCustomMessage(basicNeeds, state, '   ')).toThrow('Please type a message first.');
  });

  it('throws FlowNavigationError on excessively long custom message', () => {
    let state = createInitialState(basicNeeds);
    state = selectOption(basicNeeds, state, 'else');
    const longText = 'a'.repeat(305);
    expect(() => submitCustomMessage(basicNeeds, state, longText)).toThrow('Please keep the message under 300 characters.');
  });
});

