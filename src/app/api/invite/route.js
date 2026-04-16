import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { tripId, email, invitedBy } = await request.json();

    if (!tripId || !email || !invitedBy) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify the inviter has access to the trip
    const { data: trip } = await supabaseAdmin
      .from("trips")
      .select("id, title, user_id")
      .eq("id", tripId)
      .single();

    if (!trip) {
      return Response.json({ error: "Trip not found" }, { status: 404 });
    }

    // Check if inviter is owner or accepted collaborator
    const isOwner = trip.user_id === invitedBy;
    if (!isOwner) {
      const { data: collab } = await supabaseAdmin
        .from("trip_collaborators")
        .select("id")
        .eq("trip_id", tripId)
        .eq("user_id", invitedBy)
        .eq("status", "accepted")
        .single();

      if (!collab) {
        return Response.json({ error: "Not authorized to invite" }, { status: 403 });
      }
    }

    // Check if already invited
    const { data: existing } = await supabaseAdmin
      .from("trip_collaborators")
      .select("id, status")
      .eq("trip_id", tripId)
      .eq("invited_email", email.toLowerCase())
      .single();

    if (existing) {
      if (existing.status === "accepted") {
        return Response.json({ error: "This person is already a collaborator" }, { status: 409 });
      }
      // Re-send invite for pending
      return Response.json({
        message: "Invite already sent",
        collaborator: existing,
      });
    }

    // Check if the invited email is the trip owner
    const { data: ownerUser } = await supabaseAdmin.auth.admin.listUsers();
    const owner = ownerUser?.users?.find(u => u.id === trip.user_id);
    if (owner && owner.email?.toLowerCase() === email.toLowerCase()) {
      return Response.json({ error: "Cannot invite the trip owner" }, { status: 400 });
    }

    // Check if the invited email already has an account
    const invitedUser = ownerUser?.users?.find(
      u => u.email?.toLowerCase() === email.toLowerCase()
    );

    // If the invited person already has an account, auto-accept
    const autoAccept = !!invitedUser;

    // Create the invite
    const { data: collaborator, error } = await supabaseAdmin
      .from("trip_collaborators")
      .insert({
        trip_id: tripId,
        user_id: invitedUser?.id || null,
        invited_email: email.toLowerCase(),
        invited_by: invitedBy,
        status: autoAccept ? "accepted" : "pending",
        accepted_at: autoAccept ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error);
      return Response.json({ error: "Failed to create invite" }, { status: 500 });
    }

    return Response.json({
      message: autoAccept
        ? `${email} has been added — the trip will appear in their trips`
        : `Invite created for ${email} — share the link so they can join`,
      collaborator,
      inviteToken: collaborator.invite_token,
      autoAccepted: autoAccept,
    });
  } catch (err) {
    console.error("Invite API error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
