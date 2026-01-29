import { Sidebar } from "./Sidebar";
import { ReactNode } from "react";

export function Shell({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-4">
          {title && (
            <header className="flex items-center justify-between pb-2">
              <h1 className="text-3xl font-display font-bold text-foreground">{title}</h1>
            </header>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
