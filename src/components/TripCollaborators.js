"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function TripCollaborators({ tripId, tripTitle, userId, userEmail, tripOwnerId }) {
  const [collaborators, setCollaborators] = useState([]);
  const [ownerEmail, setOwnerEmail] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [copiedToken, setCopiedToken] = useState(null);

  useEffect(() => {
    loadCollaborators();
    // If current user is the owner, we already know the email
    if (tripOwnerId === userId) {
      setOwnerEmail(userEmail);
    } else {
      // Fetch owner email from collaborators API or just show "Trip Owner"
      setOwnerEmail(userEmail); // fallback
    }
  }, [tripId, tripOwnerId, userId, userEmail]);

  async function loadCollaborators() {
    const { data, error } = await supabase
      .from("trip_collaborators")
      .select("*")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setCollaborators(data);
    }
  }

  async function handleInvite(e) {
    e.preventDefault();
    setSending(true);
    setError(null);
    setSuccess(null);

    const email = inviteEmail.trim().toLowerCase();
    if (!email) {
      setError("Please enter an email address");
      setSending(false);
      return;
    }

    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId,
          email,
          invitedBy: userId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send invite");
        setSending(false);
        return;
      }

      setSuccess(`Invite created for ${email}`);
      setInviteEmail("");
      setSending(false);
      loadCollaborators();
    } catch (err) {
      setError("Failed to send invite");
      setSending(false);
    }
  }

  async function handleRemove(collaboratorId) {
    const { error } = await supabase
      .from("trip_collaborators")
      .delete()
      .eq("id", collaboratorId);

    if (!error) {
      setCollaborators((prev) => prev.filter((c) => c.id !== collaboratorId));
    }
  }

  function copyInviteLink(token) {
    const link = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  }

  const statusColors = {
    pending: "bg-amber-100 text-amber-700",
    accepted: "bg-green-100 text-green-700",
    declined: "bg-red-100 text-red-700",
  };

  return (
    <div className="bg-white rounded-xl border border-violet-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">👥</span>
          <h2 className="font-semibold text-violet-900">
            Collaborators
            {collaborators.filter((c) => c.status === "accepted").length > 0 && (
              <span className="ml-2 text-sm font-normal text-violet-500">
                ({collaborators.filter((c) => c.status === "accepted").length + 1} members)
              </span>
            )}
          </h2>
        </div>
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="text-sm bg-violet-600 text-white px-3 py-1.5 rounded-lg hover:bg-violet-700 transition-colors"
        >
          + Invite
        </button>
      </div>

      <div className="px-5 py-4">
        {/* Owner row */}
        <div className="flex items-center gap-3 py-2">
          <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-sm font-semibold">
            {ownerEmail?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{ownerEmail}</p>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-medium">
            Owner
          </span>
        </div>

        {/* Collaborator rows */}
        {collaborators.map((collab) => (
          <div
            key={collab.id}
            className="flex items-center gap-3 py-2 border-t border-slate-100"
          >
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-semibold">
              {collab.invited_email[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-700 truncate">{collab.invited_email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[collab.status]}`}
              >
                {collab.status}
              </span>
              {collab.status === "pending" && (
                <button
                  onClick={() => copyInviteLink(collab.invite_token)}
                  className="text-xs text-violet-600 hover:text-violet-800"
                  title="Copy invite link"
                >
                  {copiedToken === collab.invite_token ? "Copied!" : "📋 Link"}
                </button>
              )}
              <button
                onClick={() => handleRemove(collab.id)}
                className="text-slate-300 hover:text-red-500 transition-colors"
                title="Remove"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-3.5 h-3.5"
                >
                  <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {collaborators.length === 0 && !showInvite && (
          <p className="text-sm text-slate-400 py-2 border-t border-slate-100">
            No collaborators yet. Invite someone to plan together!
          </p>
        )}

        {/* Invite form */}
        {showInvite && (
          <div className="mt-3 pt-3 border-t border-violet-100">
            <form onSubmit={handleInvite} className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="friend@example.com"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                disabled={sending}
                className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
              >
                {sending ? "..." : "Send"}
              </button>
            </form>

            {error && (
              <p className="text-xs text-red-500 mt-2">{error}</p>
            )}
            {success && (
              <div className="mt-2">
                <p className="text-xs text-green-600">{success}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Share the invite link with them — click the 📋 Link button next to their name above.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
