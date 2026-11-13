import { redirect } from "next/navigation";

/** `/log` → `/activities` (Phase 9.2). */
export default function LogRedirectPage() {
  redirect("/activities");
}
