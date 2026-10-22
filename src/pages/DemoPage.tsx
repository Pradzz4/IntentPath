import { useCallback, useEffect, useRef, useState } from 'react';
import { ChoiceCard } from '../components/ChoiceCard';
import { CustomMessageComposer } from '../components/CustomMessageComposer';
import { Icon } from '../components/Icon';
import { MessagePreview } from '../components/MessagePreview';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { ReviewPanel } from '../components/ReviewPanel';
import { StaticBoard } from '../components/StaticBoard';
import { flows } from '../data/communicationFlows';
import { DEMO_DISCLAIMER, demoScenarios } from '../data/demoScenarios';
import { createTrialId, evaluateMessage, formatAccuracy } from '../engine/evaluation';
import { buildAlternatives, buildMessage } from '../engine/messageBuilder';
import { useCommunicationFlow } from '../hooks/useCommunicationFlow';
import { useDemoResults } from '../hooks/useDemoResults';
import type { AccuracyOutcome, AppScreen, DemoCondition, DemoScenario, TrialResult } from '../types';
import { formatDuration, formatStopwatch } from '../utils/metrics';

interface DemoPageProps {
  onNavigate: (screen: AppScreen) => void;
  demoResultsController: ReturnType<typeof useDemoResults>;
}

export function DemoPage({ onNavigate, demoResultsController }: DemoPageProps) {
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario | null>(null);
  const [condition, setCondition] = useState<DemoCondition>('guided');
  const [taskRunning, setTaskRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [staticSelections, setStaticSelections] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [completedTrial, setCompletedTrial] = useState<TrialResult | null>(null);
  const [evaluatorNotes, setEvaluatorNotes] = useState('');

  const guidedController = useCommunicationFlow();
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (taskRunning && startTime !== null) {
      timerRef.current = window.setInterval(() => {
        setElapsedMs(Date.now() - startTime);
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [taskRunning, startTime]);

  const startTask = (scenario: DemoScenario, targetCondition: DemoCondition) => {
    setSelectedScenario(scenario);
    setCondition(targetCondition);
    setCompletedTrial(null);
    setEvaluatorNotes('');
    setShowHint(false);
    setStaticSelections(0);
    setElapsedMs(0);

    const now = Date.now();
    setStartTime(now);
    setTaskRunning(true);

    if (targetCondition === 'guided') {
      guidedController.startFlow(scenario.categoryId);
    }
  };

  const handleFinishTrial = useCallback(
    (confirmedMessage: string, completed = true) => {
      if (!selectedScenario || startTime === null) return;
      const finalElapsed = Date.now() - startTime;
      setTaskRunning(false);

      const selections =
        condition === 'guided'
          ? guidedController.selectionCount
          : Math.max(1, staticSelections);

      const backs = condition === 'guided' ? guidedController.backCount : 0;

      const accuracy: AccuracyOutcome = completed
        ? evaluateMessage(
            confirmedMessage,
            selectedScenario.targetMessage,
            selectedScenario.acceptedMessages,
          )
        : 'uncompleted';

      const trial: TrialResult = {
        id: createTrialId(),
        taskId: selectedScenario.id,
        scenarioTitle: selectedScenario.title,
        condition,
        elapsedMs: finalElapsed,
        selectionCount: selections,
        backCount: backs,
        completed,
        accuracy,
        expectedMessage: selectedScenario.targetMessage,
        confirmedMessage,
        timestamp: new Date().toISOString(),
        notes: '',
      };

      demoResultsController.addResult(trial);
      setCompletedTrial(trial);
    },
    [
      selectedScenario,
      startTime,
      condition,
      guidedController.selectionCount,
      guidedController.backCount,
      staticSelections,
      demoResultsController,
    ],
  );

  const handleAbandonTask = () => {
    handleFinishTrial('', false);
  };

  const resetTaskState = () => {
    setTaskRunning(false);
    setSelectedScenario(null);
    setCompletedTrial(null);
    setStartTime(null);
    guidedController.exit();
  };

  // Completed Trial Summary View
  if (completedTrial && selectedScenario) {
    const isExactOrEq =
      completedTrial.accuracy === 'exact' || completedTrial.accuracy === 'equivalent';
    const otherCondition: DemoCondition =
      completedTrial.condition === 'guided' ? 'static' : 'guided';

    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="border border-app-border bg-app-surface p-6 sm:p-8 shadow-editorial">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-app-border pb-4 gap-2">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-app-accent">
                EXPERIMENTAL TRIAL LOGGED · {completedTrial.id}
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-medium text-app-text mt-1">
                {selectedScenario.id}: {selectedScenario.title}
              </h1>
            </div>
            <span className="font-mono text-xs px-2.5 py-1 border border-app-text bg-app-text text-app-bg uppercase font-bold self-start sm:self-auto">
              {completedTrial.condition === 'guided' ? 'Condition A: Guided' : 'Condition B: Static'}
            </span>
          </div>

          {/* Results Sheet Grid */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 border border-app-border divide-x divide-app-border bg-app-bgSubtle/40">
            <div className="p-4">
              <span className="font-mono text-[0.68rem] uppercase tracking-wider text-app-muted block">
                ELAPSED TIME
              </span>
              <span className="font-mono text-2xl font-bold text-app-text mt-1 block">
                {formatDuration(completedTrial.elapsedMs)}
              </span>
            </div>
            <div className="p-4">
              <span className="font-mono text-[0.68rem] uppercase tracking-wider text-app-muted block">
                SELECTIONS
              </span>
              <span className="font-mono text-2xl font-bold text-app-text mt-1 block">
                {completedTrial.selectionCount}
              </span>
            </div>
            <div className="p-4">
              <span className="font-mono text-[0.68rem] uppercase tracking-wider text-app-muted block">
                BACK OPERATIONS
              </span>
              <span className="font-mono text-2xl font-bold text-app-text mt-1 block">
                {completedTrial.backCount}
              </span>
            </div>
            <div className="p-4">
              <span className="font-mono text-[0.68rem] uppercase tracking-wider text-app-muted block">
                ACCURACY
              </span>
              <span
                className={`font-mono text-lg font-bold mt-1 block ${
                  isExactOrEq ? 'text-app-success' : 'text-app-danger'
                }`}
              >
                {formatAccuracy(completedTrial.accuracy)}
              </span>
            </div>
          </div>

          <div className="mt-6 border border-app-border bg-app-surface p-4 space-y-3 font-mono text-xs">
            <div>
              <span className="text-app-muted block uppercase">TARGET STIMULUS:</span>
              <p className="font-serif text-lg font-medium text-app-text mt-0.5 font-sans">
                “{completedTrial.expectedMessage}”
              </p>
            </div>
            <div className="border-t border-app-border pt-2">
              <span className="text-app-muted block uppercase">RECORDED UTTERANCE:</span>
              <p className="font-serif text-lg font-medium text-app-text mt-0.5 font-sans">
                {completedTrial.confirmedMessage ? (
                  `“${completedTrial.confirmedMessage}”`
                ) : (
                  <span className="italic text-app-danger">[TRIAL ABANDONED / UNCOMPLETED]</span>
                )}
              </p>
            </div>
          </div>

          {/* Evaluator Notes & Override */}
          <div className="mt-6 space-y-4 pt-4 border-t border-app-border">
            <div>
              <label htmlFor="eval-notes" className="field-label">
                EVALUATOR FIELD OBSERVATION NOTE
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  id="eval-notes"
                  type="text"
                  value={evaluatorNotes}
                  onChange={(e) => setEvaluatorNotes(e.target.value)}
                  placeholder="Record participant behavior, hesitations, or observations..."
                  className="text-field font-sans"
                />
                <button
                  type="button"
                  onClick={() => {
                    demoResultsController.updateResult(completedTrial.id, {
                      notes: evaluatorNotes,
                    });
                  }}
                  className="btn-secondary text-xs font-mono uppercase tracking-wider shrink-0"
                >
                  Save Note
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-mono">
              <span className="text-app-muted">MANUAL ACCURACY ADJUSTMENT:</span>
              {(['exact', 'equivalent', 'incorrect', 'uncompleted'] as AccuracyOutcome[]).map(
                (acc) => (
                  <button
                    key={acc}
                    type="button"
                    onClick={() => {
                      demoResultsController.updateResult(completedTrial.id, {
                        accuracy: acc,
                        manuallyAdjusted: true,
                      });
                      setCompletedTrial((current) =>
                        current ? { ...current, accuracy: acc, manuallyAdjusted: true } : null,
                      );
                    }}
                    className={`px-2 py-1 uppercase text-[0.68rem] font-bold border transition-colors ${
                      completedTrial.accuracy === acc
                        ? 'border-app-accent bg-app-accent text-app-onAccent'
                        : 'border-app-border bg-app-surface text-app-muted hover:border-app-text hover:text-app-text'
                    }`}
                  >
                    {formatAccuracy(acc)}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-app-border pt-6">
            <button
              type="button"
              onClick={() => startTask(selectedScenario, otherCondition)}
              className="btn-primary text-xs font-mono uppercase tracking-wider"
            >
              <Icon name="Repeat" className="h-4 w-4" />
              Run in {otherCondition === 'guided' ? 'Condition A (Guided)' : 'Condition B (Static)'}
            </button>
            <button
              type="button"
              onClick={resetTaskState}
              className="btn-secondary text-xs font-mono uppercase tracking-wider"
            >
              Select another task
            </button>
            <button
              type="button"
              onClick={() => onNavigate('comparison')}
              className="btn-ghost ml-auto text-xs font-mono uppercase tracking-wider"
            >
              View comparative analysis ➔
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Task Running View
  if (taskRunning && selectedScenario) {
    const activeFlow =
      condition === 'guided' ? flows[selectedScenario.categoryId] : null;

    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Timer & Task Status Bar */}
        <div className="mb-6 rounded-xl border border-app-border bg-app-surface p-5 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-app-border pb-3 gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="rounded-md bg-app-accentSoft text-app-accentInk px-2 py-0.5">
                Task {selectedScenario.id}
              </span>
              <span className="text-app-border">•</span>
              <span className="text-app-text font-medium">
                {condition === 'guided' ? 'Guided Choices Mode' : 'Static Board Mode'}
              </span>
            </div>

            {/* Live Stopwatch & Picks */}
            <div className="flex items-center gap-5 text-sm">
              <div className="flex items-center gap-1.5">
                <Icon name="Clock" className="h-4 w-4 text-app-accent" />
                <span className="text-xs text-app-muted">Timer:</span>
                <span className="font-semibold text-app-text font-mono" aria-live="off">
                  {formatStopwatch(elapsedMs)}
                </span>
              </div>
              <div className="border-l border-app-border pl-4 flex items-center gap-1.5">
                <span className="text-xs text-app-muted">Choices:</span>
                <span className="font-semibold text-app-text font-mono">
                  {condition === 'guided'
                    ? guidedController.selectionCount
                    : staticSelections}
                </span>
              </div>
              <button
                type="button"
                onClick={handleAbandonTask}
                className="btn-danger text-xs ml-2"
                title="Abandon this task"
              >
                <span>End task</span>
              </button>
            </div>
          </div>

          <div className="mt-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-app-muted block">
              Target goal:
            </span>
            <h1 className="font-sans text-xl sm:text-2xl font-semibold text-app-text mt-0.5">
              {selectedScenario.instruction}
            </h1>
            <p className="mt-1 text-sm text-app-accent font-medium">
              Target sentence: <strong className="text-app-text">“{selectedScenario.targetMessage}”</strong>
            </p>

            {selectedScenario.evaluatorHint && (
              <div className="mt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="text-app-accent underline font-medium"
                >
                  {showHint ? 'Hide hint' : 'Show path hint'}
                </button>
                {showHint && (
                  <p className="mt-1.5 rounded-lg bg-app-surfaceSoft p-2.5 border border-app-border text-app-text">
                    {selectedScenario.evaluatorHint}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Task Condition Runner */}
        {condition === 'static' ? (
          <StaticBoard
            onConfirm={(msg) => handleFinishTrial(msg, true)}
            onPhraseSelected={() => setStaticSelections((prev) => prev + 1)}
            confirmHint="Confirm to complete this practice task."
          />
        ) : activeFlow && guidedController.state ? (
          guidedController.terminal ? (
            <div className="mx-auto max-w-3xl">
              <ReviewPanel
                initialMessage={buildMessage(activeFlow, guidedController.state)}
                alternatives={buildAlternatives(activeFlow, guidedController.state)}
                confirmed={false}
                confirmedMessage={null}
                onConfirm={(msg) => handleFinishTrial(msg, true)}
                onChangeChoices={guidedController.back}
                onStartOver={guidedController.restart}
                contextLabel={`Task ${selectedScenario.id}`}
                confirmHint="Confirm to complete this practice task."
              />
            </div>
          ) : guidedController.currentNode ? (
            <div className="grid gap-8 lg:grid-cols-[1.55fr_1fr] lg:items-start">
              <div>
                {guidedController.progress && (
                  <ProgressIndicator
                    step={guidedController.progress.step}
                    remaining={guidedController.progress.remaining}
                    percent={guidedController.progress.percent}
                    label={activeFlow.title}
                  />
                )}

                <section
                  className="mt-4 rounded-xl border border-app-border bg-app-surface p-6 sm:p-8 shadow-card"
                  aria-labelledby="inquiry-heading"
                >
                  <span className="block font-sans text-xs font-semibold uppercase tracking-wider text-app-accent mb-1.5">
                    Question {guidedController.progress?.step ?? 1}
                  </span>
                  <h2 id="inquiry-heading" className="font-sans text-2xl sm:text-3xl font-semibold text-app-text leading-snug">
                    {guidedController.currentNode.prompt}
                  </h2>

                  {guidedController.currentNode.options.length > 0 && (
                    <div className="mt-6 space-y-3">
                      {guidedController.currentNode.options.map((option, idx) => (
                        <ChoiceCard
                          key={option.id}
                          option={option}
                          index={idx}
                          onSelect={(optionId) => guidedController.choose(optionId)}
                        />
                      ))}
                    </div>
                  )}

                  {guidedController.currentNode.allowCustom && (
                    <div className="mt-6 pt-5 border-t border-app-border">
                      <CustomMessageComposer
                        node={guidedController.currentNode}
                        onSubmit={(text) => guidedController.useCustomMessage(text)}
                      />
                    </div>
                  )}
                </section>

                <div className="mt-5 flex gap-2.5">
                  <button
                    type="button"
                    onClick={guidedController.back}
                    disabled={!guidedController.canGoBack}
                    className="btn-secondary text-sm"
                  >
                    <Icon name="ArrowLeft" className="h-4 w-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={guidedController.restart}
                    className="btn-ghost text-sm"
                  >
                    <span>Restart</span>
                  </button>
                </div>
              </div>

              <aside className="space-y-4">
                <MessagePreview
                  state={guidedController.state}
                  onRewind={guidedController.rewind}
                />
              </aside>
            </div>
          ) : null
        ) : null}
      </div>
    );
  }

  // Task Catalog / Protocol List
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="border-b border-app-border pb-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
        <div>
          <h1 className="font-sans text-3xl sm:text-4xl font-semibold tracking-tight text-app-text">
            Practice Communication Tasks
          </h1>
          <p className="mt-2 text-sm sm:text-base text-app-muted leading-relaxed max-w-2xl">
            Test and practice communication across 8 everyday scenarios. Try them with Guided Choices or compare against the traditional Static Board.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('comparison')}
          className="btn-secondary text-sm shrink-0"
        >
          <span>View comparison metrics ({demoResultsController.counts.total})</span>
          <Icon name="ArrowRight" className="h-4 w-4" />
        </button>
      </div>

      {/* Reassurance & privacy notice */}
      <div className="mt-6 rounded-xl border border-app-border bg-app-surfaceSoft/60 p-4 text-xs sm:text-sm text-app-muted leading-relaxed">
        <span className="font-semibold text-app-text block mb-0.5">Evaluation &amp; Practice Information:</span>
        {DEMO_DISCLAIMER}
      </div>

      {/* Standardized Tasks List */}
      <div className="mt-8 rounded-xl border border-app-border bg-app-surface shadow-card divide-y divide-app-border overflow-hidden">
        {demoScenarios.map((scenario) => {
          return (
            <div
              key={scenario.id}
              className="flex flex-col md:flex-row md:items-center justify-between p-5 gap-4 hover:bg-app-surfaceSoft/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <span className="rounded-md bg-app-accentSoft text-app-accentInk text-xs font-semibold px-2 py-1 shrink-0 mt-0.5">
                  {scenario.id}
                </span>
                <div>
                  <h3 className="font-sans text-lg font-semibold text-app-text">
                    {scenario.title}
                  </h3>
                  <p className="text-sm text-app-muted mt-0.5">
                    {scenario.instruction}
                  </p>
                  <p className="text-xs text-app-accent font-medium mt-1">
                    Goal message: “{scenario.targetMessage}”
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => startTask(scenario, 'guided')}
                  className="btn-primary min-h-[2.5rem] px-4 text-xs sm:text-sm font-semibold"
                >
                  <span>Guided Mode</span>
                </button>
                <button
                  type="button"
                  onClick={() => startTask(scenario, 'static')}
                  className="btn-secondary min-h-[2.5rem] px-4 text-xs sm:text-sm font-medium"
                >
                  <span>Static Board</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
