"use client";

/* ══════════════════════════════════════════════════════════════════
   Trip Travelers — replaces the standalone Collaborators tab.
   ──────────────────────────────────────────────────────────────────
   A traveler is anyone going on the trip. Each traveler may, optionally,
   also be a collaborator (someone with edit access to the planning page).

   - Owner sees and manages travelers + collaborator promotions.
   - Anonymous viewers and read-only collaborators see a static traveler list.
   - Promoting a traveler to a collaborator triggers /api/invite
     (the same flow as the old Collaborators tab) using the traveler's email.

   Storage:
   - travelers table:  id, trip_id, name, role, email, notes, is_primary,
                       sort_order, created_at
   - trip_collaborators: id, trip_id, invited_email, invited_by_user_id,
                         status, invite_token, ...
   ══════════════════════════════════════════════════════════════════ */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const ROLE_OPTIONS = [
  { value: "", label: "(no role)" },
  { value: "Adult", label: "Adult" },
  { value: "Child", label: "Child" },
  { value: "Infant", label: "Infant" },
  { value: "Senior", label: "Senior" },
  { value: "Organizer", label: "Organizer" },
  { value: "Guest", label: "Guest" },
];

export default function TripTravelers({ tripId, tripTitle, userId, userEmail, tripOwnerId }) {
  const [travelers, setTravelers] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(emptyDraft());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [info, setInfo] = useState(null);
  const [copiedToken, setCopiedToken] = useState(null);

  const isOwner = userId && tripOwnerId && userId === tripOwnerId;

  function emptyDraft() {
    return { name: "", role: "", email: "", notes: "", is_primary: false };
  }

  useEffect(() => {
    if (!tripId) return;
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  async function loadAll() {
    const [tRes, cRes] = await Promise.all([
      supabase.from("travelers").select("*").eq("trip_id", tripId).order("sort_order", { ascending: true }),
      supabase.from("trip_collaborators").select("*").eq("trip_id", tripId).order("created_at", { ascending: true }),
    ]);
    if (!tRes.error && tRes.data) setTravelers(tRes.data);
    if (!cRes.error && cRes.data) setCollaborators(cRes.data);
  }

  function findCollab(email) {
    if (!email) return null;
    const e = email.trim().toLowerCase();
    return collaborators.find((c) => (c.invited_email || "").toLowerCase() === e) || null;
  }

  async function saveTraveler(e) {
    e?.preventDefault?.();
    setErr(null);
    if (!draft.name.trim()) { setErr("Name is required"); return; }
    setBusy(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from("travelers")
          .update({
            name: draft.name.trim(),
            role: draft.role || null,
            email: draft.email.trim() || null,
            notes: draft.notes.trim() || null,
            is_primary: !!draft.is_primary,
          })
          .eq("id", editingId);
        if (error) { setErr(error.message); setBusy(false); return; }
      } else {
        const nextOrder = travelers.length;
        const { error } = await supabase
          .from("travelers")
          .insert({
            trip_id: tripId,
            name: draft.name.trim(),
            role: draft.role || null,
            email: draft.email.trim() || null,
            notes: draft.notes.trim() || null,
            is_primary: !!draft.is_primary,
            sort_order: nextOrder,
          });
        if (error) { setErr(error.message); setBusy(false); return; }
      }
      setDraft(emptyDraft());
      setAdding(false);
      setEditingId(null);
      await loadAll();
    } finally {
      setBusy(false);
    }
  }

  async function removeTraveler(id) {
    if (!confirm("Remove this traveler?")) return;
    const { error } = await supabase.from("travelers").delete().eq("id", id);
    if (!error) setTravelers((prev) => prev.filter((t) => t.id !== id));
  }

  function startEdit(t) {
    setEditingId(t.id);
    setAdding(true);
    setDraft({
      name: t.name || "",
      role: t.role || "",
      email: t.email || "",
      notes: t.notes || "",
      is_primary: !!t.is_primary,
    });
  }
  function cancelEdit() {
    setAdding(false);
    setEditingId(null);
    setDraft(emptyDraft());
    setErr(null);
  }

  async function inviteAsCollaborator(traveler) {
    setErr(null);
    setInfo(null);
    if (!traveler.email) { setErr("Add an email for this traveler before inviting."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId,
          email: traveler.email.trim().toLowerCase(),
          invitedBy: userId,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(json.error || "Failed to send invite");
      } else {
        setInfo(json.message || `Invite created for ${traveler.email}`);
        await loadAll();
      }
    } catch (e) {
      setErr("Failed to send invite");
    } finally {
      setBusy(false);
    }
  }

  async function removeCollaborator(collabId) {
    const { error } = await supabase.from("trip_collaborators").delete().eq("id", collabId);
    if (!error) setCollaborators((prev) => prev.filter((c) => c.id !== collabId));
  }

  function copyInviteLink(token) {
    const link = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  }

  // Collaborators that don't match any traveler email — show as a separate
  // "Other invites" section so we don't lose them.
  const travelerEmails = travelers.map((t) => (t.email || "").toLowerCase()).filter(Boolean);
  const orphanCollabs = collaborators.filter(
    (c) => !travelerEmails.includes((c.invited_email || "").toLowerCase())
  );

  const statusColors = {
    pending: "bg-amber-100 text-amber-700 border border-amber-200",
    accepted: "bg-green-100 text-green-700 border border-green-200",
    declined: "bg-red-100 text-red-700 border border-red-200",
  };

  return (
    <div className="bg-white rounded-xl border border-violet-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-2.5 flex items-center justify-between border-b border-violet-100">
        <div className="text-xs uppercase tracking-wider font-semibold text-violet-700">
          Travelers <span className="text-slate-400 font-normal normal-case ml-1">·  who's going on this trip</span>
        </div>
        {isOwner && (
          <button
            onClick={() => { if (!adding) { setDraft(emptyDraft()); setAdding(true); setEditingId(null); } else { cancelEdit(); } }}
            className="text-sm bg-violet-600 text-white px-3 py-1.5 rounded-lg hover:bg-violet-700 transition-colors"
          >
            {adding ? "Cancel" : "+ Add traveler"}
          </button>
        )}
      </div>

      {/* Owner row (always visible) */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-3 py-2">
          <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-sm font-semibold">
            {userEmail?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {isOwner ? `You (${userEmail})` : userEmail}
            </p>
            <p className="text-[11px] text-slate-500">Trip owner · planning lead</p>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-medium">Owner</span>
        </div>

        {/* Add / edit form */}
        {adding && (
          <form onSubmit={saveTraveler} className="mt-3 mb-2 p-4 bg-violet-50/60 border border-violet-200 rounded-lg space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Name *</label>
                <input
                  type="text"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Role</label>
                <select
                  value={draft.role}
                  onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white"
                >
                  {ROLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Email <span className="font-normal text-slate-400 normal-case">(optional · required to invite as a collaborator)</span>
                </label>
                <input
                  type="email"
                  value={draft.email}
                  onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                  placeholder="traveler@example.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Notes</label>
                <input
                  type="text"
                  value={draft.notes}
                  onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                  placeholder="Dietary needs, mobility, etc."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
              <div className="sm:col-span-2 flex items-center gap-2">
                <input
                  id="is-primary"
                  type="checkbox"
                  checked={!!draft.is_primary}
                  onChange={(e) => setDraft({ ...draft, is_primary: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-violet-600"
                />
                <label htmlFor="is-primary" className="text-sm text-slate-700">Primary traveler</label>
              </div>
            </div>
            {err && <p className="text-xs text-red-600">{err}</p>}
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={cancelEdit} className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900">Cancel</button>
              <button type="submit" disabled={busy} className="bg-violet-600 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50">
                {busy ? "Saving…" : (editingId ? "Save" : "Add traveler")}
              </button>
            </div>
          </form>
        )}

        {/* Travelers list */}
        {travelers.map((t) => {
          const collab = findCollab(t.email);
          return (
            <div key={t.id} className="flex items-center gap-3 py-2.5 border-t border-slate-100">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-semibold">
                {t.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-900 truncate">{t.name}</p>
                  {t.is_primary && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium uppercase tracking-wider">Primary</span>
                  )}
                </div>
                <p className="text-[12px] text-slate-500 truncate">
                  {[t.role, t.email].filter(Boolean).join(" · ")}
                  {t.notes && <span className="text-slate-400"> · {t.notes}</span>}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {collab ? (
                  <>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[collab.status] || ""}`}>
                      {collab.status}
                    </span>
                    {collab.status === "pending" && (
                      <button
                        onClick={() => copyInviteLink(collab.invite_token)}
                        className="text-[11px] text-violet-600 hover:text-violet-800"
                        title="Copy invite link"
                      >
                        {copiedToken === collab.invite_token ? "Copied!" : "Copy link"}
                      </button>
                    )}
                  </>
                ) : (
                  isOwner && (
                    <button
                      onClick={() => inviteAsCollaborator(t)}
                      disabled={!t.email || busy}
                      className="text-[11px] px-2 py-1 rounded-md border border-violet-300 text-violet-700 hover:bg-violet-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      title={t.email ? "Send a collaborator invite to this traveler" : "Add an email above to invite as a collaborator"}
                    >
                      Invite as collaborator
                    </button>
                  )
                )}
                {isOwner && (
                  <>
                    <button onClick={() => startEdit(t)} className="text-slate-400 hover:text-violet-600 transition-colors" title="Edit traveler">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001Z" /></svg>
                    </button>
                    <button onClick={() => removeTraveler(t.id)} className="text-slate-300 hover:text-red-500 transition-colors" title="Remove traveler">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" /></svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {travelers.length === 0 && !adding && (
          <p className="text-sm text-slate-400 py-3 border-t border-slate-100">
            No travelers added yet. {isOwner ? "Click \u201c+ Add traveler\u201d to start." : ""}
          </p>
        )}

        {/* Orphan collaborators (invited but not in travelers list) */}
        {orphanCollabs.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Other collaborator invites
            </div>
            {orphanCollabs.map((c) => (
              <div key={c.id} className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-semibold">
                  {c.invited_email?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 truncate">{c.invited_email}</p>
                  <p className="text-[11px] text-slate-400">Not in travelers list</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[c.status] || ""}`}>{c.status}</span>
                {c.status === "pending" && (
                  <button onClick={() => copyInviteLink(c.invite_token)} className="text-[11px] text-violet-600 hover:text-violet-800">
                    {copiedToken === c.invite_token ? "Copied!" : "Copy link"}
                  </button>
                )}
                {isOwner && (
                  <button onClick={() => removeCollaborator(c.id)} className="text-slate-300 hover:text-red-500" title="Remove invite">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" /></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {info && <p className="text-xs text-green-600 mt-3">{info}</p>}
      </div>
    </div>
  );
}
