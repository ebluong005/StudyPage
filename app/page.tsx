"use client";

import { useState } from "react";
import ModeToggle, { type Mode } from "@/components/ModeToggle";
import AgendaStrip from "@/components/AgendaStrip";
import Pomodoro from "@/components/Pomodoro";
import TodoList from "@/components/TodoList";
import Notes from "@/components/Notes";
import MusicPlayer from "@/components/MusicPlayer";
import QuickLinks from "@/components/QuickLinks";
import { usePersistedState, type Todo } from "@/lib/storage";

const INITIAL_TODOS: Todo[] = [
  { id: "1", text: "Finish WAJ MVP scaffold", done: false, active: true },
  { id: "2", text: "Review PT127 LR section", done: false, active: false },
  { id: "3", text: "Apply to 3 SWE roles", done: true, active: false },
];

export default function HomePage() {
  const [mode, setMode] = useState<Mode>("plan");
  const [todos, setTodos] = usePersistedState<Todo[]>("todos", INITIAL_TODOS);

  const isFocusMode = mode === "focus";
  const activeTask = todos.find((t) => t.active && !t.done)?.text ?? null;

  return (
    <main className="min-h-screen px-6 py-8 max-w-[1200px] mx-auto">
      {/* Top bar */}
      <div className="flex justify-between items-center gap-4 mb-6 min-h-[32px]">
        <div className={isFocusMode ? "invisible" : ""}>
          <AgendaStrip />
        </div>
        <ModeToggle mode={mode} onChange={setMode} />
      </div>

      {/* Main grid: pomodoro + todo */}
      <div
        className={`grid gap-3 mb-3 transition-all duration-300 ${
          isFocusMode ? "grid-cols-1" : "grid-cols-1 md:grid-cols-[1.4fr_1fr]"
        }`}
      >
        <Pomodoro activeTaskText={activeTask} isFocusMode={isFocusMode} />
        {!isFocusMode && <TodoList todos={todos} setTodos={setTodos} />}
      </div>

      {/* Notes — visible in both modes */}
      <div className="mb-3">
        <Notes />
      </div>

      {/* Bottom: music + quick links */}
      <div
        className={`grid gap-3 transition-all duration-300 ${
          isFocusMode ? "grid-cols-1" : "grid-cols-1 md:grid-cols-[1.3fr_1fr]"
        }`}
      >
        <MusicPlayer />
        {!isFocusMode && <QuickLinks />}
      </div>
    </main>
  );
}
