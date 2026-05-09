"use client";

import { usePersistedState, type Vibe } from "@/lib/storage";

/**
 * YouTube-only music player.
 *
 * Each vibe maps to a YouTube video/livestream ID. Replace these with whatever
 * you want — search YouTube, take the chunk after `v=` in the URL, paste here.
 *
 * Tip: livestreams (like Lofi Girl) are great for ambient because they never end.
 */
const VIBES: Record<Vibe, { label: string; videoId: string }> = {
  lofi: { label: "Lofi", videoId: "jfKfPfyJRdk" },         // Lofi Girl
  focus: { label: "Focus", videoId: "lTRiuFIWV54" },        // Coding Music
  piano: { label: "Piano", videoId: "4oStw0r33so" },        // Peaceful piano stream
};

export default function MusicPlayer() {
  const [vibe, setVibe] = usePersistedState<Vibe>("music:vibe", "lofi");

  const videoId = VIBES[vibe].videoId;

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-3)] font-medium">
          Music
        </span>
        <div className="flex gap-1">
          {(Object.keys(VIBES) as Vibe[]).map((v) => (
            <button
              key={v}
              onClick={() => setVibe(v)}
              className={`px-2.5 py-1 text-[11px] rounded transition-colors ${
                vibe === v
                  ? "bg-[var(--color-surface-3)] text-[var(--color-text)]"
                  : "text-[var(--color-text-2)] hover:text-[var(--color-text)]"
              }`}
            >
              {VIBES[v].label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-md overflow-hidden bg-black aspect-video">
        <iframe
          key={videoId}
          src={`https://www.youtube.com/embed/${videoId}`}
          title="Background music"
          allow="accelerometer; encrypted-media; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
}
