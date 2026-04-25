"use client";

/**
 * EventDetailPanel — inline-expand details for an option event row.
 *
 * Rendered below an OptionEventCard inside the same colored card on
 * DayCardView. Shows the "more info" that doesn't fit in the row:
 *   • Stay dates (accommodations)
 *   • Total price
 *   • Notes (inline-editable when canEdit; read-only otherwise; hidden
 *           when empty AND viewer can't edit)
 *   • Source URL + screenshot link
 *
 * Props:
 *   record   underlying option-table row (flights/activities/dining/
 *            transportation/accommodations) or activities row
 *   type     "flight" | "activity" | "dining" | "transportation"
 *            | "accommodation" | "dayEvent"
 *   canEdit  boolean
 *   onChange () => void  — called after notes save so the parent can refetch
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const TABLE_MAP = {
  flight: "flight_options",
  activity: "activity_options",
  dining: "dining_options",
  transportation: "transportation_options",
  accommodation: "accommodation_options",
  dayEvent: "activities",
};

function formatShortDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatTime12h(t) {
  if (!t) return "";
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  const hh = ((h + 11) % 12) + 1;
  const ampm = h < 12 ? "AM" : "PM";
  return `${hh}:${String(m).padStart(2, "0")} ${ampm}`;
}

function formatRange(record) {
  const start = record?.start_time || record?.departure_time;
  const end = record?.end_time || record?.arrival_time;
  if (!start) return "";
  if (!end) return formatTime12h(start);
  return `${formatTime12h(start)} – ${formatTime12h(end)}`;
}

export default function EventDetailPanel({ record, type, canEdit, onChange, isDraggable, align = "event" }) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(record?.notes || "");

  // Keep local draft in sync if record swaps underneath us.
  useEffect(() => { setNotesValue(record?.notes || ""); }, [record?.id, record?.notes]);

  // For flights, notes live on the parent option, not the leg.
  const recordId = type === "flight" ? record?._optionId : record?.id;
  const table = TABLE_MAP[type];

  async function saveNotes() {
    setEditingNotes(false);
    const newNotes = (notesValue || "").trim() || null;
    if (newNotes === (record?.notes || null)) return;
    if (!table || !recordId) return;
    await supabase.from(table).update({ notes: newNotes }).eq("id", recordId);
    onChange?.();
  }

  const hasNotes = !!record?.notes;
  const hasPrice = type !== "accommodation" && record?.total_price != null && record.total_price !== "";
  const hasStayDates = type === "accommodation" && record?.check_in_date && record?.check_out_date;
  const hasSource = record?.source_url || record?.screenshot_url;

  // Nothing to render and viewer can't edit — show a quiet placeholder.
  const hasAnyContent = hasNotes || hasPrice || hasStayDates || hasSource;
  // Empty spacers that mirror the row's left columns, so the panel
  // content lines up with the title column.
  //   "event"         → drag (optional) + time + dot
  //   "accommodation" → just dot (no drag, no time column)
  const Spacers = align === "accommodation" ? (
    <div className="w-2 flex-shrink-0" />
  ) : (
    <>
      {isDraggable && <div className="flex-shrink-0 w-3" />}
      <div className="flex-shrink-0 w-16" />
      <div className="w-2 flex-shrink-0" />
    </>
  );

  if (!canEdit && !hasAnyContent) {
    return (
      <div className="px-3 pt-2 pb-2 border-t border-stone-300/40 flex gap-2.5">
        {Spacers}
        <div className="flex-1 text-xs text-stone-400 italic">No additional details</div>
      </div>
    );
  }

  return (
    <div className="px-3 pt-2.5 pb-2.5 border-t border-stone-300/40 flex gap-2.5">
      {Spacers}
      <div className="flex-1 min-w-0 space-y-2">
      {(record?.start_time && record?.end_time) || (record?.departure_time && record?.arrival_time && type !== "flight") ? (
        <div className="flex items-baseline gap-2 text-xs">
          <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Time</span>
          <span className="text-stone-600">
            {formatRange(record)}
          </span>
        </div>
      ) : null}
      {hasStayDates && (
        <div className="flex items-baseline gap-2 text-xs">
          <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Stay</span>
          <span className="text-stone-600">
            {formatShortDate(record.check_in_date)} &ndash; {formatShortDate(record.check_out_date)}
          </span>
        </div>
      )}

      {hasPrice && (
        <div className="flex items-baseline gap-2 text-xs">
          <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Price</span>
          <span className="text-stone-600">${Number(record.total_price).toLocaleString()}</span>
        </div>
      )}

      {/* Notes — editable when canEdit, read-only when not. Hidden when empty AND not canEdit. */}
      {(canEdit || hasNotes) && (
        <div>
          <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-1">Notes</div>
          {canEdit && editingNotes ? (
            <textarea
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              onBlur={saveNotes}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setNotesValue(record?.notes || "");
                  setEditingNotes(false);
                }
              }}
              autoFocus
              rows={2}
              placeholder="Add notes..."
              className="w-full text-xs text-stone-600 bg-white border border-stone-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#da7b4a]/50 focus:border-transparent resize-none"
              onClick={(e) => e.stopPropagation()}
            />
          ) : canEdit ? (
            <div
              onClick={(e) => { e.stopPropagation(); setEditingNotes(true); }}
              className={`text-xs rounded-lg px-2 py-1.5 cursor-text border border-stone-200/60 min-h-[28px] transition-colors hover:border-stone-300 ${
                notesValue ? "text-stone-600" : "text-stone-300 italic"
              }`}
              title="Click to edit notes"
            >
              {notesValue || "Add notes..."}
            </div>
          ) : (
            <div className="text-xs text-stone-600 whitespace-pre-wrap leading-relaxed">{record.notes}</div>
          )}
        </div>
      )}

      {hasSource && (
        <div>
          <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-1">Sources</div>
          <div className="flex items-center gap-3">
            {record.source_url && (
              <a
                href={record.source_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-sky-600 hover:text-sky-800 hover:underline flex items-center gap-1 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 flex-shrink-0">
                  <path d="M8.914 6.025a.75.75 0 0 1 1.06 0 3.5 3.5 0 0 1 0 4.95l-2 2a3.5 3.5 0 0 1-5.396-4.402.75.75 0 0 1 1.251.827 2 2 0 0 0 3.085 2.514l2-2a2 2 0 0 0 0-2.828.75.75 0 0 1 0-1.06Z" />
                  <path d="M7.086 9.975a.75.75 0 0 1-1.06 0 3.5 3.5 0 0 1 0-4.95l2-2a3.5 3.5 0 0 1 5.396 4.402.75.75 0 0 1-1.251-.827 2 2 0 0 0-3.085-2.514l-2 2a2 2 0 0 0 0 2.828.75.75 0 0 1 0 1.06Z" />
                </svg>
                {(() => { try { return new URL(record.source_url).hostname.replace("www.", ""); } catch { return "Source"; } })()}
              </a>
            )}
            {record.screenshot_url && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const w = window.open();
                  if (w) {
                    w.document.write(`<html><head><title>Screenshot</title><style>body{margin:0;background:#1a1a1a;display:flex;align-items:center;justify-content:center;min-height:100vh;}</style></head><body><img src="${record.screenshot_url}" style="max-width:100%;max-height:100vh;object-fit:contain;"></body></html>`);
                    w.document.close();
                  }
                }}
                className="text-xs text-sky-600 hover:text-sky-800 hover:underline flex items-center gap-1 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 flex-shrink-0">
                  <path fillRule="evenodd" d="M2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Zm10.5 5.707a.5.5 0 0 0-.146-.353l-1-1a.5.5 0 0 0-.708 0l-1.5 1.5-2-2a.5.5 0 0 0-.707 0l-2 2A.5.5 0 0 0 5 10.707V12h8V9.707h-.5ZM7 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
                </svg>
                Screenshot
              </button>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
