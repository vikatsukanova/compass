import { firstNameFromDisplay, formatHeaderDate, getGreeting } from "@/lib/format";

type DashboardHeaderProps = {
  name?: string;
  demo?: boolean;
};

export function DashboardHeader({ name, demo = false }: DashboardHeaderProps) {
  const first = name ? firstNameFromDisplay(name) : "";
  const greeting = first ? `${getGreeting()}, ${first}!` : `${getGreeting()}!`;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{greeting} 👋</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        <time dateTime={new Date().toISOString().slice(0, 10)}>{formatHeaderDate()}</time>
        {demo && <span className="text-slate-400 dark:text-slate-500"> · Public demo</span>}
      </p>
    </div>
  );
}
