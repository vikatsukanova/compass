import { slugify } from "@/lib/format";

/** Build a URL-safe slug that does not collide with existing slugs. */
export function resolveUniqueSlug(name: string, takenSlugs: Set<string>): string {
  const base = slugify(name) || "area";
  if (!takenSlugs.has(base)) return base;

  let n = 2;
  while (takenSlugs.has(`${base}-${n}`)) {
    n += 1;
  }
  return `${base}-${n}`;
}
