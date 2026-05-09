"use client";

import { useEffect, useState } from "react";

/**
 * Storage abstraction layer.
 *
 * Today: backed by localStorage. Synchronous, single-device.
 *
 * To migrate to Supabase later:
 *   1. Make these methods async
 *   2. Replace the localStorage calls with supabase.from('...').select/upsert
 *   3. Update usePersistedState below to handle async loads (initial isLoading state)
 *   4. Components do NOT need to change (they go through this module)
 */

const NAMESPACE = "dashboard";

function key(k: string) {
  return `${NAMESPACE}:${k}`;
}

export const storage = {
  get<T>(k: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = window.localStorage.getItem(key(k));
      if (raw === null) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  set<T>(k: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key(k), JSON.stringify(value));
    } catch {
      // quota exceeded or disabled — silently fail
    }
  },

  remove(k: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key(k));
  },
};

/**
 * React hook: state synced to storage on every change.
 * Hydration-safe: starts with `defaultValue`, then loads from storage in useEffect.
 */
export function usePersistedState<T>(
  k: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(defaultValue);
  const [hydrated, setHydrated] = useState(false);

  // Load on mount
  useEffect(() => {
    setValue(storage.get<T>(k, defaultValue));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k]);

  // Persist on change (only after hydration to avoid overwriting with default)
  useEffect(() => {
    if (hydrated) storage.set(k, value);
  }, [k, value, hydrated]);

  return [value, setValue];
}

// ---- Domain types ----

export type Todo = {
  id: string;
  text: string;
  done: boolean;
  active: boolean;
};

export type QuickLink = {
  id: string;
  label: string;
  url: string;
};

export type PomodoroSettings = {
  workMin: number;
  shortMin: number;
  longMin: number;
  autoStart: boolean;
  soundOn: boolean;
};

export type Vibe = "lofi" | "focus" | "piano";

export const DEFAULT_SETTINGS: PomodoroSettings = {
  workMin: 25,
  shortMin: 5,
  longMin: 15,
  autoStart: false,
  soundOn: true,
};
