'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CornerDownLeft, Search, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Kbd } from './ui';

export interface PaletteItem {
  id: string;
  group: 'Tickets' | 'Customers' | 'Actions';
  label: string;
  hint?: string;
  icon: LucideIcon;
  /** Extra text matched by the search but not displayed. */
  keywords?: string;
  run: () => void;
}

const GROUP_ORDER: PaletteItem['group'][] = ['Tickets', 'Customers', 'Actions'];
const MAX_PER_GROUP = 6;

export function CommandPalette({
  open,
  onClose,
  items,
}: {
  open: boolean;
  onClose: () => void;
  items: PaletteItem[];
}) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreFocus.current = document.activeElement as HTMLElement | null;
    setQuery('');
    setActive(0);
    return () => restoreFocus.current?.focus?.();
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? items.filter((it) => `${it.label} ${it.hint ?? ''} ${it.keywords ?? ''}`.toLowerCase().includes(q))
      : items;
    return GROUP_ORDER.flatMap((g) => matches.filter((m) => m.group === g).slice(0, MAX_PER_GROUP));
  }, [items, query]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  const runAt = (index: number) => {
    const item = results[index];
    if (!item) return;
    onClose();
    item.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      runAt(active);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  let lastGroup: string | null = null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
      <div aria-hidden="true" onClick={onClose} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={onKeyDown}
        className="glass relative w-full max-w-xl overflow-hidden rounded-2xl border shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search aria-hidden="true" className="h-5 w-5 text-muted" />
          <label htmlFor="palette-input" className="sr-only">
            Search tickets, customers and actions
          </label>
          <input
            ref={inputRef}
            autoFocus
            id="palette-input"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-results"
            aria-activedescendant={results[active] ? `palette-${results[active].id}` : undefined}
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tickets, customers, actions…"
            className="h-14 flex-1 bg-transparent text-base text-fg outline-none placeholder:text-muted"
          />
          <Kbd>Esc</Kbd>
        </div>

        <ul ref={listRef} id="palette-results" role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <li className="px-3 py-10 text-center text-sm text-muted">No results for “{query}”</li>
          )}
          {results.map((item, index) => {
            const showGroup = item.group !== lastGroup;
            lastGroup = item.group;
            const Icon = item.icon;
            const selected = index === active;
            return (
              <li key={item.id} role="presentation">
                {showGroup && (
                  <p role="presentation" className="px-3 pt-3 pb-1.5 text-xs font-semibold tracking-wide text-muted uppercase">
                    {item.group}
                  </p>
                )}
                <div
                  id={`palette-${item.id}`}
                  role="option"
                  aria-selected={selected}
                  data-index={index}
                  onMouseMove={() => setActive(index)}
                  onClick={() => runAt(index)}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-100',
                    selected ? 'bg-primary-soft text-fg' : 'text-fg/90',
                  )}
                >
                  <Icon aria-hidden="true" className={cn('h-4 w-4 shrink-0', selected ? 'text-primary-text' : 'text-muted')} />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.hint && <span className="shrink-0 font-mono text-xs text-muted">{item.hint}</span>}
                  {selected && <CornerDownLeft aria-hidden="true" className="h-4 w-4 shrink-0 text-muted" />}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> navigate
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>↵</Kbd> select
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <Kbd>J</Kbd>
            <Kbd>K</Kbd> move in queue
          </span>
        </div>
      </div>
    </div>
  );
}
