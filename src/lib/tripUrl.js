/**
 * Shared helpers for building human-readable planning + Pocket Guide URLs.
 *
 * Planning page:  /trips/{slug}--{shortId}   (shortId = first 8 chars of trip UUID)
 * Pocket Guide:   /guide/{slug}--{shareToken}
 *
 * Both formats are backwards-compatible: the server-side lookup still accepts
 * a bare UUID or bare share token, so legacy links keep working.
 */

export function planningSlug(title) {
  if (!title) return "trip";
  const slug = String(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || "trip";
}

export function tripPlanningUrl(trip) {
  if (!trip?.id) return "/trips";
  const shortId = String(trip.id).slice(0, 8);
  return `/trips/${planningSlug(trip.title)}--${shortId}`;
}

export function guideUrl(trip, shareToken) {
  if (!shareToken) return "/trips";
  return `/guide/${planningSlug(trip?.title)}--${shareToken}`;
}
