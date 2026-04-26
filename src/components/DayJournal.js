"use client";

/**
 * DayJournal — per-user, per-day private travel journal entry.
 *
 * Renders only on the Pocket Guide (DayCardView passes showJournal=true).
 * The calendar's day-popup never renders this component.
 *
 * Privacy model: each user's entries are private to them. RLS on
 * `day_journals` ensures: a user can only read/write rows where
 * `user_id = auth.uid()` AND the trip is one they own or are an accepted
 * collaborator on. Anonymous viewers see nothing.
 *
 * Save behavior: textarea click-to-edit, auto-save on blur, upsert by
 * (trip_id, date, user_id). Missing days row is fine — `day_id` is
 * nullable; we store the date directly.
 *
 * Props:
 *   tripId  required
 *   dateKey "YYYY-MM-DD" required
 *   dayId   nullable; passed through if a days row exists
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

function formatSavedAt(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  if (sameDay) {
    return `Saved at ${d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
  }
  return `Saved ${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

export default function DayJournal({ tripId, dateKey, dayId }) {
  const [userId, setUserId] = useState(null);
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [error, setError] = useState(null);

  // Resolve current user once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!cancelled) setUserId(data?.user?.id || null);
    })();
    return () => { cancelled = true; };
  }, []);

  // Load existing entry for this user/trip/date.
  useEffect(() => {
    if (!userId || !tripId || !dateKey) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      const { data, error: err } = await supabase
        .from("day_journals")
        .select("content, updated_at")
        .eq("trip_id", tripId)
        .eq("date", dateKey)
        .eq("user_id", userId)
        .maybeSingle();
      if (cancelled) return;
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      const text = data?.content || "";
      setContent(text);
      setOriginalContent(text);
      if (data?.updated_at) setSavedAt(data.updated_at);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [userId, tripId, dateKey]);

  async function save() {
    setEditing(false);
    if (!userId || !tripId || !dateKey) return;
    const trimmed = (content || "").trim();
    if (trimmed === (originalContent || "").trim()) return;
    setSaving(true);
    setError(null);
    const nowIso = new Date().toISOString();
    const { error: err } = await supabase
      .from("day_journals")
      .upsert(
        {
          trip_id: tripId,
          day_id: dayId || null,
          date: dateKey,
          user_id: userId,
          content: trimmed || null,
          updated_at: nowIso,
        },
        { onConflict: "trip_id,date,user_id" }
      );
    if (err) {
      setError(err.message);
    } else {
      setOriginalContent(trimmed);
      setSavedAt(nowIso);
    }
    setSaving(false);
  }

  // Hide entirely for anonymous viewers — they can't write entries and
  // can't see anyone else's by design.
  if (!userId) return null;
  if (loading) return null;

  return (
    <div className="px-5 py-4 border-t border-stone-200/60">
      <div className="flex items-center gap-1.5 mb-2">
        <svg className="w-3.5 h-3.5 text-stone-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.5 4.75c0-.69.56-1.25 1.25-1.25h10.5c.69 0 1.25.56 1.25 1.25v10.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25V4.75ZM6 7.25a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 6 7.25Zm0 3a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
        </svg>
        <span className="text-xs font-medium text-stone-400 uppercase tracking-wide">Travel Journal</span>
        {savedAt && content && !editing && (
          <span className="text-[10px] text-stone-400 ml-auto italic">{formatSavedAt(savedAt)}</span>
        )}
      </div>

      {editing ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={save}
          autoFocus
          rows={5}
          placeholder="What happened today? What did you see, eat, feel? Write whatever you want to remember."
          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#da7b4a]/50 focus:border-transparent text-sm text-stone-700 bg-white resize-none leading-relaxed"
        />
      ) : (
        <div
          onClick={() => setEditing(true)}
          className={`text-sm px-3 py-2 rounded-lg cursor-text border border-stone-300 hover:border-[#da7b4a]/40 transition-colors min-h-[60px] leading-relaxed ${
            content ? "text-stone-700 whitespace-pre-wrap" : "text-stone-400 italic"
          }`}
          title="Click to write today's entry"
        >
          {content || "Tap to write today\u2019s entry\u2026"}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
      {saving && (
        <p className="text-[10px] text-stone-400 mt-1 italic">Saving\u2026</p>
      )}
    </div>
  );
}
