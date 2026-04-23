/**
 * Server-side metadata for the Pocket Guide.
 *
 * Emits Open Graph + Twitter Card tags so the share URL unfurls with a
 * rich preview (title, destination, dates, banner image) in iMessage,
 * Slack, WhatsApp, Twitter, etc. The page itself is a client component,
 * so this sibling layout is the right place for server-only metadata.
 */
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function formatDateRange(start, end) {
  if (!start && !end) return "";
  const opts = { month: "short", day: "numeric" };
  const s = start ? new Date(start + "T00:00:00").toLocaleDateString("en-US", opts) : "";
  const e = end ? new Date(end + "T00:00:00").toLocaleDateString("en-US", opts) : "";
  if (s && e) return `${s} – ${e}`;
  return s || e || "";
}

function buildDescription(trip) {
  const parts = [];
  if (trip.destination) parts.push(trip.destination);
  const dates = formatDateRange(trip.start_date, trip.end_date);
  if (dates) parts.push(dates);
  if (trip.num_travelers) parts.push(`${trip.num_travelers} traveler${trip.num_travelers === 1 ? "" : "s"}`);
  return parts.join(" · ") || "View this trip's Pocket Guide on TripCraft.";
}

export async function generateMetadata({ params }) {
  try {
    const { token } = await params;
    if (!token) return { title: "Pocket Guide · TripCraft" };

    // Hybrid URL form: `{slug}--{token}`. Extract the real token.
    const realToken = token.includes("--") ? token.split("--").pop() : token;

    const supabase = getSupabaseAdmin();
    const { data: itinerary } = await supabase
      .from("itineraries")
      .select("trip_id, title")
      .eq("share_token", realToken)
      .maybeSingle();

    if (!itinerary) return { title: "Pocket Guide · TripCraft" };

    const { data: trip } = await supabase
      .from("trips")
      .select("title, destination, start_date, end_date, num_travelers, banner_image")
      .eq("id", itinerary.trip_id)
      .single();

    if (!trip) return { title: "Pocket Guide · TripCraft" };

    const tripTitle = trip.title || "Trip";
    // If the itinerary has a custom name, surface it so different itineraries
    // for the same trip produce distinguishable link previews.
    const itinTitle = itinerary.title && itinerary.title.trim() ? itinerary.title.trim() : null;
    const displayTitle = itinTitle ? `${tripTitle} — ${itinTitle}` : tripTitle;
    const description = buildDescription(trip);
    const image = trip.banner_image || null;

    return {
      title: `${displayTitle} · Pocket Guide`,
      description,
      openGraph: {
        title: displayTitle,
        description,
        type: "article",
        siteName: "TripCraft",
        images: image ? [{ url: image, alt: `${tripTitle} banner` }] : [],
      },
      twitter: {
        card: image ? "summary_large_image" : "summary",
        title: displayTitle,
        description,
        images: image ? [image] : [],
      },
    };
  } catch (err) {
    console.error("[guide metadata] error:", err);
    return { title: "Pocket Guide · TripCraft" };
  }
}

export default function GuideLayout({ children }) {
  return children;
}
