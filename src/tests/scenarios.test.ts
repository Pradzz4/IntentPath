import { describe, expect, it } from 'vitest';
import { demoScenarios } from '../data/demoScenarios';
import { flows } from '../data/communicationFlows';
import { createInitialState, selectOption, isTerminal } from '../engine/decisionTree';
import { buildMessage } from '../engine/messageBuilder';
import { evaluateMessage } from '../engine/evaluation';
import { staticBoardPhrases } from '../data/staticBoardData';

describe('Demo Scenarios Walkthrough in Guided Flow', () => {
  it('T01: Request water', () => {
    const flow = flows['basic-needs'];
    let state = createInitialState(flow);
    state = selectOption(flow, state, 'drink');
    state = selectOption(flow, state, 'water');
    expect(isTerminal(flow, state)).toBe(true);
    const msg = buildMessage(flow, state);
    expect(msg).toBe('I would like some water, please.');
    expect(evaluateMessage(msg, demoScenarios[0].targetMessage, demoScenarios[0].acceptedMessages)).toBe('exact');
  });

  it('T02: Request rice', () => {
    const flow = flows['basic-needs'];
    let state = createInitialState(flow);
    state = selectOption(flow, state, 'food');
    state = selectOption(flow, state, 'rice');
    expect(isTerminal(flow, state)).toBe(true);
    const msg = buildMessage(flow, state);
    expect(msg).toBe('I would like some rice, please.');
    expect(evaluateMessage(msg, demoScenarios[1].targetMessage, demoScenarios[1].acceptedMessages)).toBe('exact');
  });

  it('T03: Ask for help opening a jar', () => {
    const flow = flows['basic-needs'];
    let state = createInitialState(flow);
    state = selectOption(flow, state, 'help');
    state = selectOption(flow, state, 'open');
    state = selectOption(flow, state, 'jar');
    expect(isTerminal(flow, state)).toBe(true);
    const msg = buildMessage(flow, state);
    expect(msg).toBe('Please help me open this jar.');
    expect(evaluateMessage(msg, demoScenarios[2].targetMessage, demoScenarios[2].acceptedMessages)).toBe('exact');
  });

  it('T04: Describe moderate head pain', () => {
    const flow = flows['feelings'];
    let state = createInitialState(flow);
    state = selectOption(flow, state, 'pain');
    state = selectOption(flow, state, 'head');
    state = selectOption(flow, state, 'moderate');
    expect(isTerminal(flow, state)).toBe(true);
    const msg = buildMessage(flow, state);
    expect(msg).toBe('I have pain in my head. The pain is moderate.');
    expect(evaluateMessage(msg, demoScenarios[3].targetMessage, demoScenarios[3].acceptedMessages)).toBe('exact');
  });

  it('T05: Share worry and ask to talk', () => {
    const flow = flows['feelings'];
    let state = createInitialState(flow);
    state = selectOption(flow, state, 'worried');
    state = selectOption(flow, state, 'talk');
    expect(isTerminal(flow, state)).toBe(true);
    const msg = buildMessage(flow, state);
    expect(msg).toBe('I feel worried and would like to talk to someone.');
    expect(evaluateMessage(msg, demoScenarios[4].targetMessage, demoScenarios[4].acceptedMessages)).toBe('exact');
  });

  it('T06: Go outside', () => {
    const flow = flows['activities'];
    let state = createInitialState(flow);
    state = selectOption(flow, state, 'go');
    state = selectOption(flow, state, 'outside');
    expect(isTerminal(flow, state)).toBe(true);
    const msg = buildMessage(flow, state);
    expect(msg).toBe('I would like to go outside.');
    expect(evaluateMessage(msg, demoScenarios[5].targetMessage, demoScenarios[5].acceptedMessages)).toBe('exact');
  });

  it('T07: Talk to family by phone', () => {
    const flow = flows['activities'];
    let state = createInitialState(flow);
    state = selectOption(flow, state, 'talk');
    state = selectOption(flow, state, 'family');
    state = selectOption(flow, state, 'phone');
    expect(isTerminal(flow, state)).toBe(true);
    const msg = buildMessage(flow, state);
    expect(msg).toBe('I want to talk to my family by phone.');
    expect(evaluateMessage(msg, demoScenarios[6].targetMessage, demoScenarios[6].acceptedMessages)).toBe('exact');
  });

  it('T08: Rest for a while', () => {
    const flow = flows['activities'];
    let state = createInitialState(flow);
    state = selectOption(flow, state, 'rest');
    state = selectOption(flow, state, 'while');
    expect(isTerminal(flow, state)).toBe(true);
    const msg = buildMessage(flow, state);
    expect(msg).toBe('I would like to rest for a while.');
    expect(evaluateMessage(msg, demoScenarios[7].targetMessage, demoScenarios[7].acceptedMessages)).toBe('exact');
  });

  it('all 8 target messages exist verbatim on the static board as equivalent comparison', () => {
    for (const scenario of demoScenarios) {
      const match = staticBoardPhrases.find(
        (p) => evaluateMessage(p.text, scenario.targetMessage, scenario.acceptedMessages) === 'exact',
      );
      expect(match).toBeDefined();
    }
  });
});
