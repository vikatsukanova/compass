import { PageHeader, PageShell, SectionCard } from "@/components/layout/page-shell";
import { PomodoroSettingsForm } from "@/components/settings/pomodoro-settings-form";
import { ThemeSettings } from "@/components/settings/theme-settings";

export default function SettingsPage() {
  return (
    <PageShell>
      <PageHeader
        title="Settings"
        description="Customize your Pomodoro timer and app preferences."
      />

      <SectionCard title="Appearance" className="mt-8">
        <ThemeSettings />
      </SectionCard>

      <SectionCard title="Pomodoro timer">
        <PomodoroSettingsForm />
      </SectionCard>

      <SectionCard title="Integrations" className="mt-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Calendar sync, export, and other integrations are planned for a future phase.
        </p>
      </SectionCard>
    </PageShell>
  );
}
