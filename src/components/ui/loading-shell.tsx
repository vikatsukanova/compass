export function LoadingShell() {
  return (
    <div className="page-shell animate-pulse space-y-8">
      <div className="space-y-3">
        <div className="h-8 w-48 rounded-lg bg-slate-200" />
        <div className="h-4 w-full max-w-md rounded bg-slate-100 dark:bg-slate-800" />
      </div>
      <div className="card space-y-4">
        <div className="h-4 w-24 rounded bg-slate-200" />
        <div className="h-10 w-full rounded-xl bg-slate-100 dark:bg-slate-800" />
        <div className="h-10 w-full rounded-xl bg-slate-100 dark:bg-slate-800" />
        <div className="h-9 w-28 rounded-xl bg-slate-200" />
      </div>
      <div className="space-y-3">
        <div className="h-4 w-32 rounded bg-slate-200" />
        <div className="h-16 w-full rounded-xl bg-slate-100 dark:bg-slate-800" />
        <div className="h-16 w-full rounded-xl bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  );
}
