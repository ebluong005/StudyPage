"use client";

import { useEffect, useRef, useState } from "react";
import { usePersistedState, DEFAULT_SETTINGS, type PomodoroSettings } from "@/lib/storage";

type Phase = "work" | "short" | "long";

type Props = {
  activeTaskText: string | null;
  isFocusMode: boolean;
};

const PHASE_LABEL: Record<Phase, string> = {
  work: "Work",
  short: "Break",
  long: "Long break",
};

const PRESETS = [
  { label: "Classic 25/5", w: 25, s: 5, l: 15 },
  { label: "Deep 50/10", w: 50, s: 10, l: 30 },
  { label: "Sprint 15/3", w: 15, s: 3, l: 15 },
];

function fmt(seconds: number) {
  const s = Math.max(0, Math.round(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function playBeep() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.value = 660;
    g.gain.value = 0.15;
    o.start();
    setTimeout(() => {
      o.stop();
      ctx.close();
    }, 220);
  } catch {
    // audio unsupported / blocked
  }
}

export default function Pomodoro({ activeTaskText, isFocusMode }: Props) {
  const [settings, setSettings] = usePersistedState<PomodoroSettings>(
    "pomodoro:settings",
    DEFAULT_SETTINGS
  );
  const [phase, setPhase] = useState<Phase>("work");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds accumulated when paused
  const [cycle, setCycle] = useState(0); // completed work sessions
  const [now, setNow] = useState(Date.now()); // tick driver
  const [showSettings, setShowSettings] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  const phaseDur =
    phase === "work" ? settings.workMin * 60 : phase === "short" ? settings.shortMin * 60 : settings.longMin * 60;

  const liveElapsed = running && startTimeRef.current !== null
    ? elapsed + (now - startTimeRef.current) / 1000
    : elapsed;
  const remaining = phaseDur - liveElapsed;

  // Tick driver
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  // Phase advance when timer hits zero
  useEffect(() => {
    if (!running) return;
    if (remaining > 0) return;
    if (settings.soundOn) playBeep();
    let nextCycle = cycle;
    let nextPhase: Phase;
    if (phase === "work") {
      nextCycle = cycle + 1;
      nextPhase = nextCycle % 4 === 0 ? "long" : "short";
    } else {
      nextPhase = "work";
    }
    setCycle(nextCycle);
    setPhase(nextPhase);
    setElapsed(0);
    if (settings.autoStart) {
      startTimeRef.current = Date.now();
    } else {
      startTimeRef.current = null;
      setRunning(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, running]);

  function startPause() {
    if (running) {
      setElapsed(elapsed + (Date.now() - (startTimeRef.current ?? Date.now())) / 1000);
      startTimeRef.current = null;
      setRunning(false);
    } else {
      startTimeRef.current = Date.now();
      setRunning(true);
    }
  }

  function reset() {
    setRunning(false);
    startTimeRef.current = null;
    setElapsed(0);
  }

  function skip() {
    let nextCycle = cycle;
    let nextPhase: Phase;
    if (phase === "work") {
      nextCycle = cycle + 1;
      nextPhase = nextCycle % 4 === 0 ? "long" : "short";
    } else {
      nextPhase = "work";
    }
    setCycle(nextCycle);
    setPhase(nextPhase);
    setElapsed(0);
    if (running) startTimeRef.current = Date.now();
  }

  function applyPreset(w: number, s: number, l: number) {
    setSettings({ ...settings, workMin: w, shortMin: s, longMin: l });
    setElapsed(0);
    if (running) startTimeRef.current = Date.now();
  }

  const matchingPreset = PRESETS.find(
    (p) => p.w === settings.workMin && p.s === settings.shortMin && p.l === settings.longMin
  );

  return (
    <div
      className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl flex flex-col items-center transition-all duration-300 ${
        isFocusMode ? "px-6 py-12" : "px-6 py-6"
      }`}
    >
      <div className="flex justify-between items-center w-full mb-2">
        <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-3)] font-medium">
          Pomodoro
        </span>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-1.5 rounded transition-colors ${
            showSettings
              ? "text-[var(--color-text)] bg-[var(--color-surface-2)]"
              : "text-[var(--color-text-3)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
          }`}
          aria-label="Settings"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      <div
        className={`font-mono font-medium tabular-nums tracking-tight transition-all duration-300 ${
          isFocusMode ? "text-7xl my-2" : "text-5xl my-2"
        }`}
      >
        {fmt(remaining)}
      </div>

      <div className="text-xs text-[var(--color-text-2)] text-center mb-4 min-h-[18px]">
        {activeTaskText ? (
          <>
            <span className="text-[var(--color-text-3)]">Working on:</span>{" "}
            <span className="text-[var(--color-text)] font-medium">{activeTaskText}</span>
          </>
        ) : (
          <>No active task — pick one from the list →</>
        )}
      </div>

      <div className="flex gap-2.5 items-center text-xs text-[var(--color-text-2)] mb-4">
        <span>{PHASE_LABEL[phase]}</span>
        <div className="flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${
                i < cycle % 4 ? "bg-[var(--color-accent)]" : "bg-[var(--color-border-strong)]"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={startPause}
          className="px-4 py-1.5 rounded-md bg-[var(--color-text)] text-[var(--color-bg)] text-sm font-medium hover:opacity-85 active:scale-95 transition flex items-center gap-1.5"
        >
          {running ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
              </svg>
              Pause
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Start
            </>
          )}
        </button>
        <button
          onClick={reset}
          className="px-3 py-1.5 rounded-md border border-[var(--color-border)] text-sm hover:bg-[var(--color-surface-2)] active:scale-95 transition"
          aria-label="Reset"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </button>
        <button
          onClick={skip}
          className="px-3 py-1.5 rounded-md border border-[var(--color-border)] text-sm hover:bg-[var(--color-surface-2)] active:scale-95 transition"
        >
          Skip
        </button>
      </div>

      {/* Settings panel */}
      <div
        className={`w-full overflow-hidden transition-all duration-300 ${
          showSettings ? "max-h-[400px] mt-5" : "max-h-0"
        }`}
      >
        <div className="pt-4 border-t border-[var(--color-border)]">
          <div className="flex gap-1.5 mb-3">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p.w, p.s, p.l)}
                className={`flex-1 px-2 py-1.5 text-[11px] rounded border transition-colors ${
                  matchingPreset?.label === p.label
                    ? "bg-[var(--color-surface-2)] border-[var(--color-border-strong)] text-[var(--color-text)]"
                    : "border-[var(--color-border)] text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <Slider
            label="Work"
            value={settings.workMin}
            min={1}
            max={60}
            onChange={(v) => setSettings({ ...settings, workMin: v })}
          />
          <Slider
            label="Short break"
            value={settings.shortMin}
            min={1}
            max={30}
            onChange={(v) => setSettings({ ...settings, shortMin: v })}
          />
          <Slider
            label="Long break"
            value={settings.longMin}
            min={1}
            max={60}
            onChange={(v) => setSettings({ ...settings, longMin: v })}
          />

          <ToggleRow
            label="Auto-start next phase"
            value={settings.autoStart}
            onChange={(v) => setSettings({ ...settings, autoStart: v })}
          />
          <ToggleRow
            label="Sound on phase end"
            value={settings.soundOn}
            onChange={(v) => setSettings({ ...settings, soundOn: v })}
          />
        </div>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="grid grid-cols-[80px_1fr_50px] items-center gap-2.5 mb-2 text-xs">
      <span className="text-[var(--color-text-2)]">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
      />
      <span className="text-right tabular-nums text-[var(--color-text)]">{value} min</span>
    </div>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex justify-between items-center py-1.5 text-xs text-[var(--color-text-2)]">
      <span>{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-7 h-4 rounded-full transition-colors ${
          value ? "bg-[var(--color-accent)]" : "bg-[var(--color-surface-3)]"
        }`}
        aria-label={`Toggle ${label}`}
      >
        <span
          className={`absolute top-[2px] w-3 h-3 bg-white rounded-full transition-all ${
            value ? "left-[14px]" : "left-[2px]"
          }`}
        />
      </button>
    </div>
  );
}
