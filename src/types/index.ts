export type FlowId = 'basic-needs' | 'feelings' | 'activities' | 'urgent-help';

export type TextSize = 'small' | 'medium' | 'large';

/** A small tone hint used by the UI. Meaning is always also carried by text. */
export type ChoiceTone = 'default' | 'urgent' | 'calm';

export interface FlowOption {
  id: string;
  label: string;
  /** Name of a Lucide icon. Icons are decorative; the label is always shown. */
  icon: string;
  helper?: string;
  /** Value used to fill placeholders in a terminal message template. */
  value?: string;
  /** ID of the node reached when this option is chosen. */
  next: string;
  tone?: ChoiceTone;
}

export interface FlowNode {
  id: string;
  prompt: string;
  helper?: string;
  /** Slot name used for this question's selected value in message templates. */
  slot?: string;
  options: FlowOption[];
  /** Present on terminal nodes. May contain {slot} placeholders. */
  messageTemplate?: string;
  /** Optional alternative phrasings for a terminal message. */
  alternatives?: string[];
  /** Lets a user finish with their own typed message at this node. */
  allowCustom?: boolean;
  customPrompt?: string;
}

export interface CommunicationFlow {
  id: FlowId;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  rootNodeId: string;
  nodes: Record<string, FlowNode>;
  hidden?: boolean;
}

export type AppScreen =
  | 'welcome'
  | 'communicate'
  | 'review'
  | 'demo'
  | 'comparison'
  | 'settings';

export interface Selection {
  nodeId: string;
  optionId: string;
  label: string;
  value?: string;
  slot?: string;
  icon: string;
}

export interface CustomMessage {
  nodeId: string;
  text: string;
}

export interface FlowState {
  flowId: FlowId;
  nodeId: string;
  history: Selection[];
  custom: CustomMessage | null;
}

export interface ReachablePath {
  nodeIds: string[];
  optionIds: string[];
  terminalNodeId: string;
  viaCustom: boolean;
  messageTemplate: string;
}

export interface FlowValidationIssue {
  code:
    | 'missing-root'
    | 'missing-node'
    | 'missing-destination'
    | 'empty-question'
    | 'no-options'
    | 'no-message'
    | 'unreachable-node'
    | 'cycle';
  message: string;
  nodeId?: string;
  optionId?: string;
}

export interface Preferences {
  textSize: TextSize;
  highContrast: boolean;
  reducedMotion: boolean;
  speechRate: number;
  speechPitch: number;
  speechVolume: number;
  voiceURI: string | null;
}

export type DemoCondition = 'guided' | 'static';

export type AccuracyOutcome = 'exact' | 'equivalent' | 'incorrect' | 'uncompleted';

export interface DemoScenario {
  id: string;
  title: string;
  instruction: string;
  targetMessage: string;
  acceptedMessages: string[];
  categoryId: Exclude<FlowId, 'urgent-help'>;
  evaluatorHint?: string;
}

export interface StaticPhrase {
  id: string;
  category: string;
  text: string;
  icon: string;
}

export interface TrialResult {
  id: string;
  taskId: string;
  scenarioTitle: string;
  condition: DemoCondition;
  elapsedMs: number;
  selectionCount: number;
  backCount: number;
  completed: boolean;
  accuracy: AccuracyOutcome;
  expectedMessage: string;
  confirmedMessage: string;
  timestamp: string;
  notes: string;
  manuallyAdjusted?: boolean;
}

export interface ConditionMetrics {
  condition: DemoCondition;
  trials: number;
  completed: number;
  correct: number;
  meanElapsedMs: number | null;
  meanSelections: number | null;
  completionRate: number | null;
  accuracyRate: number | null;
}
