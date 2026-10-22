import type { ReactNode } from 'react';
import { Icon } from './Icon';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon = 'Compass', title, description, action }: EmptyStateProps) {
  return (
    <div className="mx-auto max-w-lg rounded-xl border border-app-border bg-app-surface p-8 text-center shadow-card sm:p-10">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-app-accentSoft text-app-accent border border-app-accent/20" aria-hidden="true">
        <Icon name={icon} className="h-7 w-7" strokeWidth={2} />
      </span>
      <h2 className="mt-4 text-xl sm:text-2xl font-semibold text-app-text">{title}</h2>
      <p className="mt-2 text-sm sm:text-base leading-relaxed text-app-muted">{description}</p>
      {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}
