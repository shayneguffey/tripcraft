import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET — fetch invite details for the acceptance page
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return Response.json({ error: "Missing invite token" }, { status: 400 });
    }

    const { data: invite, error } = await supabaseAdmin
      .from("trip_collaborators")
      .select("*")
      .eq("invite_token", token)
      .single();

    if (error || !invite) {
      return Response.json({ error: "Invite not found or expired" }, { status: 404 });
    }

    if (invite.status === "accepted") {
      return Response.json({ error: "This invite has already been accepted" }, { status: 400 });
    }

    // Get trip info
    const { data: trip } = await supabaseAdmin
      .from("trips")
      .select("id, title, destination, start_date, end_date")
      .eq("id", invite.trip_id)
      .single();

    // Get inviter email
    const { data: { user: inviter } } = await supabaseAdmin.auth.admin.getUserById(invite.invited_by);

    return Response.json({
      invite,
      trip,
      inviterEmail: inviter?.email || "Someone",
    });
  } catch (err) {
    console.error("Invite fetch error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — accept the invite
export async function POST(request) {
  try {
    const { token, userId } = await request.json();

    if (!token || !userId) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch the invite
    const { data: invite, error } = await supabaseAdmin
      .from("trip_collaborators")
      .select("*")
      .eq("invite_token", token)
      .single();

    if (error || !invite) {
      return Response.json({ error: "Invite not found" }, { status: 404 });
    }

    if (invite.status === "accepted") {
      return Response.json({ error: "Already accepted", tripId: invite.trip_id }, { status: 400 });
    }

    // Verify the accepting user's email matches the invited email
    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    if (user.email?.toLowerCase() !== invite.invited_email.toLowerCase()) {
      return Response.json({
        error: `This invite was sent to ${invite.invited_email}. You're logged in as ${user.email}.`,
      }, { status: 403 });
    }

    // Accept the invite
    const { error: updateError } = await supabaseAdmin
      .from("trip_collaborators")
      .update({
        status: "accepted",
        user_id: userId,
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invite.id);

    if (updateError) {
      console.error("Accept error:", updateError);
      return Response.json({ error: "Failed to accept invite" }, { status: 500 });
    }

    return Response.json({
      message: "Invite accepted!",
      tripId: invite.trip_id,
    });
  } catch (err) {
    console.error("Invite accept error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
