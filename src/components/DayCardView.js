"use client";

/**
 * DayCardView — the shared day card.
 *
 * Rendered in two places:
 *   • Planning calendar popup (wrapped in a modal)   — src/app/trips/[id]/page.js
 *   • Pocket Guide day-by-day list (rendered inline) — src/app/guide/[token]/page.js
 *
 * Both callers build the same `calendarEvents` shape, pass `canEdit`, and give
 * us an `onRefresh` callback. All mutations (save title/notes, edit/delete
 * events, add event, reorder) live here so design and behavior changes in
 * one surface automatically reach the other.
 *
 * Props:
 *   dateKey        "YYYY-MM-DD"
 *   tripStart      "YYYY-MM-DD" | null   — for computing DAY N
 *   inRange        boolean                — is this date inside the trip window
 *   dayData        days row | null        — null means no row exists yet
 *   userActivities activities[]           — rows from the `activities` table for this day
 *   calendarEvents { flights[], activities[], dining[], transport[], accommodations[] }
 *   canEdit        boolean
 *   tripId         number                 — needed for inserting days rows
 *   itineraryId    number | null
 *   onClose        () => void | undefined — if provided, render a close button (modal usage)
 *   onRefresh      () => void              — called after any mutation so the caller can refetch
 */

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import CATEGORY_COLORS from "@/lib/categoryColors";
import CategoryIcon from "@/components/CategoryIcon";
import TimeSelectPopup, {
  to12h,
  to24h,
  formatTime12h as formatTime12hShared,
} from "@/components/TimeSelectPopup";
import EventDetailPanel from "@/components/EventDetailPanel";
import BookedBadge from "@/components/BookedBadge";
import OptionPicker from "@/components/OptionPicker";
import DayJournal from "@/components/DayJournal";

/* ── Helpers ───────────────────────────────────────────────────────── */

function mapsSearchUrl(query) {
  if (!query) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function computeDayNumber(dateKey, tripStart, inRange) {
  if (!tripStart || !inRange) return null;
  const start = new Date(tripStart + "T00:00:00");
  const current = new Date(dateKey + "T00:00:00");
  return Math.round((current - start) / (1000 * 60 * 60 * 24)) + 1;
}

function formatDay(dateKey) {
  const d = new Date(dateKey + "T00:00:00");
  return {
    dayOfWeek: d.toLocaleDateString("en-US", { weekday: "long" }),
    dateFormatted: d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
  };
}

const COLOR_MAP = {
  flight:         { bg: CATEGORY_COLORS.flight.bg,         border: CATEGORY_COLORS.flight.border,         text: CATEGORY_COLORS.flight.text,         dot: CATEGORY_COLORS.flight.dot },
  activity:       { bg: CATEGORY_COLORS.activity.bg,       border: CATEGORY_COLORS.activity.border,       text: CATEGORY_COLORS.activity.text,       dot: CATEGORY_COLORS.activity.dot },
  dining:         { bg: CATEGORY_COLORS.dining.bg,         border: CATEGORY_COLORS.dining.border,         text: CATEGORY_COLORS.dining.text,         dot: CATEGORY_COLORS.dining.dot },
  transportation: { bg: CATEGORY_COLORS.transportation.bg, border: CATEGORY_COLORS.transportation.border, text: CATEGORY_COLORS.transportation.text, dot: CATEGORY_COLORS.transportation.dot },
  accommodation:  { bg: CATEGORY_COLORS.accommodation.bg,  border: CATEGORY_COLORS.accommodation.border,  text: CATEGORY_COLORS.accommodation.text,  dot: CATEGORY_COLORS.accommodation.dot },
};

/* ══════════════════════════════════════════════════════════════════
   DayCardView — the main component
   ══════════════════════════════════════════════════════════════════ */

export default function DayCardView({
  dateKey,
  tripStart,
  inRange,
  dayData,
  userActivities = [],
  calendarEvents,
  canEdit,
  tripId,
  itineraryId,
  onClose,
  onRefresh,
  showJournal = false,
}) {
  const [title, setTitle] = useState(dayData?.title || "");
  const [editingTitle, setEditingTitle] = useState(false);
  const [notes, setNotes] = useState(dayData?.notes || "");
  const [editingNotes, setEditingNotes] = useState(false);
  const [addingEvent, setAddingEvent] = useState(null); // null | "custom" | "option"
  const [dragIndex, setDragIndex] = useState(null);
  const [expandedKey, setExpandedKey] = useState(null);

  // Keep local state in sync when the underlying dayData reloads.
  useEffect(() => { setTitle(dayData?.title || ""); }, [dayData?.title, dayData?.id]);
  useEffect(() => { setNotes(dayData?.notes || ""); }, [dayData?.notes, dayData?.id]);

  const { dayOfWeek, dateFormatted } = formatDay(dateKey);
  const dayNumber = computeDayNumber(dateKey, tripStart, inRange);

  /* ── Mutations ──────────────────────────────────────────────────── */

  async function ensureDayExists() {
    if (dayData?.id) return dayData.id;
    const { data: inserted } = await supabase
      .from("days")
      .insert({
        trip_id: tripId,
        date: dateKey,
        title: title || null,
        notes: notes || null,
        itinerary_id: itineraryId || null,
      })
      .select()
      .single();
    return inserted?.id;
  }

  async function handleSaveTitle() {
    setEditingTitle(false);
    if (dayData?.id) {
      await supabase.from("days").update({ title: title || null }).eq("id", dayData.id);
    } else if (title.trim()) {
      await supabase.from("days").insert({
        trip_id: tripId,
        date: dateKey,
        title: title || null,
        notes: notes || null,
        itinerary_id: itineraryId || null,
      });
    }
    onRefresh?.();
  }

  async function handleSaveNotes() {
    setEditingNotes(false);
    if (dayData?.id) {
      await supabase.from("days").update({ notes: notes || null }).eq("id", dayData.id);
    } else if (notes.trim()) {
      await supabase.from("days").insert({
        trip_id: tripId,
        date: dateKey,
        title: title || null,
        notes: notes || null,
        itinerary_id: itineraryId || null,
      });
    }
    onRefresh?.();
  }

  async function saveNewEvent(data) {
    if (!data || !data.title.trim()) {
      setAddingEvent(null);
      return;
    }
    const dayId = await ensureDayExists();
    if (!dayId) { setAddingEvent(null); return; }
    await supabase.from("activities").insert({
      day_id: dayId,
      title: data.title.trim(),
      start_time: data.start_time || null,
      end_time: data.end_time || null,
      location: data.location || null,
      category: "other",
      notes: data.notes || null,
      sort_order: userActivities.length,
    });
    setAddingEvent(null);
    onRefresh?.();
  }

  // Remove an option event from this itinerary. For flexible categories
  // (activity / dining) we also clear scheduled_date so the option can be
  // re-picked from the picker afterwards (the picker hides options whose date
  // matches THIS day).
  async function handleRemoveFromItinerary(optionType, optionId) {
    if (!itineraryId || !optionId) return;
    await supabase
      .from("itinerary_selections")
      .delete()
      .eq("itinerary_id", itineraryId)
      .eq("option_type", optionType)
      .eq("option_id", optionId);
    if (optionType === "activity") {
      await supabase.from("activity_options").update({ scheduled_date: null }).eq("id", optionId);
    } else if (optionType === "dining") {
      await supabase.from("dining_options").update({ scheduled_date: null }).eq("id", optionId);
    }
    setExpandedKey(null);
    onRefresh?.();
  }

  async function handleUpdateActivity(activityId, updates) {
    await supabase.from("activities").update(updates).eq("id", activityId);
    onRefresh?.();
  }

  async function handleDeleteActivity(activityId) {
    await supabase.from("activities").delete().eq("id", activityId);
    onRefresh?.();
  }

  async function handleOptionTimeChange(table, recordId, timeField, newTime, endTimeField, newEndTime) {
    const updates = { [timeField]: newTime || null };
    if (endTimeField) updates[endTimeField] = newEndTime || null;
    await supabase.from(table).update(updates).eq("id", recordId);
    onRefresh?.();
  }

  async function handleUntimedReorder(fromIdx, toIdx, items) {
    if (fromIdx === toIdx) return;
    const reordered = [...items];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const newOrder = reordered.map((item) => item.sortKey);
    const dayId = await ensureDayExists();
    if (!dayId) return;
    await supabase.from("days").update({ untimed_order: newOrder }).eq("id", dayId);
    onRefresh?.();
  }

  /* ── Build the unified event list ──────────────────────────────── */

  // Sort user activities: untimed first (by sort_order), then timed chronologically
  const sortedUserActivities = [...userActivities].sort((a, b) => {
    const aTime = a.start_time || null;
    const bTime = b.start_time || null;
    if (aTime && bTime) return aTime.localeCompare(bTime);
    if (!aTime && !bTime) return (a.sort_order || 0) - (b.sort_order || 0);
    if (!aTime) return -1;
    return 1;
  });

  const itineraryEvents = [];
  const accommodationEvents = [];

  if (calendarEvents) {
    (calendarEvents.flights || []).forEach((f) => {
      itineraryEvents.push({
        type: "flight",
        time: f.departure_time?.slice(0, 5),
        endTime: f.arrival_time?.slice(0, 5),
        name: `${f.departure_airport || ""} \u2192 ${f.arrival_airport || ""}`,
        detail: f.airline_name || f.airline_code || "",
        address: null,
        _record: f,
        _table: "flights",
        _timeField: "departure_time",
        _endTimeField: "arrival_time",
      });
    });
    (calendarEvents.activities || []).forEach((a) => {
      itineraryEvents.push({
        type: "activity",
        time: a.start_time?.slice(0, 5),
        endTime: a.end_time?.slice(0, 5),
        name: a.name,
        detail: "",
        address: a.address || a.location || a.location_name || null,
        _record: a,
        _table: "activity_options",
        _timeField: "start_time",
        _endTimeField: "end_time",
      });
    });
    (calendarEvents.dining || []).forEach((d) => {
      itineraryEvents.push({
        type: "dining",
        time: d.start_time?.slice(0, 5),
        endTime: d.end_time?.slice(0, 5),
        name: d.name,
        detail: (d.cuisine_type && d.cuisine_type.toLowerCase() !== "other") ? d.cuisine_type : "",
        address: d.address || d.location || d.location_name || null,
        _record: d,
        _table: "dining_options",
        _timeField: "start_time",
        _endTimeField: "end_time",
      });
    });
    (calendarEvents.transport || []).forEach((t) => {
      // Mode-aware secondary detail in the collapsed row.
      // Trains / buses / ferries: prefer the vehicle identifier (train number,
      // vessel name) since that’s how travelers refer to them. Otherwise
      // fall back to the broad vehicle_type ("SUV", "Sedan").
      const detailBits = [];
      if (t.vehicle_id) detailBits.push(t.vehicle_id);
      if (detailBits.length === 0 && t.vehicle_type) detailBits.push(t.vehicle_type);
      itineraryEvents.push({
        type: "transportation",
        time: t.departure_time?.slice(0, 5),
        endTime: t.arrival_time?.slice(0, 5),
        name: t.name,
        detail: detailBits.join(" · "),
        address: null,
        _record: t,
        _table: "transportation_options",
        _timeField: "departure_time",
        _endTimeField: "arrival_time",
      });
    });
    (calendarEvents.accommodations || []).forEach((a) => {
      accommodationEvents.push({
        type: "accommodation",
        name: a.name,
        detail: "",
        address: a.address || a.location || a.location_name || null,
        _record: a,
      });
    });
  }

  // Merge option events + user activities into one ordered list.
  const allDayEvents = [];
  itineraryEvents.forEach((evt, i) => {
    const stableKey = evt._record?.id ? `${evt.type}-${evt._record.id}` : `itin-${i}`;
    allDayEvents.push({ kind: "option", ...evt, sortTime: evt.time || null, sortKey: stableKey });
  });
  sortedUserActivities.forEach((a) => {
    allDayEvents.push({ kind: "user", activity: a, sortTime: a.start_time?.slice(0, 5) || null, sortKey: `user-${a.id}` });
  });

  const savedOrder = dayData?.untimed_order;
  let allDayEventsSorted;
  if (savedOrder && Array.isArray(savedOrder) && savedOrder.length > 0) {
    const ordered = [];
    const remaining = [...allDayEvents];
    for (const key of savedOrder) {
      const idx = remaining.findIndex((e) => e.sortKey === key);
      if (idx !== -1) ordered.push(remaining.splice(idx, 1)[0]);
    }
    const unseenUntimed = remaining.filter((e) => !e.sortTime);
    const unseenTimed = remaining.filter((e) => e.sortTime).sort((a, b) => a.sortTime.localeCompare(b.sortTime));
    allDayEventsSorted = [...ordered, ...unseenUntimed, ...unseenTimed];
  } else {
    const untimedEvents = allDayEvents.filter((e) => !e.sortTime);
    const timedEvents = allDayEvents.filter((e) => e.sortTime).sort((a, b) => a.sortTime.localeCompare(b.sortTime));
    allDayEventsSorted = [...untimedEvents, ...timedEvents];
  }

  /* ── Render ─────────────────────────────────────────────────────── */

  return (
    <>
      {/* Header — warm parchment */}
      <div
        className="px-5 pt-5 pb-3 border-b border-stone-200/60 rounded-t-2xl sticky top-0 z-10"
        style={{ background: "rgba(222,210,190,0.5)" }}
      >
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-3 text-stone-400 hover:text-stone-600 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Day count + date info */}
        <div className="flex items-center gap-2.5">
          {dayNumber && (
            <div className="text-2xl font-bold text-[#da7b4a] whitespace-nowrap leading-none">DAY {dayNumber}</div>
          )}
          <div>
            <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide leading-tight">{dayOfWeek}</div>
            <div className="text-[11px] text-stone-400 leading-tight">{dateFormatted}</div>
            {!inRange && (
              <span className="text-[10px] text-amber-600 font-medium">Outside trip dates</span>
            )}
          </div>
        </div>

        {/* Inline editable Day Title */}
        <div className="mt-1.5 flex items-center min-h-[32px]">
          {editingTitle && canEdit ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => { if (e.key === "Enter") handleSaveTitle(); if (e.key === "Escape") setEditingTitle(false); }}
              autoFocus
              placeholder="Add a title for this day..."
              className="w-full text-2xl font-bold text-stone-800 bg-white border border-stone-300 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#da7b4a]/50 focus:border-transparent"
            />
          ) : (
            <div
              onClick={canEdit ? () => setEditingTitle(true) : undefined}
              className={`w-full text-2xl font-bold py-0.5 rounded-lg transition-colors border border-transparent ${
                title ? "text-stone-700" : "text-stone-400 italic text-base"
              } ${canEdit ? "cursor-text hover:text-[#da7b4a]" : ""}`}
              title={canEdit ? "Click to edit day title" : undefined}
            >
              {title ? title.toUpperCase() : (canEdit ? "Add a title for this day..." : "")}
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-4 space-y-4">
        {/* Day Itinerary section */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <svg className="w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium text-stone-400 uppercase tracking-wide">Day Itinerary</span>
          </div>

          <div className="space-y-1.5">
            {allDayEventsSorted.map((item, eventIdx) => {
              const dragProps = canEdit
                ? {
                    draggable: true,
                    onDragStart: (e) => { e.dataTransfer.effectAllowed = "move"; setDragIndex(eventIdx); },
                    onDragOver: (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; },
                    onDrop: (e) => { e.preventDefault(); handleUntimedReorder(dragIndex, eventIdx, allDayEventsSorted); setDragIndex(null); },
                    onDragEnd: () => setDragIndex(null),
                  }
                : {};

              const dragClass = canEdit
                ? `cursor-grab active:cursor-grabbing ${dragIndex === eventIdx ? "opacity-50" : ""}`
                : "";

              if (item.kind === "option") {
                const c = COLOR_MAP[item.type] || COLOR_MAP.activity;
                const canEditTime = canEdit && item.type !== "flight" && item._record && item._table && item._timeField;
                const isExpanded = expandedKey === item.sortKey;
                return (
                  <div key={item.sortKey} {...dragProps} className={dragClass}>
                    <OptionEventCard
                      item={item}
                      colors={c}
                      canEditTime={canEditTime}
                      onTimeChange={canEditTime ? (newTime, newEndTime) => handleOptionTimeChange(item._table, item._record.id, item._timeField, newTime, item._endTimeField, newEndTime) : undefined}
                      isDraggable={canEdit}
                      expanded={isExpanded}
                      onToggleExpand={() => setExpandedKey(isExpanded ? null : item.sortKey)}
                      canEdit={canEdit}
                      onRefresh={onRefresh}
                      onRemove={canEdit ? () => {
                        const id = item.type === "flight" ? item._record?._optionId : item._record?.id;
                        if (id) handleRemoveFromItinerary(item.type, id);
                      } : undefined}
                    />
                  </div>
                );
              } else {
                return (
                  <div key={item.sortKey} {...dragProps} className={dragClass}>
                    <UserEventCard
                      activity={item.activity}
                      onUpdate={canEdit ? (updates) => handleUpdateActivity(item.activity.id, updates) : undefined}
                      onDelete={canEdit ? () => handleDeleteActivity(item.activity.id) : undefined}
                      isDraggable={canEdit}
                      readOnly={!canEdit}
                    />
                  </div>
                );
              }
            })}

            {addingEvent === "custom" && canEdit && (
              <NewEventCard onSave={(data) => saveNewEvent(data)} onCancel={() => setAddingEvent(null)} />
            )}

            {addingEvent === "option" && canEdit && (
              <OptionPicker
                tripId={tripId}
                dateKey={dateKey}
                itineraryId={itineraryId}
                onPicked={() => { setAddingEvent(null); onRefresh?.(); }}
                onCancel={() => setAddingEvent(null)}
              />
            )}

            {allDayEventsSorted.length === 0 && !addingEvent && accommodationEvents.length === 0 && (
              <p className="text-sm text-stone-400 italic">{canEdit ? "No events yet" : "Free day"}</p>
            )}

            {canEdit && !addingEvent && (
              <div className="flex gap-2">
                <button
                  onClick={() => setAddingEvent("custom")}
                  className="flex-1 border-2 border-dashed border-stone-300 text-stone-400 text-sm font-medium rounded-lg py-2.5 hover:border-[#da7b4a]/50 hover:text-[#da7b4a] transition-colors"
                  title="Add a one-off event for this day"
                >
                  + Custom Event
                </button>
                <button
                  onClick={() => setAddingEvent("option")}
                  className="flex-1 border-2 border-dashed border-stone-300 text-stone-400 text-sm font-medium rounded-lg py-2.5 hover:border-[#da7b4a]/50 hover:text-[#da7b4a] transition-colors"
                  title="Schedule an existing activity, dining, or transport option"
                >
                  + Itinerary Option
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Accommodations */}
        {accommodationEvents.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <CategoryIcon kind="accommodation" size={14} className="text-stone-400" />
              <span className="text-xs font-medium text-stone-400 uppercase tracking-wide">Accommodations</span>
            </div>
            <div className="space-y-1.5">
              {accommodationEvents.map((evt, i) => {
                const c = COLOR_MAP.accommodation;
                const accomKey = evt._record?.id ? `accom-${evt._record.id}` : `accom-${i}`;
                const isExpanded = expandedKey === accomKey;
                const onToggle = () => setExpandedKey(isExpanded ? null : accomKey);
                return (
                  <div key={accomKey} className={`${c.bg} border ${c.border} rounded-lg overflow-hidden group`}>
                    <div
                      className="flex items-start gap-2.5 px-3 py-2 cursor-pointer"
                      onClick={onToggle}
                      title={isExpanded ? "Click to collapse" : "Click to expand for more details"}
                    >
                      <div className={`w-2 h-2 rounded-full ${c.dot} flex-shrink-0 mt-[5px]`} />
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-medium ${c.text}`}>{evt.name}</span>
                        {evt._record?.booked && <span className="inline-flex align-middle ml-1.5"><BookedBadge variant="icon" /></span>}
                        {evt.detail && (
                          <span className="text-xs text-stone-400 ml-2">{evt.detail}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onToggle(); }}
                        className={`flex-shrink-0 mt-0.5 text-stone-400 hover:text-stone-600 transition-all ${isExpanded ? "rotate-180" : ""}`}
                        title={isExpanded ? "Collapse" : "Expand for more details"}
                        aria-label={isExpanded ? "Collapse details" : "Expand details"}
                        aria-expanded={isExpanded}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {canEdit && evt._record?.id && (
                        <AccomRemoveButton onRemove={() => handleRemoveFromItinerary("accommodation", evt._record.id)} />
                      )}
                    </div>
                    {isExpanded && (
                      <EventDetailPanel
                        record={evt._record}
                        type="accommodation"
                        canEdit={!!canEdit}
                        onChange={onRefresh}
                        align="accommodation"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Notes */}
        {(notes || canEdit) && (
          <div className="pt-2 border-t border-stone-100">
            {editingNotes && canEdit ? (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={handleSaveNotes}
                onKeyDown={(e) => { if (e.key === "Escape") { setEditingNotes(false); setNotes(dayData?.notes || ""); } }}
                autoFocus
                rows={3}
                placeholder="Add notes for this day..."
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#da7b4a]/50 focus:border-transparent text-sm text-stone-700 bg-white resize-none"
              />
            ) : (
              <div
                onClick={canEdit ? () => setEditingNotes(true) : undefined}
                className={`text-sm px-3 py-2 rounded-lg transition-colors min-h-[40px] border ${canEdit ? "border-stone-300 cursor-text" : "border-transparent"} ${
                  notes ? "text-stone-600" : "text-stone-400 italic"
                } ${canEdit && notes ? "hover:text-[#da7b4a]" : canEdit ? "hover:text-[#da7b4a]" : ""}`}
                title={canEdit ? "Click to edit notes" : undefined}
              >
                {notes || (canEdit ? "Add notes for this day..." : "")}
              </div>
            )}
          </div>
        )}

        {/* Travel journal — Pocket Guide only, never on the calendar popup */}
        {showJournal && (
          <DayJournal tripId={tripId} dateKey={dateKey} dayId={dayData?.id || null} />
        )}
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
   OptionEventCard — option-module event row (with optional time edit)

   Wraps a clickable row + optional <EventDetailPanel> in a single colored
   card. Clicking the body (anywhere not on a control) or the chevron
   toggles the inline expand. Quick controls (time, address, drag handle)
   keep their own click handlers via stopPropagation.
   ══════════════════════════════════════════════════════════════════ */

export function OptionEventCard({
  item,
  colors: c,
  canEditTime,
  onTimeChange,
  isDraggable,
  expanded,
  onToggleExpand,
  canEdit,
  onRefresh,
  onRemove,
}) {
  const [showPopup, setShowPopup] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const isTransport = item.type === "transportation";
  const startLabel = isTransport ? "Depart" : "Start";
  const endLabel = isTransport ? "Arrive" : "End";

  return (
    <div className={`${c.bg} border ${c.border} rounded-lg group overflow-hidden`}>
      <div
        className={`flex items-start gap-2.5 px-3 py-2 ${onToggleExpand ? "cursor-pointer" : ""}`}
        onClick={onToggleExpand}
        title={onToggleExpand ? (expanded ? "Click to collapse" : "Click to expand for more details") : undefined}
      >
        {isDraggable && (
          <div
            className="flex-shrink-0 mt-1 text-stone-300 cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-3 h-3" viewBox="0 0 10 10" fill="currentColor">
              <circle cx="3" cy="2" r="1" /><circle cx="7" cy="2" r="1" />
              <circle cx="3" cy="5" r="1" /><circle cx="7" cy="5" r="1" />
              <circle cx="3" cy="8" r="1" /><circle cx="7" cy="8" r="1" />
            </svg>
          </div>
        )}

        {/* Time */}
        <div className="relative flex-shrink-0 w-16 mt-0.5">
          {canEditTime ? (
            <>
              {item.time ? (
                <span
                  onClick={(e) => { e.stopPropagation(); setShowPopup(true); }}
                  className="text-xs text-stone-500 cursor-pointer hover:text-[#da7b4a] transition-colors"
                  title="Click to edit time"
                >
                  {formatTime12hShared(item.time)}
                      </span>
              ) : (
                <span
                  onClick={(e) => { e.stopPropagation(); setShowPopup(true); }}
                  className="text-xs text-stone-400 cursor-pointer opacity-0 group-hover:opacity-100 hover:text-[#da7b4a] transition-all"
                >
                  + time
                </span>
              )}
              {showPopup && (
                <TimeSelectPopup
                  startTime={to12h(item.time)}
                  endTime={to12h(item.endTime)}
                  startLabel={startLabel}
                  endLabel={endLabel}
                  showEndTime={true}
                  useFixed={true}
                  onSave={(start24, end24) => { setShowPopup(false); if (onTimeChange) onTimeChange(start24, end24); }}
                  onClear={() => { setShowPopup(false); if (onTimeChange) onTimeChange(null, null); }}
                  onClose={() => setShowPopup(false)}
                />
              )}
            </>
          ) : item.time ? (
            <span className="text-xs text-stone-500">
              {formatTime12hShared(item.time)}
              </span>
          ) : <span />}
        </div>

        <div className={`w-2 h-2 rounded-full ${c.dot} flex-shrink-0 mt-[5px]`} />

        <div className="flex-1 min-w-0">
          <span className={`text-sm font-medium ${c.text} uppercase`}>{item.name}</span>
          {item._record?.booked && <span className="inline-flex align-middle ml-1.5"><BookedBadge variant="icon" /></span>}
          {item.detail && <span className="text-xs text-stone-400 ml-2 uppercase">{item.detail}</span>}
        </div>

        {/* Chevron — visual cue that the row is expandable */}
        {onToggleExpand && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
            className={`flex-shrink-0 mt-0.5 text-stone-400 hover:text-stone-600 transition-all ${expanded ? "rotate-180" : ""}`}
            title={expanded ? "Collapse" : "Expand for more details"}
            aria-label={expanded ? "Collapse details" : "Expand details"}
            aria-expanded={!!expanded}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}

        {/* Remove from itinerary — X with inline Remove/Cancel confirm. */}
        {onRemove && (
          !confirmRemove ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setConfirmRemove(true); }}
              className="flex-shrink-0 mt-0.5 text-stone-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
              title="Remove from itinerary"
              aria-label="Remove from itinerary"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setConfirmRemove(false); onRemove(); }}
                className="px-1.5 py-0.5 text-[10px] font-semibold text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setConfirmRemove(false); }}
                className="px-1.5 py-0.5 text-[10px] text-stone-500 hover:text-stone-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          )
        )}
      </div>

      {expanded && (
        <EventDetailPanel
          record={item._record}
          type={item.type}
          canEdit={!!canEdit}
          onChange={onRefresh}
          isDraggable={!!isDraggable}
        />
      )}
    </div>
  );
}

function AccomRemoveButton({ onRemove }) {
  const [confirm, setConfirm] = useState(false);
  if (!confirm) {
    return (
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setConfirm(true); }}
        className="flex-shrink-0 mt-0.5 text-stone-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
        title="Remove from itinerary"
        aria-label="Remove from itinerary"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    );
  }
  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setConfirm(false); onRemove(); }}
        className="px-1.5 py-0.5 text-[10px] font-semibold text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
      >
        Remove
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setConfirm(false); }}
        className="px-1.5 py-0.5 text-[10px] text-stone-500 hover:text-stone-700 transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   UserEventCard — user-added activity row (fields inline-editable)
   ══════════════════════════════════════════════════════════════════ */

export function UserEventCard({ activity, onUpdate, onDelete, isDraggable, readOnly }) {
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notesValue, setNotesValue] = useState(activity.notes || "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => { setNotesValue(activity.notes || ""); }, [activity.notes]);

  function startEdit(field) {
    if (readOnly) return;
    setEditingField(field);
    if (field === "title") setEditValue(activity.title);
    else if (field === "location") setEditValue(activity.location || "");
    else if (field === "notes") setNotesValue(activity.notes || "");
  }

  function saveField(field) {
    setEditingField(null);
    if (!onUpdate) return;
    if (field === "title") {
      const val = editValue.trim();
      if (val && val !== activity.title) onUpdate({ title: val });
    } else if (field === "location") {
      const val = editValue.trim();
      if (val !== (activity.location || "")) onUpdate({ location: val || null });
    } else if (field === "notes") {
      const val = notesValue.trim();
      if (val !== (activity.notes || "")) onUpdate({ notes: val || null });
    }
  }

  const locationUrl = activity.location ? mapsSearchUrl(activity.location) : null;

  return (
    <div className="relative bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 group transition-colors">
      <div className="flex items-start gap-2.5">
        {isDraggable && (
          <div className="flex-shrink-0 mt-1 text-stone-300 cursor-grab active:cursor-grabbing">
            <svg className="w-3 h-3" viewBox="0 0 10 10" fill="currentColor">
              <circle cx="3" cy="2" r="1" /><circle cx="7" cy="2" r="1" />
              <circle cx="3" cy="5" r="1" /><circle cx="7" cy="5" r="1" />
              <circle cx="3" cy="8" r="1" /><circle cx="7" cy="8" r="1" />
            </svg>
          </div>
        )}

        {/* Time */}
        <div className="relative flex-shrink-0 w-16 mt-0.5">
          {activity.start_time ? (
            <span
              onClick={readOnly ? undefined : (e) => { e.stopPropagation(); setShowTimePicker(!showTimePicker); }}
              className={`text-xs text-stone-500 transition-colors ${readOnly ? "" : "cursor-pointer hover:text-[#da7b4a]"}`}
            >
              {formatTime12hShared(activity.start_time.slice(0, 5))}
              {activity.end_time && <><br /><span className="text-stone-400">– {formatTime12hShared(activity.end_time.slice(0, 5))}</span></>}
            </span>
          ) : readOnly ? (
            <span />
          ) : (
            <span
              onClick={(e) => { e.stopPropagation(); setShowTimePicker(!showTimePicker); }}
              className="text-xs text-stone-300 cursor-pointer hover:text-[#da7b4a] italic transition-colors opacity-0 group-hover:opacity-100"
            >
              + time
            </span>
          )}
          {showTimePicker && !readOnly && (
            <TimeSelectPopup
              startTime={to12h(activity.start_time?.slice(0, 5))}
              endTime={to12h(activity.end_time?.slice(0, 5))}
              showEndTime={true}
              useFixed={true}
              onSave={(start24, end24) => {
                setShowTimePicker(false);
                onUpdate?.({ start_time: start24, end_time: end24 });
              }}
              onClear={() => {
                setShowTimePicker(false);
                onUpdate?.({ start_time: null, end_time: null });
              }}
              onClose={() => setShowTimePicker(false)}
            />
          )}
        </div>

        <div className="w-2 h-2 rounded-full bg-stone-400 flex-shrink-0 mt-[5px]" />

        <div className="flex-1 min-w-0">
          {/* Title */}
          {editingField === "title" ? (
            <input
              type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => saveField("title")}
              onKeyDown={(e) => { if (e.key === "Enter") saveField("title"); if (e.key === "Escape") setEditingField(null); }}
              autoFocus
              className="w-full text-sm font-medium text-stone-800 bg-white border border-stone-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#da7b4a]/50 focus:border-transparent -ml-1"
            />
          ) : (
            <span
              onClick={() => startEdit("title")}
              className={`text-sm font-medium text-stone-700 transition-colors uppercase ${readOnly ? "" : "hover:text-[#da7b4a] cursor-text"}`}
            >
              {activity.title}
            </span>
          )}

          {/* Location */}
          {editingField === "location" ? (
            <input
              type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => saveField("location")}
              onKeyDown={(e) => { if (e.key === "Enter") saveField("location"); if (e.key === "Escape") setEditingField(null); }}
              autoFocus placeholder="Location..."
              className="w-full text-xs text-stone-500 bg-white border border-stone-300 rounded px-1 py-0.5 mt-0.5 focus:outline-none focus:ring-1 focus:ring-[#da7b4a]/50 focus:border-transparent -ml-1"
            />
          ) : activity.location ? (
            locationUrl ? (
              <a
                href={locationUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={readOnly ? undefined : (e) => { e.preventDefault(); e.stopPropagation(); startEdit("location"); }}
                className={`block text-xs text-stone-500 hover:text-[#da7b4a] hover:underline transition-colors mt-0.5 ${readOnly ? "" : "cursor-text"}`}
                title={readOnly ? "Open in Google Maps" : "Click to edit; ⌘/ctrl-click to open in Maps"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="inline-block w-3 h-3 mr-1 flex-shrink-0"><path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9.5A7 7 0 1 0 3 9.5c0 2.993 1.698 5.488 3.355 7.084a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" clipRule="evenodd" /></svg>{activity.location}
              </a>
            ) : (
              <span onClick={() => startEdit("location")} className={`block text-xs text-stone-400 transition-colors ${readOnly ? "" : "hover:text-[#da7b4a] cursor-text"}`}>
                {activity.location}
              </span>
            )
          ) : readOnly ? null : (
            <span onClick={() => startEdit("location")} className="block text-xs text-stone-300 hover:text-[#da7b4a] cursor-text italic transition-colors opacity-0 group-hover:opacity-100">+ location</span>
          )}

          {/* Notes */}
          {editingField === "notes" ? (
            <textarea
              value={notesValue} onChange={(e) => setNotesValue(e.target.value)}
              onBlur={() => saveField("notes")}
              onKeyDown={(e) => { if (e.key === "Escape") setEditingField(null); }}
              autoFocus placeholder="Add notes..." rows={2}
              className="w-full text-xs text-stone-500 bg-white border border-stone-300 rounded px-1 py-0.5 mt-0.5 focus:outline-none focus:ring-1 focus:ring-[#da7b4a]/50 focus:border-transparent -ml-1 resize-none"
            />
          ) : activity.notes ? (
            <span onClick={() => startEdit("notes")} className={`block text-xs text-stone-400 transition-colors mt-0.5 ${readOnly ? "" : "hover:text-[#da7b4a] cursor-text"}`}>
              {activity.notes}
            </span>
          ) : readOnly ? null : (
            <span onClick={() => startEdit("notes")} className="block text-xs text-stone-300 hover:text-[#da7b4a] cursor-text italic transition-colors opacity-0 group-hover:opacity-100">+ notes</span>
          )}
        </div>

        {!readOnly && onDelete && (
          !confirmDelete ? (
            <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }} className="text-stone-300 hover:text-red-500 p-1 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0" title="Delete event">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={onDelete} className="px-1.5 py-0.5 text-[10px] font-semibold text-white bg-red-500 rounded hover:bg-red-600 transition-colors">Delete</button>
              <button onClick={() => setConfirmDelete(false)} className="px-1.5 py-0.5 text-[10px] text-stone-500 hover:text-stone-700 transition-colors">Cancel</button>
            </div>
          )
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   NewEventCard — blank event row for adding
   ══════════════════════════════════════════════════════════════════ */

export function NewEventCard({ onSave, onCancel }) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [savedStart, setSavedStart] = useState(null);
  const [savedEnd, setSavedEnd] = useState(null);
  const [notes, setNotes] = useState("");
  const cardRef = useRef(null);

  function doSave() {
    onSave({
      title: title.trim(),
      start_time: savedStart,
      end_time: savedEnd,
      location: location || null,
      notes: notes || null,
    });
  }

  function handleBlur() {
    setTimeout(() => {
      if (cardRef.current && !cardRef.current.contains(document.activeElement)) {
        doSave();
      }
    }, 100);
  }

  return (
    <div ref={cardRef} tabIndex={-1} onBlur={handleBlur}
      className="relative bg-white border-2 border-dashed border-[#da7b4a]/40 rounded-lg px-3 py-2"
    >
      <div className="flex items-start gap-2.5">
        <div className="relative flex-shrink-0 w-16 mt-0.5">
          {savedStart ? (
            <span
              onClick={(e) => { e.stopPropagation(); setShowTimePicker(!showTimePicker); }}
              className="text-xs text-stone-500 cursor-pointer hover:text-[#da7b4a] transition-colors"
            >
              {formatTime12hShared(savedStart)}
              {savedEnd && <><br /><span className="text-stone-400">– {formatTime12hShared(savedEnd)}</span></>}
            </span>
          ) : (
            <span
              onClick={(e) => { e.stopPropagation(); setShowTimePicker(!showTimePicker); }}
              className="text-xs text-stone-300 cursor-pointer hover:text-[#da7b4a] italic transition-colors"
            >
              + time
            </span>
          )}
          {showTimePicker && (
            <TimeSelectPopup
              startTime={to12h(savedStart)}
              endTime={to12h(savedEnd)}
              showEndTime={true}
              useFixed={true}
              onSave={(s, e) => { setShowTimePicker(false); setSavedStart(s); setSavedEnd(e); }}
              onClear={() => { setShowTimePicker(false); setSavedStart(null); setSavedEnd(null); }}
              onClose={() => setShowTimePicker(false)}
            />
          )}
        </div>

        <div className="w-2 h-2 rounded-full bg-stone-300 flex-shrink-0 mt-[5px]" />

        <div className="flex-1 min-w-0">
          <input
            type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Event name..." autoFocus
            onKeyDown={(e) => { if (e.key === "Escape") onCancel(); if (e.key === "Enter") doSave(); }}
            className="w-full text-sm font-medium text-stone-800 bg-transparent border-none outline-none placeholder:text-stone-400 px-0"
          />
          <input
            type="text" value={location} onChange={(e) => setLocation(e.target.value)}
            placeholder="Location..."
            onKeyDown={(e) => { if (e.key === "Escape") onCancel(); if (e.key === "Enter") doSave(); }}
            className="w-full text-xs text-stone-500 bg-transparent border-none outline-none placeholder:text-stone-300 px-0"
          />
          <input
            type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes..."
            onKeyDown={(e) => { if (e.key === "Escape") onCancel(); if (e.key === "Enter") doSave(); }}
            className="w-full text-xs text-stone-500 bg-transparent border-none outline-none placeholder:text-stone-300 px-0"
          />
        </div>
      </div>
    </div>
  );
}
