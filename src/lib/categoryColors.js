// ─────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH — Category Colors
// ─────────────────────────────────────────────────────────────
// Every component that needs a category color imports from here.
// If you change a color, it updates everywhere: calendar cells,
// day detail cards, option modules, budget charts, map pins,
// and any future UI that references these categories.
// ─────────────────────────────────────────────────────────────

const CATEGORY_COLORS = {
  flight: {
    // Emerald family
    hex:       "#10b981",   // emerald-500 — map pins, chart segments
    hexLight:  "#34d399",   // emerald-400 — chart bars
    bg:        "bg-emerald-50",
    bgMedium:  "bg-emerald-100",
    border:    "border-emerald-200",
    text:      "text-emerald-700",
    textDark:  "text-emerald-600",
    dot:       "bg-emerald-400",
    bar:       "bg-emerald-400",
    pill:      "bg-emerald-100 text-emerald-700",
    chart:     "#34d399",   // emerald-400
  },
  accommodation: {
    // Sky family
    hex:       "#0ea5e9",   // sky-500
    hexLight:  "#38bdf8",   // sky-400
    bg:        "bg-sky-50",
    bgMedium:  "bg-sky-100",
    border:    "border-sky-200",
    text:      "text-sky-700",
    textDark:  "text-sky-600",
    dot:       "bg-sky-400",
    bar:       "bg-sky-400",
    pill:      "bg-sky-100 text-sky-700",
    chart:     "#38bdf8",   // sky-400
  },
  activity: {
    // Amber/Yellow family
    hex:       "#eab308",   // yellow-500
    hexLight:  "#facc15",   // yellow-400
    bg:        "bg-yellow-50",
    bgMedium:  "bg-yellow-100",
    border:    "border-yellow-200",
    text:      "text-yellow-700",
    textDark:  "text-yellow-600",
    dot:       "bg-yellow-400",
    bar:       "bg-yellow-400",
    pill:      "bg-yellow-100 text-yellow-700",
    chart:     "#facc15",   // yellow-400
  },
  dining: {
    // Orange family
    hex:       "#f97316",   // orange-500
    hexLight:  "#fb923c",   // orange-400
    bg:        "bg-orange-50",
    bgMedium:  "bg-orange-100",
    border:    "border-orange-200",
    text:      "text-orange-700",
    textDark:  "text-orange-600",
    dot:       "bg-orange-400",
    bar:       "bg-orange-400",
    pill:      "bg-orange-100 text-orange-700",
    chart:     "#fb923c",   // orange-400
  },
  transportation: {
    // Violet family
    hex:       "#8b5cf6",   // violet-500
    hexLight:  "#a78bfa",   // violet-400
    bg:        "bg-violet-50",
    bgMedium:  "bg-violet-100",
    border:    "border-violet-200",
    text:      "text-violet-700",
    textDark:  "text-violet-600",
    dot:       "bg-violet-400",
    bar:       "bg-violet-400",
    pill:      "bg-violet-100 text-violet-700",
    chart:     "#a78bfa",   // violet-400
  },
  dayEvent: {
    // Stone family (user-created events)
    hex:       "#78716c",   // stone-500
    hexLight:  "#a8a29e",   // stone-400
    bg:        "bg-stone-50",
    bgMedium:  "bg-stone-100",
    border:    "border-stone-200",
    text:      "text-stone-600",
    textDark:  "text-stone-600",
    dot:       "bg-stone-400",
    bar:       "bg-stone-400",
    pill:      "bg-stone-100 text-stone-600",
    chart:     "#a8a29e",   // stone-400
  },
  misc: {
    // Slate family (other expenses, catch-all)
    hex:       "#64748b",   // slate-500
    hexLight:  "#94a3b8",   // slate-400
    bg:        "bg-slate-50",
    bgMedium:  "bg-slate-100",
    border:    "border-slate-200",
    text:      "text-slate-700",
    textDark:  "text-slate-600",
    dot:       "bg-slate-400",
    bar:       "bg-slate-400",
    pill:      "bg-slate-100 text-slate-700",
    chart:     "#94a3b8",   // slate-400
  },
};

// ── Aliases so components can use their own naming conventions ──
// "transport" is used by budget/map, "transportation" by page.js/options
CATEGORY_COLORS.transport = CATEGORY_COLORS.transportation;

export default CATEGORY_COLORS;
