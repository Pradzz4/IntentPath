import { useId, useState } from 'react';
import type { FlowNode } from '../types';
import { Icon } from './Icon';

interface CustomMessageComposerProps {
  node: FlowNode;
  onSubmit: (text: string) => void;
}

/** Optional free-text input when choices do not cover the user's intent. */
export function CustomMessageComposer({ node, onSubmit }: CustomMessageComposerProps) {
  const [text, setText] = useState('');
  const id = useId();
  const helpId = useId();

  return (
    <form
      className="rounded-xl border border-app-border bg-app-surface p-4 sm:p-5 shadow-subtle"
      onSubmit={(event) => {
        event.preventDefault();
        if (text.trim()) onSubmit(text);
      }}
    >
      <div className="flex items-center gap-2">
        <Icon name="Pencil" className="h-4 w-4 text-app-accentInk" />
        <h3 className="text-base font-semibold text-app-text">Use your own words</h3>
      </div>
      <p id={helpId} className="mt-1 text-sm text-app-muted leading-relaxed">
        {node.customPrompt ?? 'Type what you want to say.'} You will review it before confirming or speaking.
      </p>
      <label htmlFor={id} className="sr-only">
        Your own message
      </label>
      <textarea
        id={id}
        value={text}
        onChange={(event) => setText(event.target.value)}
        maxLength={300}
        rows={3}
        aria-describedby={helpId}
        placeholder="Type here..."
        className="text-field mt-3 min-h-[5.5rem] resize-y text-base"
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <button type="submit" disabled={!text.trim()} className="btn-primary">
          <Icon name="ArrowRight" className="h-4 w-4" />
          <span>Use this message</span>
        </button>
        <span className="text-xs text-app-muted">{text.length}/300</span>
      </div>
    </form>
  );
}
