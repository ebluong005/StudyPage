"use client";

export type Mode = "plan" | "focus";

type Props = {
  mode: Mode;
  onChange: (mode: Mode) => void;
};

export default function ModeToggle({ mode, onChange }: Props) {
  return (
    <div className="inline-flex p-[3px] gap-[2px] rounded-md bg-[var(--color-surface)]">
      <button
        onClick={() => onChange("plan")}
        className={`px-3 py-1.5 text-xs rounded-[5px] transition-colors flex items-center gap-1.5 ${
          mode === "plan"
            ? "bg-[var(--color-surface-3)] text-[var(--color-text)]"
            : "text-[var(--color-text-2)] hover:text-[var(--color-text)]"
        }`}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
        Plan
      </button>
      <button
        onClick={() => onChange("focus")}
        className={`px-3 py-1.5 text-xs rounded-[5px] transition-colors flex items-center gap-1.5 ${
          mode === "focus"
            ? "bg-[var(--color-surface-3)] text-[var(--color-text)]"
            : "text-[var(--color-text-2)] hover:text-[var(--color-text)]"
        }`}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
        </svg>
        Focus
      </button>
    </div>
  );
}
