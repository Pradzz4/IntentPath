import { useState } from 'react';
import { Icon } from './Icon';

interface ConfirmActionProps {
  label: string;
  confirmLabel: string;
  onConfirm: () => void;
  description?: string;
  icon?: string;
  variant?: 'ghost' | 'secondary' | 'danger';
  className?: string;
}

export function ConfirmAction({
  label,
  confirmLabel,
  onConfirm,
  description = 'Are you sure?',
  icon = 'RefreshCcw',
  variant = 'ghost',
  className = '',
}: ConfirmActionProps) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={`${
          variant === 'danger'
            ? 'btn-danger'
            : variant === 'secondary'
              ? 'btn-secondary'
              : 'btn-ghost'
        } ${className}`}
      >
        <Icon name={icon} className="h-4 w-4" />
        {label}
      </button>
    );
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-lg border border-app-border bg-app-surfaceSoft p-2 text-sm"
      role="group"
      aria-label={`${description} ${label}`}
    >
      <span className="px-1 font-medium text-app-text">{description}</span>
      <button
        type="button"
        onClick={() => {
          setConfirming(false);
          onConfirm();
        }}
        className={variant === 'danger' ? 'btn-danger' : 'btn-primary'}
      >
        {confirmLabel}
      </button>
      <button type="button" onClick={() => setConfirming(false)} className="btn-ghost">
        Cancel
      </button>
    </div>
  );
}
