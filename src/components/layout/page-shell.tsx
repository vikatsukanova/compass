type PageShellProps = {
  children: React.ReactNode;
  /** Wider content area for dashboard (wireframe main column). */
  wide?: boolean;
  /** Fill available viewport height on desktop — no page scroll (dashboard only). */
  fitViewport?: boolean;
};

export function PageShell({ children, wide, fitViewport }: PageShellProps) {
  const classes = [
    wide ? "page-shell-dashboard" : "page-shell",
    fitViewport ? "dashboard-fit" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}

type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="page-header">
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </header>
  );
}

type SectionCardProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  muted?: boolean;
};

export function SectionCard({ title, subtitle, children, className = "", muted }: SectionCardProps) {
  return (
    <section className={`${muted ? "card-muted" : "card"} mt-8 ${className}`}>
      {title && <h2 className="section-title">{title}</h2>}
      {subtitle && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
      <div className={title || subtitle ? "mt-4" : undefined}>{children}</div>
    </section>
  );
}

type SectionBlockProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
};

export function SectionBlock({ title, subtitle, children, action }: SectionBlockProps) {
  return (
    <section className="mt-8">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}
