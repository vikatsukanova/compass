import { listTasks } from "@/actions/task";
import { listLifeAreas } from "@/actions/life-area";
import { PageHeader, PageShell, SectionBlock, SectionCard } from "@/components/layout/page-shell";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskList } from "@/components/tasks/task-list";

export default async function TasksPage() {
  const [areas, tasks] = await Promise.all([listLifeAreas(), listTasks()]);

  const areaOptions = areas.map((a) => ({ id: a.id, name: a.name }));

  return (
    <PageShell>
      <PageHeader
        title="Tasks"
        description="Open tasks tied to life areas. Urgent ones surface in Today's Focus."
      />

      <SectionCard title="New task">
        <TaskForm areas={areaOptions} />
      </SectionCard>

      <SectionBlock title="Your tasks">
        <TaskList tasks={tasks} areas={areaOptions} />
      </SectionBlock>
    </PageShell>
  );
}
