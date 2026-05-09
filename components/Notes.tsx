"use client";

import { usePersistedState } from "@/lib/storage";

export default function Notes() {
  const [notes, setNotes] = usePersistedState<string>("notes", "");

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
      <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-3)] font-medium mb-1.5">
        Notes
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Capture ideas without leaving the tab..."
        className="w-full min-h-[60px] !border-0 !p-0 !rounded-none text-sm leading-relaxed placeholder:text-[var(--color-text-3)]"
      />
    </div>
  );
}
