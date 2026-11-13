import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: { href: string; label: string };
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <p className="font-medium text-slate-800 dark:text-slate-100">{title}</p>
      {description && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      {action && (
        <Link href={action.href} className="btn-primary mt-4 inline-block">
          {action.label}
        </Link>
      )}
    </div>
  );
}
