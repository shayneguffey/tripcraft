export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const destination = searchParams.get("destination");
    const count = parseInt(searchParams.get("count")) || 1;

    if (!destination) {
      return Response.json({ error: "Missing destination" }, { status: 400 });
    }

    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) {
      return Response.json({ images: [], fallback: true });
    }

    const query = encodeURIComponent(`${destination} travel landscape`);
    const perPage = Math.min(count, 10);
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${query}&per_page=${perPage}&orientation=landscape`,
      {
        headers: { Authorization: `Client-ID ${accessKey}` },
      }
    );

    if (!res.ok) {
      return Response.json({ images: [], fallback: true });
    }

    const data = await res.json();
    const images = (data.results || []).map((photo) => photo.urls?.regular || photo.urls?.small).filter(Boolean);

    if (images.length === 0) {
      return Response.json({ images: [], fallback: true });
    }

    return Response.json({
      images,
      imageUrl: images[0], // backward compat
    });
  } catch (err) {
    console.error("Cover image error:", err);
    return Response.json({ images: [], fallback: true });
  }
}
