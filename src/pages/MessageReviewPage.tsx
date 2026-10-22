import { useEffect, useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/Icon';
import { MessagePreview } from '../components/MessagePreview';
import { ReviewPanel } from '../components/ReviewPanel';
import { buildAlternatives, buildMessage } from '../engine/messageBuilder';
import type { CommunicationFlowController } from '../hooks/useCommunicationFlow';
import type { AppScreen } from '../types';

interface MessageReviewPageProps {
  controller: CommunicationFlowController;
  onNavigate: (screen: AppScreen) => void;
  onStartOver: () => void;
}

export function MessageReviewPage({
  controller,
  onNavigate,
  onStartOver,
}: MessageReviewPageProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedMessage, setConfirmedMessage] = useState<string | null>(null);

  const flow = controller.flow;
  const state = controller.state;
  const message = flow && state ? buildMessage(flow, state) : '';
  const alternatives = flow && state ? buildAlternatives(flow, state) : [];
  const stateKey = state
    ? `${state.flowId}:${state.nodeId}:${state.custom?.text ?? ''}:${state.history.length}`
    : 'empty';

  useEffect(() => {
    setConfirmed(false);
    setConfirmedMessage(null);
  }, [stateKey]);

  if (!flow || !state || !controller.terminal || !message) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <EmptyState
          icon="FileText"
          title="No message to review yet"
          description="Choose a communication topic and answer the questions. Your formulated sentence will appear here for you to check and speak."
          action={
            <button
              type="button"
              onClick={() => onNavigate('communicate')}
              className="btn-primary"
            >
              <Icon name="MessageCircle" className="h-4 w-4" />
              <span>Begin communication</span>
            </button>
          }
        />
      </div>
    );
  }

  const changeChoices = () => {
    setConfirmed(false);
    setConfirmedMessage(null);
    controller.back();
    onNavigate('communicate');
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Top Navigation */}
      <div className="mb-5 flex items-center justify-between border-b border-app-border pb-3">
        <button
          type="button"
          onClick={() => onNavigate('communicate')}
          className="btn-ghost -ml-2 text-sm font-medium"
        >
          <Icon name="ArrowLeft" className="h-4 w-4" />
          <span>Back to questions</span>
        </button>

        <span className="text-xs text-app-muted">
          Topic: <strong className="text-app-text font-semibold">{flow.title}</strong>
        </span>
      </div>

      <div className="mb-8">
        <h1 className="font-sans text-3xl sm:text-4xl font-semibold tracking-tight text-app-text">
          Review your message
        </h1>
        <p className="mt-2 text-base text-app-muted max-w-2xl leading-relaxed">
          Check your message below. You can edit the words, choose an alternate phrasing, or confirm and speak when ready.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <ReviewPanel
          initialMessage={message}
          alternatives={alternatives}
          confirmed={confirmed}
          confirmedMessage={confirmedMessage}
          onConfirm={(nextMessage) => {
            setConfirmed(true);
            setConfirmedMessage(nextMessage);
          }}
          onUnconfirm={() => {
            setConfirmed(false);
            setConfirmedMessage(null);
          }}
          onChangeChoices={changeChoices}
          onStartOver={onStartOver}
          contextLabel={flow.title}
          confirmHint="Confirming unlocks the Speak button. Audio will never play automatically."
        />

        <aside className="space-y-4 lg:sticky lg:top-24">
          <MessagePreview
            state={state}
            onRewind={(index) => {
              setConfirmed(false);
              setConfirmedMessage(null);
              controller.rewind(index);
              onNavigate('communicate');
            }}
          />

          <div className="rounded-xl border border-app-border bg-app-surfaceSoft/60 p-4 text-xs sm:text-sm text-app-muted leading-relaxed">
            <p className="font-semibold text-app-text mb-1 flex items-center gap-1.5">
              <Icon name="ShieldCheck" className="h-4 w-4 text-app-success" />
              You remain in control
            </p>
            <ul className="space-y-1.5 text-xs text-app-muted mt-2">
              <li className="flex items-start gap-1.5">
                <span className="text-app-accent font-bold">•</span>
                <span>Audio is never played without your command.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-app-accent font-bold">•</span>
                <span>You can edit or change any word at any time.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-app-accent font-bold">•</span>
                <span>Take all the time you need.</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
