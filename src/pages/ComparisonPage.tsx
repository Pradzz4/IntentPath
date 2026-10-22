import { useMemo, useState } from 'react';
import { ConfirmAction } from '../components/ConfirmAction';
import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/Icon';
import { DEMO_DISCLAIMER } from '../data/demoScenarios';
import { formatAccuracy } from '../engine/evaluation';
import { useDemoResults } from '../hooks/useDemoResults';
import type { AppScreen, DemoCondition } from '../types';
import { comparisonFilename, downloadCsv, resultsToCsv } from '../utils/csvExport';
import {
  computeConditionMetrics,
  formatDateTime,
  formatDuration,
  formatPercent,
} from '../utils/metrics';

interface ComparisonPageProps {
  onNavigate: (screen: AppScreen) => void;
  demoResultsController: ReturnType<typeof useDemoResults>;
}

export function ComparisonPage({ onNavigate, demoResultsController }: ComparisonPageProps) {
  const { results, clearResults } = demoResultsController;
  const [filterCondition, setFilterCondition] = useState<'all' | DemoCondition>('all');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const guidedMetrics = useMemo(() => computeConditionMetrics(results, 'guided'), [results]);
  const staticMetrics = useMemo(() => computeConditionMetrics(results, 'static'), [results]);

  const filteredResults = useMemo(() => {
    if (filterCondition === 'all') return results;
    return results.filter((r) => r.condition === filterCondition);
  }, [results, filterCondition]);

  const handleExportCsv = () => {
    if (results.length === 0) return;
    const csv = resultsToCsv(results);
    const filename = comparisonFilename();
    const success = downloadCsv(filename, csv);
    if (success) {
      setExportNotice(`Exported ${filename}`);
      window.setTimeout(() => setExportNotice(null), 4000);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      {/* Header */}
      <div className="border-b border-app-border pb-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
        <div>
          <h1 className="font-sans text-3xl sm:text-4xl font-semibold tracking-tight text-app-text">
            Method Comparison &amp; Results
          </h1>
          <p className="mt-2 text-sm sm:text-base text-app-muted leading-relaxed max-w-2xl">
            Comparison metrics between IntentPath guided choices and a traditional static communication board.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={results.length === 0}
            className="btn-primary text-xs sm:text-sm min-h-[2.5rem]"
            title="Download complete dataset as CSV"
          >
            <Icon name="Download" className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('demo')}
            className="btn-secondary text-xs sm:text-sm min-h-[2.5rem]"
          >
            <Icon name="Play" className="h-4 w-4" />
            <span>Run a practice task</span>
          </button>
          {results.length > 0 && (
            <ConfirmAction
              label="Clear data"
              confirmLabel="Delete records"
              variant="danger"
              description="Erase all recorded trial rows?"
              onConfirm={clearResults}
            />
          )}
        </div>
      </div>

      {exportNotice && (
        <div
          role="status"
          className="mt-4 border border-app-success bg-app-successSoft p-3 text-xs font-mono text-app-success"
        >
          [DATA EXPORT COMPLETE]: {exportNotice}
        </div>
      )}

      {/* Notice */}
      <div className="mt-6 rounded-xl border border-app-border bg-app-surfaceSoft/60 p-4 text-xs sm:text-sm text-app-muted leading-relaxed">
        <span className="font-semibold text-app-text block mb-0.5">Evaluation Data Notice:</span>
        {DEMO_DISCLAIMER}
      </div>

      {/* Performance Summary Table */}
      <section className="mt-8 rounded-xl border border-app-border bg-app-surface p-6 shadow-card" aria-labelledby="metrics-table-heading">
        <div className="flex items-center justify-between border-b border-app-border pb-3 text-xs font-semibold uppercase tracking-wider text-app-muted">
          <h2 id="metrics-table-heading" className="text-sm font-semibold text-app-text">
            Performance Summary
          </h2>
          <span>{results.length} recorded {results.length === 1 ? 'trial' : 'trials'}</span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm font-sans">
            <thead>
              <tr className="border-b border-app-border text-xs uppercase tracking-wider text-app-muted font-semibold">
                <th className="py-2.5 pr-4">Metric</th>
                <th className="py-2.5 px-4 text-app-accent font-bold">Guided Choices</th>
                <th className="py-2.5 pl-4 text-app-text font-bold">Static Board</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border/70 text-sm">
              <tr>
                <td className="py-3 pr-4 font-medium text-app-text">Total Trials Logged</td>
                <td className="py-3 px-4 font-semibold text-app-accent">{guidedMetrics.trials}</td>
                <td className="py-3 pl-4 font-semibold text-app-text">{staticMetrics.trials}</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-app-text">Completed Trials</td>
                <td className="py-3 px-4 font-semibold text-app-accent">{guidedMetrics.completed}</td>
                <td className="py-3 pl-4 font-semibold text-app-text">{staticMetrics.completed}</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-app-text">Completion Rate</td>
                <td className="py-3 px-4 font-semibold text-app-accent">
                  {formatPercent(guidedMetrics.completionRate)}
                </td>
                <td className="py-3 pl-4 font-semibold text-app-text">
                  {formatPercent(staticMetrics.completionRate)}
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-app-text">Message Accuracy Rate</td>
                <td className="py-3 px-4 font-semibold text-app-accent">
                  {formatPercent(guidedMetrics.accuracyRate)}
                </td>
                <td className="py-3 pl-4 font-semibold text-app-text">
                  {formatPercent(staticMetrics.accuracyRate)}
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-app-text">Mean Completion Time</td>
                <td className="py-3 px-4 font-semibold text-app-accent">
                  {formatDuration(guidedMetrics.meanElapsedMs)}
                </td>
                <td className="py-3 pl-4 font-semibold text-app-text">
                  {formatDuration(staticMetrics.meanElapsedMs)}
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-app-text">Mean Selections Count</td>
                <td className="py-3 px-4 font-semibold text-app-accent">
                  {guidedMetrics.meanSelections !== null
                    ? `${guidedMetrics.meanSelections.toFixed(1)} choices`
                    : '—'}
                </td>
                <td className="py-3 pl-4 font-semibold text-app-text">
                  {staticMetrics.meanSelections !== null
                    ? `${staticMetrics.meanSelections.toFixed(1)} choices`
                    : '—'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Trial Log Ledger */}
      <section className="mt-8" aria-labelledby="trials-ledger-heading">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 border-b border-app-border pb-2.5">
          <div className="flex items-center gap-2">
            <h2 id="trials-ledger-heading" className="font-mono text-xs font-bold uppercase tracking-wider text-app-text">
              TRIAL LOG REGISTRY ({filteredResults.length})
            </h2>
          </div>

          {results.length > 0 && (
            <div className="flex items-center gap-1 font-mono text-xs" role="group" aria-label="Filter conditions">
              <span className="text-app-muted mr-1">FILTER:</span>
              {(['all', 'guided', 'static'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFilterCondition(mode)}
                  className={`px-2 py-0.5 text-xs uppercase font-bold border transition-colors ${
                    filterCondition === mode
                      ? 'border-app-text bg-app-text text-app-bg'
                      : 'border-app-border bg-app-surface text-app-muted hover:border-app-text hover:text-app-text'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          )}
        </div>

        {results.length === 0 ? (
          <EmptyState
            icon="ClipboardList"
            title="No trial data recorded"
            description="Run simulated tasks in either Guided or Static condition to populate this empirical dataset."
            action={
              <button
                type="button"
                onClick={() => onNavigate('demo')}
                className="btn-primary text-xs font-mono uppercase tracking-wider"
              >
                <Icon name="Play" className="h-3.5 w-3.5" />
                Run first task
              </button>
            }
          />
        ) : (
          <div className="border border-app-border bg-app-surface shadow-editorial overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-app-border bg-app-bgSubtle/70 uppercase tracking-wider text-app-muted">
                    <th className="py-2.5 px-3 font-bold">TASK</th>
                    <th className="py-2.5 px-3 font-bold">COND</th>
                    <th className="py-2.5 px-3 font-bold">TIME</th>
                    <th className="py-2.5 px-3 font-bold">PICKS</th>
                    <th className="py-2.5 px-3 font-bold">BACKS</th>
                    <th className="py-2.5 px-3 font-bold">ACCURACY</th>
                    <th className="py-2.5 px-3 font-bold">UTTERANCE RESULT</th>
                    <th className="py-2.5 px-3 font-bold">TIMESTAMP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-border">
                  {filteredResults.map((trial) => {
                    const isCorrect =
                      trial.accuracy === 'exact' || trial.accuracy === 'equivalent';
                    return (
                      <tr key={trial.id} className="hover:bg-app-surfaceSoft transition-colors">
                        <td className="py-2.5 px-3 font-bold text-app-text font-sans">
                          {trial.taskId} · {trial.scenarioTitle}
                          {trial.notes && (
                            <span className="block text-[0.68rem] text-app-muted font-mono italic">
                              Note: {trial.notes}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-1 py-0.5 border text-[0.65rem] font-bold uppercase ${
                              trial.condition === 'guided'
                                ? 'border-app-accent bg-app-accentSoft text-app-accentInk'
                                : 'border-app-border bg-app-surface text-app-muted'
                            }`}
                          >
                            {trial.condition === 'guided' ? 'Guided' : 'Static'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold">{formatDuration(trial.elapsedMs)}</td>
                        <td className="py-2.5 px-3">{trial.selectionCount}</td>
                        <td className="py-2.5 px-3">{trial.backCount}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`font-bold ${
                              isCorrect ? 'text-app-success' : 'text-app-danger'
                            }`}
                          >
                            {formatAccuracy(trial.accuracy)}
                          </span>
                          {trial.manuallyAdjusted && (
                            <span className="text-[0.62rem] text-app-muted block">(override)</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 max-w-xs truncate font-serif text-sm">
                          {trial.confirmedMessage ? (
                            `“${trial.confirmedMessage}”`
                          ) : (
                            <span className="italic text-app-danger font-mono text-xs">[ABANDONED]</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-[0.68rem] text-app-muted whitespace-nowrap">
                          {formatDateTime(trial.timestamp)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
