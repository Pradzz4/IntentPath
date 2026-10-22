import { useState } from 'react';
import { AppHeader } from './components/AppHeader';
import { useCommunicationFlow } from './hooks/useCommunicationFlow';
import { useDemoResults } from './hooks/useDemoResults';
import { PreferencesProvider } from './hooks/usePreferences';
import { CommunicationPage } from './pages/CommunicationPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { DemoPage } from './pages/DemoPage';
import { MessageReviewPage } from './pages/MessageReviewPage';
import { SettingsPage } from './pages/SettingsPage';
import { WelcomePage } from './pages/WelcomePage';
import type { AppScreen, FlowId } from './types';

function AppContent() {
  const [screen, setScreen] = useState<AppScreen>('welcome');
  const flowController = useCommunicationFlow();
  const demoResultsController = useDemoResults();

  const handleStartCommunicating = () => {
    setScreen('communicate');
  };

  const handleStartDomain = (domainId: FlowId) => {
    flowController.startFlow(domainId);
    setScreen('communicate');
  };

  const handleStartUrgent = () => {
    flowController.startFlow('urgent-help');
    setScreen('review');
  };

  const handleStartOver = () => {
    flowController.restart();
    setScreen('communicate');
  };

  return (
    <div className="flex min-h-screen flex-col bg-app-bg text-app-text selection:bg-app-accentSoft selection:text-app-accentInk">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <AppHeader screen={screen} onNavigate={setScreen} />

      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {screen === 'welcome' && (
          <WelcomePage
            onStart={handleStartCommunicating}
            onStartDomain={handleStartDomain}
            onDemo={() => setScreen('demo')}
            onSettings={() => setScreen('settings')}
          />
        )}

        {screen === 'communicate' && (
          <CommunicationPage
            controller={flowController}
            onReview={() => setScreen('review')}
            onStartUrgent={handleStartUrgent}
            onNavigate={setScreen}
          />
        )}

        {screen === 'review' && (
          <MessageReviewPage
            controller={flowController}
            onNavigate={setScreen}
            onStartOver={handleStartOver}
          />
        )}

        {screen === 'demo' && (
          <DemoPage
            onNavigate={setScreen}
            demoResultsController={demoResultsController}
          />
        )}

        {screen === 'comparison' && (
          <ComparisonPage
            onNavigate={setScreen}
            demoResultsController={demoResultsController}
          />
        )}

        {screen === 'settings' && (
          <SettingsPage
            resultsCount={demoResultsController.counts.total}
            onClearResults={demoResultsController.clearResults}
            onNavigate={setScreen}
          />
        )}
      </main>

      <footer className="border-t border-app-border bg-app-surface py-8 text-xs text-app-muted">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <p className="text-center sm:text-left">
            <strong>IntentPath</strong> — A guided intent-clarification system for people with aphasia.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span>Runs locally &amp; privately</span>
            <span>·</span>
            <button
              type="button"
              onClick={() => setScreen('settings')}
              className="font-medium text-app-accentInk hover:underline"
            >
              Accessibility &amp; Settings
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <PreferencesProvider>
      <AppContent />
    </PreferencesProvider>
  );
}

export default App;
