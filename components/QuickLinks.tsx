"use client";

import { useState } from "react";
import { usePersistedState, type QuickLink } from "@/lib/storage";

const INITIAL_LINKS: QuickLink[] = [
  { id: "1", label: "Gmail", url: "https://mail.google.com" },
  { id: "2", label: "GitHub", url: "https://github.com" },
  { id: "3", label: "LeetCode", url: "https://leetcode.com" },
  { id: "4", label: "Notion", url: "https://notion.so" },
];

function ensureProtocol(url: string): string {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

export default function QuickLinks() {
  const [links, setLinks] = usePersistedState<QuickLink[]>("links", INITIAL_LINKS);
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  function add() {
    const l = label.trim();
    const u = url.trim();
    if (!l || !u) return;
    setLinks([
      ...links,
      { id: crypto.randomUUID(), label: l, url: ensureProtocol(u) },
    ]);
    setLabel("");
    setUrl("");
    setAdding(false);
  }

  function remove(id: string) {
    setLinks(links.filter((l) => l.id !== id));
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-3)] font-medium">
          Quick links
        </span>
        <button
          onClick={() => setAdding(!adding)}
          className="text-[var(--color-text-3)] hover:text-[var(--color-text)] transition-colors"
          aria-label={adding ? "Cancel" : "Add link"}
        >
          {adding ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          )}
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="flex gap-1.5 mb-3">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Label"
            className="flex-1"
          />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") add();
            }}
            placeholder="URL"
            className="flex-1"
          />
          <button
            onClick={add}
            className="px-3 rounded-md border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] text-xs"
          >
            Add
          </button>
        </div>
      )}

      {/* Scrollable tiles */}
      <div className="scroll-area max-h-[140px] -mr-2 pr-2">
        <div className="flex gap-2 flex-wrap">
          {links.map((link) => (
            <div
              key={link.id}
              className="group relative inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] rounded-md text-xs transition-colors"
            >
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="text-[var(--color-text)] hover:text-[var(--color-accent)]"
              >
                {link.label}
              </a>
              <button
                onClick={() => remove(link.id)}
                className="opacity-0 group-hover:opacity-100 text-[var(--color-text-3)] hover:text-[var(--color-text)] transition-opacity"
                aria-label="Remove"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
          {links.length === 0 && (
            <span className="text-xs text-[var(--color-text-3)]">
              No links yet. Click + to add one.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
