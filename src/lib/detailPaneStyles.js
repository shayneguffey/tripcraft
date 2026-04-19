// ─────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH — Detail Pane Shared Styles
// ─────────────────────────────────────────────────────────────
// Every option detail panel imports label styles from here.
// Change a token once and it updates across all five modules,
// EditableNotes, MiniWeekCalendar, and any future detail UI.
// ─────────────────────────────────────────────────────────────

/** Uppercase section/field label above a value or group (e.g. "Address", "Duration", "Known for") */
export const LABEL = "text-xs text-slate-400 uppercase tracking-wide";

/** Same label followed by a bottom margin — use for section headings that precede a block of content */
export const LABEL_MB1 = "text-xs text-slate-400 uppercase tracking-wide mb-1";
export const LABEL_MB2 = "text-xs text-slate-400 uppercase tracking-wide mb-2";

export default { LABEL, LABEL_MB1, LABEL_MB2 };
