import { useCallback, useMemo, useState } from 'react';
import type { CommunicationFlow, FlowId, FlowState } from '../types';
import { flows } from '../data/communicationFlows';
import {
  FlowNavigationError,
  canGoBack,
  createInitialState,
  getCurrentNode,
  getProgress,
  goBack,
  isTerminal,
  restartFlow,
  rewindTo,
  selectOption,
  submitCustomMessage,
} from '../engine/decisionTree';

export interface CommunicationFlowController {
  flow: CommunicationFlow | null;
  state: FlowState | null;
  isActive: boolean;
  terminal: boolean;
  selectionCount: number;
  backCount: number;
  error: string | null;
  canGoBack: boolean;
  progress: { step: number; remaining: number; percent: number; terminal: boolean } | null;
  currentNode: ReturnType<typeof getCurrentNode> | null;
  startFlow: (flowId: FlowId) => void;
  choose: (optionId: string) => boolean;
  useCustomMessage: (text: string) => boolean;
  back: () => void;
  rewind: (selectionIndex: number) => void;
  restart: () => void;
  exit: () => void;
  clearError: () => void;
}

export function useCommunicationFlow(): CommunicationFlowController {
  const [flowId, setFlowId] = useState<FlowId | null>(null);
  const [state, setState] = useState<FlowState | null>(null);
  const [selectionCount, setSelectionCount] = useState(0);
  const [backCount, setBackCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const flow = flowId ? flows[flowId] : null;

  const startFlow = useCallback((nextFlowId: FlowId) => {
    const nextFlow = flows[nextFlowId];
    if (!nextFlow) return;
    try {
      const initial = createInitialState(nextFlow);
      setFlowId(nextFlowId);
      setState(initial);
      setSelectionCount(1);
      setBackCount(0);
      setError(null);
    } catch (caught) {
      setError(caught instanceof FlowNavigationError ? caught.message : 'The path could not start.');
    }
  }, []);

  const choose = useCallback(
    (optionId: string): boolean => {
      if (!flow || !state) return false;
      try {
        const next = selectOption(flow, state, optionId);
        setState(next);
        setSelectionCount((count) => count + 1);
        setError(null);
        return isTerminal(flow, next);
      } catch (caught) {
        setError(caught instanceof FlowNavigationError ? caught.message : 'That choice did not work.');
        return false;
      }
    },
    [flow, state],
  );

  const useCustomMessage = useCallback(
    (text: string): boolean => {
      if (!flow || !state) return false;
      try {
        const next = submitCustomMessage(flow, state, text);
        setState(next);
        setSelectionCount((count) => count + 1);
        setError(null);
        return true;
      } catch (caught) {
        setError(caught instanceof FlowNavigationError ? caught.message : 'That message did not work.');
        return false;
      }
    },
    [flow, state],
  );

  const back = useCallback(() => {
    if (!flow || !state) return;
    if (!canGoBack(state)) return;
    try {
      setState(goBack(flow, state));
      setBackCount((count) => count + 1);
      setError(null);
    } catch {
      setError('The previous step is not available. Please restart this path.');
    }
  }, [flow, state]);

  const rewind = useCallback(
    (selectionIndex: number) => {
      if (!flow || !state) return;
      if (selectionIndex < 0 || selectionIndex >= state.history.length) return;
      setState(rewindTo(state, selectionIndex));
      setBackCount((count) => count + 1);
      setError(null);
    },
    [flow, state],
  );

  const restart = useCallback(() => {
    if (!flow || !state) return;
    try {
      setState(restartFlow(flow, state));
      setSelectionCount(0);
      setBackCount(0);
      setError(null);
    } catch {
      setError('This path could not be restarted.');
    }
  }, [flow, state]);

  const exit = useCallback(() => {
    setFlowId(null);
    setState(null);
    setSelectionCount(0);
    setBackCount(0);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const progress = useMemo(
    () => (flow && state ? getProgress(flow, state) : null),
    [flow, state],
  );

  const currentNode = useMemo(
    () => (flow && state ? getCurrentNode(flow, state) : null),
    [flow, state],
  );

  const terminal = useMemo(
    () => (flow && state ? isTerminal(flow, state) : false),
    [flow, state],
  );

  return {
    flow,
    state,
    isActive: Boolean(flow && state),
    terminal,
    selectionCount,
    backCount,
    error,
    canGoBack: state ? canGoBack(state) : false,
    progress,
    currentNode,
    startFlow,
    choose,
    useCustomMessage,
    back,
    rewind,
    restart,
    exit,
    clearError,
  };
}
