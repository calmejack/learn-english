"use client";

import { Nav } from "./Nav";
import { ProgressProvider } from "@/hooks/ProgressProvider";
import { ThemeProvider } from "./ThemeProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ProgressProvider>
      <ThemeProvider>
        <div className="mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col px-4 pb-24 pt-4">
          {children}
        </div>
        <Nav />
      </ThemeProvider>
    </ProgressProvider>
  );
}
