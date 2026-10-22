import type { DemoScenario } from '../types';

/**
 * Eight simulated tasks. Target messages intentionally exist verbatim on the
 * static board so both conditions can reach the same expected sentence.
 * Accepted equivalents are explicit, human-defined strings — never inferred.
 */
export const demoScenarios: DemoScenario[] = [
  {
    id: 'T01',
    title: 'Request water',
    instruction: 'Ask for a glass of water.',
    targetMessage: 'I would like some water, please.',
    acceptedMessages: [
      'Could I have some water, please?',
      'I would like a drink of water.',
    ],
    categoryId: 'basic-needs',
    evaluatorHint: 'Basic Needs → Something to drink → Water',
  },
  {
    id: 'T02',
    title: 'Request rice',
    instruction: 'Ask for some rice to eat.',
    targetMessage: 'I would like some rice, please.',
    acceptedMessages: ['Could I have some rice, please?', 'I would like to eat some rice.'],
    categoryId: 'basic-needs',
    evaluatorHint: 'Basic Needs → Something to eat → Rice',
  },
  {
    id: 'T03',
    title: 'Ask for help opening a jar',
    instruction: 'Ask someone to help you open a jar.',
    targetMessage: 'Please help me open this jar.',
    acceptedMessages: ['Could you help me open this jar, please?'],
    categoryId: 'basic-needs',
    evaluatorHint: 'Basic Needs → Help with something → Opening something → This jar',
  },
  {
    id: 'T04',
    title: 'Describe moderate head pain',
    instruction: 'Say that you have pain in your head and that the pain is moderate.',
    targetMessage: 'I have pain in my head. The pain is moderate.',
    acceptedMessages: ['I have moderate pain in my head.'],
    categoryId: 'feelings',
    evaluatorHint: 'Feelings → I am in pain → My head → Moderate',
  },
  {
    id: 'T05',
    title: 'Share worry and ask to talk',
    instruction: 'Say that you feel worried and would like to talk to someone.',
    targetMessage: 'I feel worried and would like to talk to someone.',
    acceptedMessages: ['I feel worried. I want to talk to someone.'],
    categoryId: 'feelings',
    evaluatorHint: 'Feelings → I feel worried → I want to talk to someone.',
  },
  {
    id: 'T06',
    title: 'Go outside',
    instruction: 'Say that you would like to go outside.',
    targetMessage: 'I would like to go outside.',
    acceptedMessages: ['Could I go outside?', 'I want to go outside.'],
    categoryId: 'activities',
    evaluatorHint: 'Activities → Go somewhere → Outside',
  },
  {
    id: 'T07',
    title: 'Talk to family by phone',
    instruction: 'Say that you want to talk to your family by phone.',
    targetMessage: 'I want to talk to my family by phone.',
    acceptedMessages: ['I would like to talk to my family by phone.'],
    categoryId: 'activities',
    evaluatorHint: 'Activities → Talk to someone → My family → By phone',
  },
  {
    id: 'T08',
    title: 'Rest for a while',
    instruction: 'Say that you would like to rest for a while.',
    targetMessage: 'I would like to rest for a while.',
    acceptedMessages: ['I want to rest for a while.', 'Could I rest for a while?'],
    categoryId: 'activities',
    evaluatorHint: 'Activities → Rest → Rest for a while',
  },
];

export function getScenarioById(id: string): DemoScenario | undefined {
  return demoScenarios.find((scenario) => scenario.id === id);
}

export const DEMO_DISCLAIMER =
  'This is a simulated evaluation harness for a prototype. It has not been clinically validated, and simulated results do not establish effectiveness or accessibility for people with aphasia. Report the number of tasks and participants when interpreting any results.';
