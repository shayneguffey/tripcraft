"use client";

/**
 * BookedBadge — compact green "Booked" pill or icon.
 *
 * Used on:
 *   • OptionTab (planning-page side panels) — small icon variant
 *   • Day card event row (DayCardView) — small icon variant
 *   • EventDetailPanel — full pill variant with text
 *
 * Variants:
 *   "icon"  → just the green checkmark, ~14px (default)
 *   "pill"  → green check + "BOOKED" text, for the detail panel header
 */

export default function BookedBadge({ variant = "icon" }) {
  if (variant === "pill") {
    return (
      <span
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold uppercase tracking-wide"
        title="This option is booked"
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        Booked
      </span>
    );
  }
  return (
    <svg
      className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0"
      fill="currentColor"
      viewBox="0 0 20 20"
      title="Booked"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
}
