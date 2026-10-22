import type {
  CommunicationFlow,
  FlowNode,
  FlowState,
  FlowValidationIssue,
  ReachablePath,
  Selection,
} from '../types';

export class FlowNavigationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FlowNavigationError';
  }
}

function requireFlow(flow: CommunicationFlow): void {
  if (!flow || !flow.nodes) {
    throw new FlowNavigationError('This communication path could not be loaded.');
  }
}

export function getNode(flow: CommunicationFlow, nodeId: string): FlowNode {
  requireFlow(flow);
  const node = flow.nodes[nodeId];
  if (!node) {
    throw new FlowNavigationError('That step is not available. Please restart this path.');
  }
  return node;
}

export function createInitialState(flow: CommunicationFlow): FlowState {
  requireFlow(flow);
  if (!flow.nodes[flow.rootNodeId]) {
    throw new FlowNavigationError('This communication path has no starting point.');
  }
  return {
    flowId: flow.id,
    nodeId: flow.rootNodeId,
    history: [],
    custom: null,
  };
}

export function getCurrentNode(flow: CommunicationFlow, state: FlowState): FlowNode {
  return getNode(flow, state.nodeId);
}

export function isTerminal(flow: CommunicationFlow, state: FlowState): boolean {
  if (state.custom) return true;
  const node = getNode(flow, state.nodeId);
  return typeof node.messageTemplate === 'string';
}

export function canGoBack(state: FlowState): boolean {
  return Boolean(state.custom) || state.history.length > 0;
}

export function selectOption(
  flow: CommunicationFlow,
  state: FlowState,
  optionId: string,
): FlowState {
  const node = getNode(flow, state.nodeId);
  const option = node.options.find((candidate) => candidate.id === optionId);
  if (!option) {
    throw new FlowNavigationError('That choice is not available here.');
  }
  if (!option.next || !flow.nodes[option.next]) {
    throw new FlowNavigationError('That choice does not lead anywhere yet. Please choose another.');
  }

  const selection: Selection = {
    nodeId: node.id,
    optionId: option.id,
    label: option.label,
    value: option.value,
    slot: node.slot,
    icon: option.icon,
  };

  return {
    ...state,
    nodeId: option.next,
    history: [...state.history, selection],
    custom: null,
  };
}

export function submitCustomMessage(
  flow: CommunicationFlow,
  state: FlowState,
  text: string,
): FlowState {
  const node = getNode(flow, state.nodeId);
  if (!node.allowCustom) {
    throw new FlowNavigationError('A typed message is not available at this step.');
  }
  const trimmed = text.trim();
  if (!trimmed) {
    throw new FlowNavigationError('Please type a message first.');
  }
  if (trimmed.length > 300) {
    throw new FlowNavigationError('Please keep the message under 300 characters.');
  }
  return {
    ...state,
    custom: { nodeId: node.id, text: trimmed },
  };
}

export function goBack(flow: CommunicationFlow, state: FlowState): FlowState {
  requireFlow(flow);
  if (state.custom) {
    return { ...state, custom: null };
  }
  const previous = state.history[state.history.length - 1];
  if (!previous) return state;
  return {
    ...state,
    nodeId: previous.nodeId,
    history: state.history.slice(0, -1),
    custom: null,
  };
}

/** Move back to a previous question without selecting anything. */
export function rewindTo(state: FlowState, selectionIndex: number): FlowState {
  if (selectionIndex < 0 || selectionIndex >= state.history.length) return state;
  const target = state.history[selectionIndex];
  return {
    ...state,
    nodeId: target.nodeId,
    history: state.history.slice(0, selectionIndex),
    custom: null,
  };
}

export function restartFlow(flow: CommunicationFlow, state: FlowState): FlowState {
  return {
    ...createInitialState(flow),
    flowId: state.flowId,
  };
}

/** Shortest number of choices still needed before a message can be reviewed. */
export function getMinimumRemainingSteps(flow: CommunicationFlow, nodeId: string): number {
  const start = flow.nodes[nodeId];
  if (!start) return 0;
  if (start.messageTemplate || start.allowCustom) return 0;

  const queue: Array<{ id: string; depth: number }> = [{ id: nodeId, depth: 0 }];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current.id)) continue;
    visited.add(current.id);
    const node = flow.nodes[current.id];
    if (!node) continue;
    if (current.depth > 0 && (node.messageTemplate || node.allowCustom)) {
      return current.depth;
    }
    for (const option of node.options) {
      if (option.next && !visited.has(option.next)) {
        queue.push({ id: option.next, depth: current.depth + 1 });
      }
    }
  }
  return 0;
}

export function getProgress(
  flow: CommunicationFlow,
  state: FlowState,
): { step: number; remaining: number; percent: number; terminal: boolean } {
  const terminal = isTerminal(flow, state);
  const depth = state.history.length + (state.custom ? 1 : 0);
  const remaining = terminal ? 0 : getMinimumRemainingSteps(flow, state.nodeId);
  const total = depth + remaining;
  const percent = terminal ? 100 : total === 0 ? 100 : Math.round((depth / total) * 100);
  return { step: depth + 1, remaining, percent, terminal };
}

const MAX_PATHS = 500;

export function findReachablePaths(flow: CommunicationFlow): ReachablePath[] {
  requireFlow(flow);
  const root = flow.nodes[flow.rootNodeId];
  if (!root) return [];

  const paths: ReachablePath[] = [];
  const seenOnPath = new Set<string>();

  const walk = (
    nodeId: string,
    nodeIds: string[],
    optionIds: string[],
  ): void => {
    if (paths.length >= MAX_PATHS) return;
    if (seenOnPath.has(nodeId)) return;
    const node = flow.nodes[nodeId];
    if (!node) return;

    seenOnPath.add(nodeId);
    const nextNodeIds = [...nodeIds, nodeId];

    if (node.messageTemplate) {
      paths.push({
        nodeIds: nextNodeIds,
        optionIds,
        terminalNodeId: node.id,
        viaCustom: false,
        messageTemplate: node.messageTemplate,
      });
    } else if (node.allowCustom) {
      paths.push({
        nodeIds: nextNodeIds,
        optionIds,
        terminalNodeId: node.id,
        viaCustom: true,
        messageTemplate: '',
      });
    }

    for (const option of node.options) {
      if (!option.next || !flow.nodes[option.next]) continue;
      walk(option.next, nextNodeIds, [...optionIds, option.id]);
    }

    seenOnPath.delete(nodeId);
  };

  walk(flow.rootNodeId, [], []);
  return paths;
}

export function countCompletePaths(flow: CommunicationFlow): number {
  return findReachablePaths(flow).length;
}

export function validateFlow(flow: CommunicationFlow): FlowValidationIssue[] {
  const issues: FlowValidationIssue[] = [];
  const root = flow.nodes[flow.rootNodeId];
  if (!root) {
    issues.push({
      code: 'missing-root',
      message: `Flow "${flow.id}" has no node at its root ID "${flow.rootNodeId}".`,
      nodeId: flow.rootNodeId,
    });
    return issues;
  }

  for (const [nodeKey, node] of Object.entries(flow.nodes)) {
    if (node.id !== nodeKey) {
      issues.push({
        code: 'missing-node',
        message: `Node key "${nodeKey}" does not match its id "${node.id}".`,
        nodeId: nodeKey,
      });
    }
    if (!node.prompt.trim()) {
      issues.push({
        code: 'empty-question',
        message: `Node "${node.id}" has no prompt.`,
        nodeId: node.id,
      });
    }
    if (typeof node.messageTemplate === 'string' && !node.messageTemplate.trim()) {
      issues.push({
        code: 'no-message',
        message: `Terminal node "${node.id}" has an empty message.`,
        nodeId: node.id,
      });
    }
    if (!node.messageTemplate && !node.allowCustom && node.options.length === 0) {
      issues.push({
        code: 'no-options',
        message: `Node "${node.id}" has no choices and no message.`,
        nodeId: node.id,
      });
    }
    for (const option of node.options) {
      if (!option.next || !flow.nodes[option.next]) {
        issues.push({
          code: 'missing-destination',
          message: `Choice "${option.id}" on node "${node.id}" points to a missing node.`,
          nodeId: node.id,
          optionId: option.id,
        });
      }
    }
  }

  // Reachability checks make unreachable or orphaned copy visible to developers.
  const reachable = new Set<string>();
  const queue = [flow.rootNodeId];
  while (queue.length > 0) {
    const id = queue.shift();
    if (!id || reachable.has(id)) continue;
    reachable.add(id);
    const node = flow.nodes[id];
    if (!node) continue;
    for (const option of node.options) {
      if (option.next) queue.push(option.next);
    }
  }
  for (const nodeId of Object.keys(flow.nodes)) {
    if (!reachable.has(nodeId)) {
      issues.push({
        code: 'unreachable-node',
        message: `Node "${nodeId}" cannot be reached from the root.`,
        nodeId,
      });
    }
  }

  // Detect cycles using a depth-limited DFS.
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const detectCycle = (nodeId: string, depth: number): void => {
    if (depth > 40 || visited.has(nodeId)) return;
    if (visiting.has(nodeId)) {
      issues.push({
        code: 'cycle',
        message: `A cycle was found involving node "${nodeId}".`,
        nodeId,
      });
      return;
    }
    const node = flow.nodes[nodeId];
    if (!node) return;
    visiting.add(nodeId);
    for (const option of node.options) {
      if (option.next) detectCycle(option.next, depth + 1);
    }
    visiting.delete(nodeId);
    visited.add(nodeId);
  };
  detectCycle(flow.rootNodeId, 0);

  return issues;
}

export function validateAllFlows(flowList: CommunicationFlow[]): FlowValidationIssue[] {
  return flowList.flatMap((flow) => validateFlow(flow));
}
