import type { CommunicationFlow, FlowState } from '../types';
import { getNode, isTerminal } from './decisionTree';

/**
 * Deterministic message construction from the actual selections on the path.
 * Templates are interpolated only with values the person selected; no content
 * is generated or inferred.
 */
export function interpolateTemplate(
  template: string,
  state: FlowState,
): string {
  const slots = new Map<string, string>();
  for (const selection of state.history) {
    if (!selection.slot) continue;
    slots.set(selection.slot, selection.value ?? selection.label);
  }

  const filled = template.replace(/\{([a-zA-Z0-9_-]+)\}/g, (_match, slot: string) => {
    return slots.get(slot) ?? '';
  });

  return filled
    .replace(/\s+([.,!?;:])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function buildMessage(flow: CommunicationFlow, state: FlowState): string {
  if (state.custom) return state.custom.text.trim();
  const node = getNode(flow, state.nodeId);
  if (!node.messageTemplate) return '';
  return interpolateTemplate(node.messageTemplate, state);
}

export function buildAlternatives(flow: CommunicationFlow, state: FlowState): string[] {
  if (state.custom) return [];
  const node = getNode(flow, state.nodeId);
  if (!Array.isArray(node.alternatives)) return [];
  const current = buildMessage(flow, state);
  const seen = new Set<string>([current]);
  const alternatives: string[] = [];
  for (const template of node.alternatives) {
    const message = interpolateTemplate(template, state);
    if (message && !seen.has(message)) {
      seen.add(message);
      alternatives.push(message);
    }
  }
  return alternatives;
}

export function buildPreview(flow: CommunicationFlow, state: FlowState): string {
  if (!isTerminal(flow, state)) return '';
  return buildMessage(flow, state);
}

export function getSelectionLabels(state: FlowState): string[] {
  return state.history.map((selection) => selection.label);
}
