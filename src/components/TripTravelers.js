"use client";

/* ══════════════════════════════════════════════════════════════════
   Trip Travelers — replaces the standalone Collaborators tab.
   ──────────────────────────────────────────────────────────────────
   A traveler is anyone going on the trip. Travelers are scoped per
   itinerary (via the itinerary_travelers junction), so different
   itinerary versions can include different groups of travelers
   (e.g. "what if a friend joins?").

   Each traveler may also optionally be a collaborator (someone with
   edit access). Promoting a traveler to a collaborator triggers
   /api/invite using the traveler\'s email.
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

export default function TripTravelers({
  tripId, tripTitle, userId, userEmail, tripOwnerId,
  itineraries = [], activeItineraryId, onTravelersChange,
}) {
  const [travelers, setTravelers] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  // links: { traveler_id: Set<itinerary_id> }
  const [travelerItineraries, setTravelerItineraries] = useState({});
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
    const [tRes, cRes, jRes] = await Promise.all([
      supabase.from("travelers").select("*").eq("trip_id", tripId).order("sort_order", { ascending: true }),
      supabase.from("trip_collaborators").select("*").eq("trip_id", tripId).order("created_at", { ascending: true }),
      supabase.from("itinerary_travelers").select("*").in("itinerary_id", itineraries.map((i) => i.id)),
    ]);
    if (!tRes.error && tRes.data) setTravelers(tRes.data);
    if (!cRes.error && cRes.data) setCollaborators(cRes.data);
    if (!jRes.error && jRes.data) {
      const map = {};
      jRes.data.forEach((row) => {
        if (!map[row.traveler_id]) map[row.traveler_id] = new Set();
        map[row.traveler_id].add(row.itinerary_id);
      });
      setTravelerItineraries(map);
    }
    if (onTravelersChange) onTravelersChange();
  }

  function findCollab(email) {
    if (!email) return null;
    const e = email.trim().toLowerCase();
    return collaborators.find((c) => (c.invited_email || "").toLowerCase() === e) || null;
  }

  // Toggle a traveler\'s inclusion in a specific itinerary
  async function toggleItinerary(travelerId, itineraryId) {
    const set = travelerItineraries[travelerId] || new Set();
    if (set.has(itineraryId)) {
      const { error } = await supabase
        .from("itinerary_travelers")
        .delete()
        .eq("traveler_id", travelerId)
        .eq("itinerary_id", itineraryId);
      if (error) { setErr(error.message); return; }
    } else {
      const { error } = await supabase
        .from("itinerary_travelers")
        .insert({ traveler_id: travelerId, itinerary_id: itineraryId });
      if (error) { setErr(error.message); return; }
    }
    await loadAll();
  }

  async function saveTraveler(e) {
    e?.preventDefault?.();
    setErr(null);
    if (!draft.name.trim()) { setErr("Name is required"); return; }
    setBusy(true);
    try {
      let newTravelerId = editingId;
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
        const { data: inserted, error } = await supabase
          .from("travelers")
          .insert({
            trip_id: tripId,
            name: draft.name.trim(),
            role: draft.role || null,
            email: draft.email.trim() || null,
            notes: draft.notes.trim() || null,
            is_primary: !!draft.is_primary,
            sort_order: nextOrder,
          })
          .select("id")
          .single();
        if (error) { setErr(error.message); setBusy(false); return; }
        newTravelerId = inserted.id;
        // Default: include the new traveler in the active itinerary only.
        if (activeItineraryId) {
          await supabase.from("itinerary_travelers").insert({
            traveler_id: newTravelerId, itinerary_id: activeItineraryId,
          });
        }
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
    if (!confirm("Remove this traveler from the trip?")) return;
    const { error } = await supabase.from("travelers").delete().eq("id", id);
    if (!error) await loadAll();
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
      <div className="px-5 py-2.5 flex items-center justify-between border-b border-violet-100">
        <div className="text-xs uppercase tracking-wider font-semibold text-violet-700">
          Travelers <span className="text-slate-400 font-normal normal-case ml-1">· who’s going on this trip</span>
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

      <div className="px-5 py-4">
        {/* Owner row */}
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
                  {ROLE_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
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
                <input id="is-primary" type="checkbox" checked={!!draft.is_primary} onChange={(e) => setDraft({ ...draft, is_primary: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-violet-600" />
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

        {/* Travelers grid: name | per-itinerary include checkboxes | actions */}
        {travelers.length > 0 && (
          <div className="mt-4 mb-2">
            {/* Column header for per-itinerary chips */}
            {itineraries.length > 0 && (
              <div className="flex items-center justify-end gap-2 mb-1.5 pr-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mr-2">Include in:</span>
                {itineraries.map((it) => (
                  <span
                    key={it.id}
                    className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${
                      it.id === activeItineraryId
                        ? "bg-[#da7b4a]/15 text-[#da7b4a]"
                        : "text-slate-400"
                    }`}
                    title={it.title}
                  >
                    {it.title}
                  </span>
                ))}
              </div>
            )}

            {travelers.map((t) => {
              const collab = findCollab(t.email);
              const includedIn = travelerItineraries[t.id] || new Set();
              return (
                <div key={t.id} className="grid gap-3 py-2.5 border-t border-slate-100 items-center" style={{ gridTemplateColumns: `minmax(0,1fr) auto auto auto` }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-semibold shrink-0">
                      {t.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
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
                  </div>

                  {/* Per-itinerary include toggles */}
                  <div className="flex items-center gap-1.5">
                    {itineraries.map((it) => {
                      const included = includedIn.has(it.id);
                      const isActive = it.id === activeItineraryId;
                      return (
                        <button
                          key={it.id}
                          onClick={() => isOwner && toggleItinerary(t.id, it.id)}
                          disabled={!isOwner}
                          className={`w-7 h-7 rounded border flex items-center justify-center transition-all ${
                            included
                              ? (isActive ? "bg-[#da7b4a] border-[#da7b4a] text-white" : "bg-violet-100 border-violet-300 text-violet-700")
                              : "bg-white border-slate-300 text-slate-300 hover:border-slate-400"
                          } ${isOwner ? "cursor-pointer" : "cursor-default"}`}
                          title={`${included ? "Remove from" : "Include in"} ${it.title}`}
                        >
                          {included ? (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <span className="text-[10px] font-bold">+</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Collaborator status / invite */}
                  <div className="flex items-center gap-2 shrink-0">
                    {collab ? (
                      <>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[collab.status] || ""}`}>{collab.status}</span>
                        {collab.status === "pending" && (
                          <button onClick={() => copyInviteLink(collab.invite_token)} className="text-[11px] text-violet-600 hover:text-violet-800" title="Copy invite link">
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
                          Invite as collab.
                        </button>
                      )
                    )}
                  </div>

                  {/* Edit / delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    {isOwner && (
                      <>
                        <button onClick={() => startEdit(t)} className="text-slate-400 hover:text-violet-600 p-1" title="Edit traveler">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001Z" /></svg>
                        </button>
                        <button onClick={() => removeTraveler(t.id)} className="text-slate-300 hover:text-red-500 p-1" title="Remove from trip">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" /></svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {travelers.length === 0 && !adding && (
          <p className="text-sm text-slate-400 py-3 border-t border-slate-100">
            No travelers added yet. {isOwner ? "Click “+ Add traveler” to start." : ""}
          </p>
        )}

        {orphanCollabs.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Other collaborator invites</div>
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
