import type { AppScreen } from '../types';
import { Logo } from './Logo';
import { Icon } from './Icon';

interface AppHeaderProps {
  screen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
}

const navItems: Array<{ screen: AppScreen; label: string; icon: string }> = [
  { screen: 'welcome', label: 'Home', icon: 'Home' },
  { screen: 'communicate', label: 'Communicate', icon: 'MessageCircle' },
  { screen: 'demo', label: 'Practice', icon: 'ClipboardList' },
  { screen: 'comparison', label: 'Compare', icon: 'BarChart3' },
  { screen: 'settings', label: 'Settings', icon: 'Settings' },
];

export function AppHeader({ screen, onNavigate }: AppHeaderProps) {
  const activeScreen = screen === 'review' ? 'communicate' : screen;

  return (
    <header className="sticky top-0 z-30 border-b border-app-border bg-app-bg/95 backdrop-blur-md transition-colors">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <button
          type="button"
          onClick={() => onNavigate('welcome')}
          className="text-left -ml-1 rounded-lg p-1 transition-opacity hover:opacity-90 focus-visible:outline-offset-2"
          aria-label="IntentPath home"
        >
          <Logo />
        </button>

        {/* Clean, comfortable navigation tabs */}
        <nav aria-label="Main navigation" className="-mx-2 overflow-x-auto px-2 py-0.5">
          <ul className="flex items-center gap-1.5">
            {navItems.map((item) => {
              const active = activeScreen === item.screen;
              return (
                <li key={item.screen}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.screen)}
                    aria-current={active ? 'page' : undefined}
                    className={`inline-flex min-h-[2.5rem] items-center gap-2 rounded-lg px-3 py-1.5 font-sans text-sm font-medium transition-all duration-150 ${
                      active
                        ? 'bg-app-accent text-app-onAccent shadow-sm'
                        : 'text-app-muted hover:bg-app-bgSubtle hover:text-app-text'
                    }`}
                  >
                    <Icon name={item.icon} className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
