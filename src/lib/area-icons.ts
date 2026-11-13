import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Briefcase,
  Circle,
  Dumbbell,
  FileText,
  Heart,
  House,
  Users,
  Languages,
  Lightbulb,
  Music,
  Wallet,
} from "lucide-react";

const AREA_ICONS: Record<string, LucideIcon> = {
  health: Dumbbell,
  career: Briefcase,
  learning: BookOpen,
  creativity: Lightbulb,
  home: House,
  social: Users,
  // Preserve icons for existing areas.
  gym: Dumbbell,
  french: Languages,
  music: Music,
  "work-career": Briefcase,
  finances: Wallet,
  "admin-immigration": FileText,
  "side-projects": Lightbulb,
  relationships: Heart,
  reading: BookOpen,
};

export function getAreaIcon(slug: string): LucideIcon {
  return AREA_ICONS[slug] ?? Circle;
}
