import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'rtr-theme';
const LIGHT_QUERY = '(prefers-color-scheme: light)';

/**
 * The webview reports the Reddit app or OS theme through prefers-color-scheme.
 * We follow it by default. Dark is the fallback when the query isn't supported,
 * since most Reddit app users run dark mode.
 */
export function systemTheme(): Theme {
  try {
    return window.matchMedia?.(LIGHT_QUERY).matches ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function readThemeOverride(): Theme | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

function writeThemeOverride(theme: Theme | null): void {
  try {
    if (theme) {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage can be blocked in some webviews. The toggle still works for this session.
  }
}

/** Without an override, CSS follows the media query on its own, so we leave the attribute off. */
export function applyTheme(override: Theme | null): void {
  const root = document.documentElement;
  if (override) {
    root.dataset.theme = override;
  } else {
    delete root.dataset.theme;
  }
}

/** Call once before the first render so there's no flash of the wrong theme. */
export function initTheme(): void {
  applyTheme(readThemeOverride());
}

export function useTheme(): { theme: Theme; toggle: () => void } {
  const [system, setSystem] = useState<Theme>(systemTheme);
  const [override, setOverride] = useState<Theme | null>(readThemeOverride);

  useEffect(() => {
    const query = window.matchMedia?.(LIGHT_QUERY);
    if (!query) {
      return;
    }
    const onChange = () => setSystem(query.matches ? 'light' : 'dark');
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    applyTheme(override);
  }, [override]);

  const theme = override ?? system;
  const toggle = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    // Landing back on the device theme clears the override, so we follow it again.
    const nextOverride = next === system ? null : next;
    writeThemeOverride(nextOverride);
    setOverride(nextOverride);
  }, [theme, system]);

  return { theme, toggle };
}

const RECAP_KEY = 'rtr-recap-dismissed';

export function readDismissedRecap(): string | null {
  try {
    return window.localStorage.getItem(RECAP_KEY);
  } catch {
    return null;
  }
}

export function writeDismissedRecap(dayId: string): void {
  try {
    window.localStorage.setItem(RECAP_KEY, dayId);
  } catch {
    // Fine to fall back to session-only dismissal.
  }
}
