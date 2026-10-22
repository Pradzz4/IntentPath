import { Icon } from './Icon';

interface LogoProps {
  size?: 'small' | 'large';
  showTagline?: boolean;
}

export function Logo({ size = 'small', showTagline = true }: LogoProps) {
  const large = size === 'large';
  return (
    <div className="flex items-center gap-3">
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-lg border border-app-accent/20 bg-app-accentSoft text-app-accent shadow-sm transition-transform ${
          large ? 'h-11 w-11' : 'h-9 w-9'
        }`}
        aria-hidden="true"
      >
        <Icon name="Route" className={large ? 'h-5 w-5' : 'h-4 w-4'} strokeWidth={2.2} />
      </span>
      <div className="flex flex-col text-left">
        <span
          className={`font-sans font-bold leading-tight tracking-tight text-app-text ${
            large ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'
          }`}
        >
          IntentPath
        </span>
        {showTagline && (
          <span
            className={`font-sans text-app-muted font-normal ${
              large ? 'text-xs' : 'text-[0.75rem]'
            }`}
          >
            Guided communication
          </span>
        )}
      </div>
    </div>
  );
}
