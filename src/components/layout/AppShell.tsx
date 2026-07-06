import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
  bottomNav?: ReactNode;
};

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function AppShell({ children, bottomNav }: AppShellProps) {
  return (
    <main className="app-fabric min-h-screen pb-28 text-[var(--color-foreground)]">
      <div className="app-stack mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 pb-6 pt-5 sm:px-6 lg:px-8">
        {children}
      </div>
      {bottomNav}
    </main>
  );
}

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <header className="french-header surface-card flex flex-col gap-4 p-4 pt-6 sm:flex-row sm:items-end sm:justify-between sm:p-5 sm:pt-7">
      <div className="min-w-0">
        {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-primary)]">{eyebrow}</p> : null}
        <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
