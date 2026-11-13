import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{ week?: string }>;
};

/** `/dashboard` → `/` (Phase 9.2). Week param preserved for Phase 9.3 unified dashboard. */
export default async function DashboardRedirectPage({ searchParams }: PageProps) {
  const { week } = await searchParams;
  redirect(week ? `/?week=${encodeURIComponent(week)}` : "/");
}
