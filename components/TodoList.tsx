"use client";

import { useState } from "react";
import { type Todo } from "@/lib/storage";

type Props = {
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
};

export default function TodoList({ todos, setTodos }: Props) {
  const [input, setInput] = useState("");

  function add() {
    const text = input.trim();
    if (!text) return;
    setTodos([
      ...todos,
      { id: crypto.randomUUID(), text, done: false, active: false },
    ]);
    setInput("");
  }

  function toggleDone(id: string) {
    setTodos(
      todos.map((t) =>
        t.id === id ? { ...t, done: !t.done, active: t.done ? t.active : false } : t
      )
    );
  }

  function setActive(id: string) {
    setTodos(todos.map((t) => ({ ...t, active: t.id === id && !t.done })));
  }

  function remove(id: string) {
    setTodos(todos.filter((t) => t.id !== id));
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 flex flex-col h-full">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-3)] font-medium">
          To-do
        </span>
        <span className="text-[10px] text-[var(--color-text-3)] tabular-nums">
          {todos.filter((t) => !t.done).length} open
        </span>
      </div>

      {/* Scrollable list — fixed max height keeps card stable */}
      <ul className="scroll-area max-h-[260px] -mr-2 pr-2 flex-1">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="group flex items-center gap-2.5 py-1.5 border-b border-[var(--color-border)] last:border-0 text-sm"
          >
            <button
              onClick={() => toggleDone(todo.id)}
              className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                todo.done
                  ? "bg-[var(--color-text-2)] border-[var(--color-text-2)]"
                  : "border-[var(--color-border-strong)] hover:border-[var(--color-text-2)]"
              }`}
              aria-label="Toggle complete"
            >
              {todo.done && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--color-bg)" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>

            <span
              onClick={() => setActive(todo.id)}
              className={`flex-1 cursor-pointer ${
                todo.done
                  ? "line-through text-[var(--color-text-3)]"
                  : todo.active
                  ? "text-[var(--color-accent)] font-medium"
                  : ""
              }`}
            >
              {todo.text}
            </span>

            {!todo.done && (
              <button
                onClick={() => setActive(todo.id)}
                className={`p-1 rounded transition-opacity ${
                  todo.active
                    ? "opacity-100 text-[var(--color-accent)]"
                    : "opacity-0 group-hover:opacity-100 text-[var(--color-text-3)] hover:text-[var(--color-text)]"
                }`}
                aria-label="Set as active"
                title="Set as active task"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="12" cy="12" r="1" fill="currentColor" />
                </svg>
              </button>
            )}

            <button
              onClick={() => remove(todo.id)}
              className="p-1 opacity-0 group-hover:opacity-100 text-[var(--color-text-3)] hover:text-[var(--color-text)] transition-opacity"
              aria-label="Delete"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </li>
        ))}

        {todos.length === 0 && (
          <li className="text-xs text-[var(--color-text-3)] py-2">No tasks yet.</li>
        )}
      </ul>

      <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--color-border)]">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
          }}
          placeholder="Add task..."
          className="flex-1"
        />
        <button
          onClick={add}
          className="px-3 rounded-md border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] text-sm"
          aria-label="Add"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
