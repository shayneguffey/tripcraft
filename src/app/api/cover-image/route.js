export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const destination = searchParams.get("destination");

    if (!destination) {
      return Response.json({ error: "Missing destination" }, { status: 400 });
    }

    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) {
      // Fallback: return a gradient placeholder
      return Response.json({ imageUrl: null, fallback: true });
    }

    const query = encodeURIComponent(`${destination} travel landscape`);
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${query}&per_page=1&orientation=landscape`,
      {
        headers: { Authorization: `Client-ID ${accessKey}` },
      }
    );

    if (!res.ok) {
      return Response.json({ imageUrl: null, fallback: true });
    }

    const data = await res.json();
    const photo = data.results?.[0];

    if (!photo) {
      return Response.json({ imageUrl: null, fallback: true });
    }

    return Response.json({
      imageUrl: photo.urls?.regular || photo.urls?.small,
      photographer: photo.user?.name,
      photographerUrl: photo.user?.links?.html,
    });
  } catch (err) {
    console.error("Cover image error:", err);
    return Response.json({ imageUrl: null, fallback: true });
  }
}
