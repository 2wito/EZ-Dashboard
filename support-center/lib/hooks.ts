'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { DEMO_EPOCH, THEME_STORAGE_KEY } from './data';
import type { Theme } from './types';

export { THEME_STORAGE_KEY };

/**
 * Deterministic "demo clock": starts at DEMO_EPOCH so the server render and the
 * first client render agree, then advances in real time after mount.
 */
export function useDemoClock(tickMs = 30_000) {
  const mountedAt = useRef<number | null>(null);
  const [now, setNow] = useState(DEMO_EPOCH);

  const read = useCallback(() => {
    if (mountedAt.current === null) return DEMO_EPOCH;
    return DEMO_EPOCH + (Date.now() - mountedAt.current);
  }, []);

  useEffect(() => {
    mountedAt.current = Date.now();
    const id = window.setInterval(() => setNow(read()), tickMs);
    return () => window.clearInterval(id);
  }, [read, tickMs]);

  return { now, read };
}

/** String state mirrored to localStorage; hydrates after mount to avoid SSR mismatch. */
export function usePersistentState<T extends string>(key: string, initial: T, allowed: readonly T[]) {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored && (allowed as readonly string[]).includes(stored)) setValue(stored as T);
    } catch {
      /* storage unavailable (private mode) — keep default */
    }
  }, [key, allowed]);

  const update = useCallback(
    (next: T) => {
      setValue(next);
      try {
        window.localStorage.setItem(key, next);
      } catch {
        /* ignore */
      }
    },
    [key],
  );

  return [value, update] as const;
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    setThemeState(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }, []);

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark');
  }, [setTheme]);

  return { theme, setTheme, toggleTheme };
}

/** Closes a popover on outside pointer-down or Escape. */
export function useDismiss<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return ref;
}

export function useIsMac() {
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/i.test(navigator.userAgent));
  }, []);
  return isMac;
}
