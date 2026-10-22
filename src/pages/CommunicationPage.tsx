import { useEffect, useRef } from 'react';
import { ChoiceCard } from '../components/ChoiceCard';
import { ConfirmAction } from '../components/ConfirmAction';
import { CustomMessageComposer } from '../components/CustomMessageComposer';
import { Icon } from '../components/Icon';
import { MessagePreview } from '../components/MessagePreview';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { communicationCategories, urgentHelpFlow } from '../data/communicationFlows';
import { buildMessage } from '../engine/messageBuilder';
import type { CommunicationFlowController } from '../hooks/useCommunicationFlow';
import type { AppScreen } from '../types';

interface CommunicationPageProps {
  controller: CommunicationFlowController;
  onReview: () => void;
  onStartUrgent: () => void;
  onNavigate: (screen: AppScreen) => void;
}

export function CommunicationPage({
  controller,
  onReview,
  onStartUrgent,
  onNavigate,
}: CommunicationPageProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousNodeId = useRef<string | null>(null);
  const { flow, state, currentNode, progress } = controller;

  useEffect(() => {
    if (!currentNode) return;
    if (previousNodeId.current === currentNode.id) return;
    previousNodeId.current = currentNode.id;
    headingRef.current?.focus({ preventScroll: false });
  }, [currentNode]);

  // Topic Selection View (when no flow has started)
  if (!flow || !state || !currentNode) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="text-center sm:text-left mb-8 sm:mb-10">
          <h1 className="font-sans text-3xl sm:text-4xl font-semibold tracking-tight text-app-text">
            What would you like to say?
          </h1>
          <p className="mt-2.5 text-base sm:text-lg text-app-muted max-w-2xl leading-relaxed">
            Choose a topic to begin. We will guide you with simple choices, and you will confirm your sentence before it is spoken.
          </p>
        </div>

        {/* Clear category choice cards */}
        <div className="grid gap-4 sm:gap-5">
          {communicationCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => controller.startFlow(category.id)}
              className="group relative flex min-h-[5.5rem] w-full items-center justify-between gap-4 rounded-xl border border-app-border bg-app-surface p-5 sm:p-6 text-left shadow-sm transition-all duration-150 hover:border-app-accent hover:bg-app-surfaceSoft/60 hover:shadow-card active:translate-y-px"
            >
              <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                <span
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-app-accentSoft text-app-accentInk border border-app-accent/20 transition-colors group-hover:bg-app-accent group-hover:text-app-onAccent shadow-sm"
                  aria-hidden="true"
                >
                  <Icon name={category.icon} className="h-7 w-7" strokeWidth={2} />
                </span>

                <div className="min-w-0 flex-1">
                  <h2 className="font-sans text-xl sm:text-2xl font-semibold text-app-text leading-snug group-hover:text-app-accentInk">
                    {category.title}
                  </h2>
                  <p className="mt-1 text-sm sm:text-base text-app-muted leading-normal">
                    {category.description}
                  </p>
                </div>
              </div>

              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-app-muted transition-transform group-hover:translate-x-1 group-hover:text-app-accent"
                aria-hidden="true"
              >
                <Icon name="ChevronRight" className="h-6 w-6" strokeWidth={2.5} />
              </div>
            </button>
          ))}
        </div>

        {/* Urgent Emergency Callout */}
        <section className="mt-8 rounded-xl border border-app-danger/30 bg-app-dangerSoft/60 p-5 sm:p-6" aria-labelledby="urgent-heading">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-app-surface border border-app-danger/30 text-app-danger">
                <Icon name="ShieldAlert" className="h-5 w-5" strokeWidth={2} />
              </span>
              <div>
                <h2 id="urgent-heading" className="font-sans text-lg font-semibold text-app-text">
                  Need help right now?
                </h2>
                <p className="text-sm text-app-muted">
                  Quickly prepare an immediate assistance message.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onStartUrgent}
              className="btn-urgent shrink-0 self-start sm:self-auto"
              aria-label={`Start urgent message: ${urgentHelpFlow.nodes[urgentHelpFlow.rootNodeId]?.messageTemplate ?? 'I need help now, please.'}`}
            >
              <Icon name="ShieldAlert" className="h-4 w-4" />
              <span>I need help now</span>
            </button>
          </div>
        </section>

        {controller.error && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-app-danger bg-app-dangerSoft p-4 text-sm font-medium text-app-danger"
          >
            {controller.error}
          </p>
        )}
      </div>
    );
  }

  // Terminal State (when choices have produced a final message)
  const terminalMessage =
    controller.terminal && flow && state ? buildMessage(flow, state) : '';

  if (controller.terminal) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="rounded-xl border border-app-border bg-app-surface p-6 sm:p-8 shadow-card">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-sans font-medium text-app-accent">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-app-accentSoft text-app-accentInk text-xs">
              ✓
            </span>
            <span>Choices completed</span>
          </div>

          <h1 className="font-sans text-2xl sm:text-3xl font-semibold text-app-text mt-3">
            Your message is ready:
          </h1>

          <div className="mt-5 rounded-xl border border-app-accent/20 bg-app-accentSoft/40 p-6">
            <p className="font-sans text-2xl sm:text-3xl font-semibold leading-relaxed text-app-text">
              “{terminalMessage}”
            </p>
          </div>

          <p className="mt-3 text-sm text-app-muted">
            Nothing has been spoken aloud yet. Review your sentence and speak it when you are ready.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3 pt-5 border-t border-app-border">
            <button type="button" onClick={onReview} className="btn-primary min-h-[3.25rem]">
              <Icon name="FileText" className="h-5 w-5" />
              <span>Review and speak message</span>
            </button>
            <button type="button" onClick={controller.back} className="btn-secondary min-h-[3.25rem]">
              <Icon name="ArrowLeft" className="h-4 w-4" />
              <span>Change last choice</span>
            </button>
            <button
              type="button"
              onClick={controller.restart}
              className="btn-ghost min-h-[3.25rem] text-sm text-app-muted hover:text-app-text ml-auto"
            >
              <Icon name="RotateCcw" className="h-4 w-4" />
              <span>Start over</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!progress) return null;

  // Active Inquiry Screen (One question at a time)
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Top Navigation Strip */}
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-app-border pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={controller.back}
            disabled={!controller.canGoBack}
            className="btn-ghost -ml-2 text-sm font-medium"
            aria-label="Back to previous question"
          >
            <Icon name="ArrowLeft" className="h-4 w-4" />
            <span>Back</span>
          </button>
          <span className="text-app-border">|</span>
          <button
            type="button"
            onClick={() => {
              controller.exit();
              onNavigate('welcome');
            }}
            className="btn-ghost text-xs sm:text-sm text-app-muted"
          >
            All topics
          </button>
        </div>

        <ConfirmAction
          label="Start over"
          confirmLabel="Restart"
          icon="RotateCcw"
          description="Start this topic over from the beginning?"
          onConfirm={controller.restart}
          variant="ghost"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.55fr_1fr] lg:items-start">
        <div>
          {/* Calm, readable progress bar */}
          <ProgressIndicator
            step={progress.step}
            remaining={progress.remaining}
            percent={progress.percent}
            label={flow.title}
          />

          {/* Focal Inquiry Section */}
          <section
            className="mt-4 rounded-xl border border-app-border bg-app-surface p-6 sm:p-8 shadow-card"
            aria-labelledby="question-heading"
            aria-describedby={currentNode.helper ? 'question-helper' : undefined}
          >
            <div key={currentNode.id} className="animate-rise">
              <span className="block font-sans text-xs font-semibold uppercase tracking-wider text-app-accent mb-1.5">
                Question {progress.step}
              </span>
              <h1
                id="question-heading"
                ref={headingRef}
                tabIndex={-1}
                className="font-sans text-2xl sm:text-3xl font-semibold leading-snug text-app-text focus:outline-none"
              >
                {currentNode.prompt}
              </h1>
              {currentNode.helper && (
                <p
                  id="question-helper"
                  className="mt-2 text-base text-app-muted leading-relaxed"
                >
                  {currentNode.helper}
                </p>
              )}

              {/* Generous tactile choices */}
              {currentNode.options.length > 0 && (
                <div className="mt-6 space-y-3" role="group" aria-label="Available choices">
                  {currentNode.options.map((option, idx) => (
                    <ChoiceCard
                      key={option.id}
                      option={option}
                      index={idx}
                      onSelect={(optionId) => {
                        const finished = controller.choose(optionId);
                        if (finished) onReview();
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Custom words fallback */}
              {currentNode.allowCustom && (
                <div className="mt-6 pt-5 border-t border-app-border">
                  <CustomMessageComposer
                    key={currentNode.id}
                    node={currentNode}
                    onSubmit={(text) => {
                      if (controller.useCustomMessage(text)) onReview();
                    }}
                  />
                </div>
              )}
            </div>
          </section>

          {/* Error Banner */}
          {controller.error && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2.5 rounded-lg border border-app-danger/30 bg-app-dangerSoft p-4 text-sm text-app-danger font-medium"
            >
              <Icon name="AlertCircle" className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="flex-1">{controller.error}</span>
              <button
                type="button"
                onClick={controller.clearError}
                className="font-semibold underline ml-2"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Bottom Navigation */}
          <div className="mt-6 flex items-center justify-between pt-4 border-t border-app-border">
            <button
              type="button"
              onClick={controller.back}
              disabled={!controller.canGoBack}
              className="btn-secondary"
            >
              <Icon name="ArrowLeft" className="h-4 w-4" />
              <span>Back one step</span>
            </button>

            <span className="text-xs text-app-muted">
              You can change choices at any time
            </span>
          </div>
        </div>

        {/* Sidebar: Message in Progress */}
        <aside className="space-y-4 lg:sticky lg:top-24">
          <MessagePreview state={state} onRewind={controller.rewind} />
          <div className="rounded-xl border border-app-border bg-app-surfaceSoft/60 p-4 text-xs sm:text-sm text-app-muted leading-relaxed">
            <p className="font-semibold text-app-text mb-1 flex items-center gap-1.5">
              <Icon name="Clock" className="h-4 w-4 text-app-accent" />
              Take all the time you need
            </p>
            <p>
              There are no time limits or countdowns. You can always change any previous step or start over.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
