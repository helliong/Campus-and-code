"use client";

import { create } from "zustand";

type Theme = "light" | "dark";

type ThemeState = {
  theme: Theme;
  initializeTheme: () => void;
  toggleTheme: () => void;
};

function applyTheme(theme: Theme) {
  document.body.classList.toggle("dark-theme", theme === "dark");
}

function getInitialTheme(): Theme {
  const savedTheme = localStorage.getItem("app-theme");
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "light",

  initializeTheme: () => {
    const theme = getInitialTheme();
    applyTheme(theme);
    set({ theme });
  },

  toggleTheme: () => {
    const nextTheme = get().theme === "light" ? "dark" : "light";
    localStorage.setItem("app-theme", nextTheme);
    applyTheme(nextTheme);
    set({ theme: nextTheme });
  },
}));
