export type AreaVisual = {
  /** Icon chip on list rows. */
  iconWrap: string;
  /** Icon color on pastel cards and quick-log buttons. */
  iconText: string;
  /** Pastel card surface + border. */
  card: string;
  /** SVG stroke class for the progress ring. */
  ring: string;
  /** Start-timer label color. */
  actionText: string;
  /** Partial progress bar fill. */
  bar: string;
};

const GYM: AreaVisual = {
  iconWrap: "bg-indigo-50 text-indigo-500 dark:bg-indigo-500/15 dark:text-indigo-300",
  iconText: "text-indigo-600 dark:text-indigo-300",
  card: "border-indigo-100/50 bg-[#e0e7ff] dark:border-indigo-500/30 dark:bg-indigo-950",
  ring: "stroke-indigo-600 dark:stroke-indigo-400",
  actionText: "text-indigo-700 dark:text-indigo-200",
  bar: "bg-indigo-400",
};

const FRENCH: AreaVisual = {
  iconWrap: "bg-rose-50 text-rose-500 dark:bg-rose-500/15 dark:text-rose-300",
  iconText: "text-rose-600 dark:text-rose-300",
  card: "border-rose-100/50 bg-[#ffe4e6] dark:border-rose-500/30 dark:bg-rose-950",
  ring: "stroke-rose-600 dark:stroke-rose-400",
  actionText: "text-rose-700 dark:text-rose-200",
  bar: "bg-rose-400",
};

const WORK: AreaVisual = {
  iconWrap: "bg-amber-50 text-amber-500 dark:bg-amber-500/15 dark:text-amber-300",
  iconText: "text-amber-600 dark:text-amber-300",
  card: "border-amber-100/50 bg-[#fef3c7] dark:border-amber-500/30 dark:bg-amber-950",
  ring: "stroke-amber-500 dark:stroke-amber-400",
  actionText: "text-amber-700 dark:text-amber-200",
  bar: "bg-amber-400",
};

const MUSIC: AreaVisual = {
  iconWrap: "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-300",
  iconText: "text-emerald-600 dark:text-emerald-300",
  card: "border-emerald-100/50 bg-[#d1fae5] dark:border-emerald-500/30 dark:bg-emerald-950",
  ring: "stroke-emerald-500 dark:stroke-emerald-400",
  actionText: "text-emerald-700 dark:text-emerald-200",
  bar: "bg-emerald-400",
};

const FINANCES: AreaVisual = {
  iconWrap: "bg-blue-50 text-blue-500 dark:bg-blue-500/15 dark:text-blue-300",
  iconText: "text-blue-600 dark:text-blue-300",
  card: "border-blue-100/50 bg-[#dbeafe] dark:border-blue-500/30 dark:bg-blue-950",
  ring: "stroke-blue-500 dark:stroke-blue-400",
  actionText: "text-blue-700 dark:text-blue-200",
  bar: "bg-blue-400",
};

const AREA_VISUALS: Record<string, AreaVisual> = {
  health: GYM,
  career: WORK,
  learning: FRENCH,
  creativity: MUSIC,
  home: FINANCES,
  // Preserve colors for existing areas.
  gym: GYM,
  french: FRENCH,
  "work-career": WORK,
  music: MUSIC,
  finances: FINANCES,
  reading: {
    iconWrap: "bg-sky-50 text-sky-500 dark:bg-sky-500/15 dark:text-sky-300",
    iconText: "text-sky-600 dark:text-sky-300",
    card: "border-sky-100/50 bg-[#e0f2fe] dark:border-sky-500/30 dark:bg-sky-950",
    ring: "stroke-sky-500 dark:stroke-sky-400",
    actionText: "text-sky-700 dark:text-sky-200",
    bar: "bg-sky-400",
  },
  "admin-immigration": {
    iconWrap: "bg-violet-50 text-violet-500 dark:bg-violet-500/15 dark:text-violet-300",
    iconText: "text-violet-600 dark:text-violet-300",
    card: "border-violet-100/50 bg-[#ede9fe] dark:border-violet-500/30 dark:bg-violet-950",
    ring: "stroke-violet-500 dark:stroke-violet-400",
    actionText: "text-violet-700 dark:text-violet-200",
    bar: "bg-violet-400",
  },
  "side-projects": {
    iconWrap: "bg-orange-50 text-orange-500 dark:bg-orange-500/15 dark:text-orange-300",
    iconText: "text-orange-600 dark:text-orange-300",
    card: "border-orange-100/50 bg-[#ffedd5] dark:border-orange-500/30 dark:bg-orange-950",
    ring: "stroke-orange-500 dark:stroke-orange-400",
    actionText: "text-orange-700 dark:text-orange-200",
    bar: "bg-orange-400",
  },
  relationships: {
    iconWrap: "bg-pink-50 text-pink-500 dark:bg-pink-500/15 dark:text-pink-300",
    iconText: "text-pink-600 dark:text-pink-300",
    card: "border-pink-100/50 bg-[#fce7f3] dark:border-pink-500/30 dark:bg-pink-950",
    ring: "stroke-pink-500 dark:stroke-pink-400",
    actionText: "text-pink-700 dark:text-pink-200",
    bar: "bg-pink-400",
  },
};

AREA_VISUALS.social = AREA_VISUALS.relationships;

const FALLBACKS = [GYM, FRENCH, WORK, MUSIC, FINANCES];

export function getAreaVisual(slug: string): AreaVisual {
  const known = AREA_VISUALS[slug];
  if (known) return known;

  let hash = 0;
  for (const char of slug) hash = (hash + char.charCodeAt(0)) % FALLBACKS.length;
  return FALLBACKS[hash] ?? GYM;
}
