"use client";

/**
 * Agenda strip — shows the next few events.
 *
 * v1: hardcoded placeholders.
 * v1.5 swap path: replace the array below with a fetch to Google Calendar API
 * (events.list with timeMin=now, maxResults=3, orderBy=startTime, singleEvents=true).
 * That requires OAuth + a GOOGLE_CALENDAR_API_KEY in the env.
 */

const events = [
  { time: "2:30p", title: "1:1 w/ Sarah" },
  { time: "4:00p", title: "Office hours" },
];

export default function AgendaStrip() {
  return (
    <div className="flex gap-4 items-center text-xs text-[var(--color-text-2)] flex-wrap">
      <span className="flex items-center gap-1.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        Today
      </span>
      {events.map((e, i) => (
        <span key={i} className="whitespace-nowrap">
          <span className="text-[var(--color-text)] font-medium">{e.time}</span>{" "}
          {e.title}
        </span>
      ))}
    </div>
  );
}
