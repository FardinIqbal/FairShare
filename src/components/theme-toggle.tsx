"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="relative w-14 h-7 rounded-full border border-[var(--border)] bg-[var(--background-warm)]">
        <span className="absolute top-1 left-1 w-5 h-5 rounded-full bg-[var(--border)]" />
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group relative w-14 h-7 rounded-full border border-[var(--border)] bg-[var(--background-warm)] hover:border-[var(--gold)] transition-all duration-300"
      aria-label="Toggle theme"
    >
      {/* Track icons */}
      <span className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
        {/* Sun icon - left side */}
        <svg
          className={`w-3.5 h-3.5 transition-all duration-300 ${
            isDark ? "text-[var(--foreground-tertiary)]" : "text-[var(--gold)]"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
        {/* Moon icon - right side */}
        <svg
          className={`w-3.5 h-3.5 transition-all duration-300 ${
            isDark ? "text-[var(--gold)]" : "text-[var(--foreground-tertiary)]"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </span>

      {/* Knob */}
      <span
        className={`absolute top-0.5 w-6 h-6 rounded-full shadow-sm transition-all duration-300 ease-out ${
          isDark
            ? "left-[calc(100%-1.625rem)] bg-[var(--background-elevated)] border border-[var(--gold)]/30"
            : "left-0.5 bg-[var(--background-elevated)] border border-[var(--gold)]/50"
        } group-hover:shadow-[0_0_8px_rgba(181,135,43,0.3)]`}
      />
    </button>
  );
}
