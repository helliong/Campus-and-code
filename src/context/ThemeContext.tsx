"use client";

import { ReactNode, useEffect } from "react";
import { useThemeStore } from "@/store/themeStore";

function ThemeSync() {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return null;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <ThemeSync />
      {children}
    </>
  );
}

export const useTheme = useThemeStore;
