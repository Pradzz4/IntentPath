import { Icon } from '../components/Icon';
import { communicationCategories } from '../data/communicationFlows';
import type { FlowId } from '../types';

interface WelcomePageProps {
  onStart: () => void;
  onDemo: () => void;
  onSettings: () => void;
  onStartDomain?: (domainId: FlowId) => void;
}

export function WelcomePage({ onStart, onDemo, onSettings, onStartDomain }: WelcomePageProps) {
  const handleDomainClick = (domainId: FlowId) => {
    if (onStartDomain) {
      onStartDomain(domainId);
    } else {
      onStart();
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Warm, reassuring header */}
      <div className="text-center sm:text-left mb-8 sm:mb-10">
        <h1 className="font-sans text-3xl sm:text-4xl lg:text-4xl font-semibold tracking-tight text-app-text">
          What would you like to say?
        </h1>
        <p className="mt-2.5 text-base sm:text-lg text-app-muted max-w-2xl leading-relaxed">
          Choose a topic below to start. We will help you form a clear message one step at a time.
        </p>
      </div>

      {/* Primary Category Choices - Large, comfortably spaced, high contrast */}
      <section aria-label="Communication topics">
        <div className="grid gap-4 sm:gap-5">
          {communicationCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleDomainClick(category.id)}
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
      </section>

      {/* Immediate Assistance Section */}
      <section className="mt-8 rounded-xl border border-app-danger/30 bg-app-dangerSoft/60 p-5 sm:p-6" aria-labelledby="urgent-heading">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-app-surface border border-app-danger/30 text-app-danger"
              aria-hidden="true"
            >
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
            onClick={() => handleDomainClick('urgent-help')}
            className="btn-urgent shrink-0 self-start sm:self-auto"
          >
            <Icon name="ShieldAlert" className="h-5 w-5" />
            <span>I need help now</span>
          </button>
        </div>
      </section>

      {/* Reassurance and quiet secondary tools */}
      <section className="mt-12 pt-8 border-t border-app-border" aria-label="Reassurance and tools">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs sm:text-sm text-app-muted">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1.5 font-medium text-app-text">
              <span className="h-2 w-2 rounded-full bg-app-success" aria-hidden="true" />
              Private &amp; local
            </span>
            <span>·</span>
            <span>No automatic speech</span>
            <span>·</span>
            <span>Take all the time you need</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onDemo}
              className="font-medium text-app-muted hover:text-app-text hover:underline"
            >
              Practice tasks
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={onSettings}
              className="font-medium text-app-muted hover:text-app-text hover:underline"
            >
              Settings
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
