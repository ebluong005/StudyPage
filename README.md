# Work / Study Dashboard

A single-tab dashboard for focus work: pomodoro timer, to-do list with session-aware tasks, notes scratchpad, YouTube background music, and customizable quick links. Plan mode shows everything; Focus mode strips the UI down to timer + active task + notes + music.

## Stack

- Next.js 15 (App Router) + React 19
- TypeScript
- Tailwind CSS v4
- localStorage for persistence (abstracted — see "Swap to Supabase" below)

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## File map

```
app/
  layout.tsx       # root layout, loads IBM Plex from Google Fonts
  page.tsx         # main page — owns mode + todos state, lays out everything
  globals.css      # Tailwind v4 theme tokens + base styles
components/
  ModeToggle.tsx   # Plan / Focus switch
  AgendaStrip.tsx  # Today's events (placeholder; swap to Calendar API later)
  Pomodoro.tsx     # Timer + settings panel (presets, sliders, toggles)
  TodoList.tsx     # Scrollable to-do list with active-task selection
  Notes.tsx        # Persisted scratchpad
  MusicPlayer.tsx  # YouTube embed with vibe presets
  QuickLinks.tsx   # Scrollable quick-link tiles, add/remove
lib/
  storage.ts       # storage abstraction + usePersistedState hook + types
```

## Where state lives

- **page.tsx** owns: current mode, todos array (the active task drives what the pomodoro displays)
- Each leaf component owns its own slice of persisted state via `usePersistedState`:
  - `Pomodoro` → settings (durations, autoStart, sound)
  - `Notes` → notes string
  - `MusicPlayer` → current vibe
  - `QuickLinks` → links array

## Customizing

**YouTube playlists / videos.** Edit `components/MusicPlayer.tsx`. The `VIBES` map at the top:

```ts
const VIBES = {
  lofi: { label: "Lofi", videoId: "jfKfPfyJRdk" },
  focus: { label: "Focus", videoId: "lTRiuFIWV54" },
  piano: { label: "Piano", videoId: "4oStw0r33so" },
};
```

`videoId` is the `v=...` chunk of any YouTube URL. For livestreams (like Lofi Girl) the same format works.

**Pomodoro presets.** Edit `PRESETS` at the top of `components/Pomodoro.tsx`. Each entry is `{ label, w, s, l }` for work / short break / long break in minutes.

**Default to-dos and quick links.** Edit `INITIAL_TODOS` in `app/page.tsx` and `INITIAL_LINKS` in `components/QuickLinks.tsx`. Once a user has saved their own data to localStorage, these are ignored on subsequent loads.

**Theme colors / fonts.** Edit `app/globals.css`. The `@theme { ... }` block defines all design tokens — change the accent, surfaces, text colors, or fonts there.

## Swap to Supabase later

When you outgrow localStorage (cross-device sync, multi-user, analytics):

1. `npm install @supabase/supabase-js`
2. Edit only `lib/storage.ts`:
   - Make `storage.get` / `set` / `remove` async
   - Replace localStorage calls with `supabase.from('user_data').select/upsert`
   - Update `usePersistedState` to handle async load (return `[value, setter, isLoading]`)
3. Components keep working — they only call `storage.*` and `usePersistedState`. You'll add `if (isLoading) return null` (or skeletons) where needed.

Schema for Supabase v1 can be a single `user_data` table with `(user_id, key, value jsonb)` and a unique index on `(user_id, key)`. Row-level security on `user_id = auth.uid()`. That's the entire migration in ~30 lines of SQL.

## Wiring up Google Calendar

Right now `AgendaStrip.tsx` shows hardcoded events. To wire the real thing:

1. Set up an OAuth client in Google Cloud Console (Web app, redirect URI to your domain)
2. Use `next-auth` or `@auth/core` with the Google provider, request the `https://www.googleapis.com/auth/calendar.readonly` scope
3. In `AgendaStrip.tsx`, fetch from `https://www.googleapis.com/calendar/v3/calendars/primary/events` with `timeMin=now`, `maxResults=3`, `orderBy=startTime`, `singleEvents=true`, passing the Google access token

Until you do that, the embed iframe is the simpler v1 — just drop the public calendar URL into an iframe in `AgendaStrip.tsx`.

## Known v1 tradeoffs

- **No long-press / drag-to-reorder on todos.** Add `@dnd-kit/core` if you want it.
- **Music in focus mode is a deliberate product call.** Edit `app/page.tsx` to wrap `MusicPlayer` in `{!isFocusMode && ...}` if you want to hide it.
- **Hidden TodoList means activeTask won't change in focus mode.** That's intentional — pick your task before going into focus.
- **Notifications API not wired.** Phase end plays a synthesized beep via Web Audio, but no system notification yet. Add `Notification.requestPermission()` triggered by a settings toggle.
- **No Supabase backups.** When the user clears browser data, everything is lost. Add an "Export JSON" / "Import JSON" pair to `Notes` or to a settings page if that's a concern before you migrate to a real backend.
