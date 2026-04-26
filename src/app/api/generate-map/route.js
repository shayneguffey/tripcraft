/**
 * Generate Destination Map API — creates a posterized vintage-poster-style map
 * of the trip's destination.
 *
 * Same Gemini Flash Image pipeline as generate-banner, with a pictorial-map
 * prompt and a square-ish aspect ratio appropriate for the at-a-glance page.
 *
 * POST body: { destination: string, tripId: string, force?: boolean }
 * Returns:   { imageUrl: string, cached: boolean }
 */

import { createClient } from "@supabase/supabase-js";

const BUCKET = "trip-posters";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_25_MODEL = "gemini-2.5-flash-image";
const GEMINI_31_MODEL = "gemini-3.1-flash-image-preview";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function buildMapPrompt(destination) {
  return [
    "IMPORTANT RULES: ZERO text, no labels, no captions, no place names, no compass markings, no legend. The image must extend to every edge with no border or frame.",
    `A stylized vintage pictorial map of ${destination}.`,
    "Aesthetic: 1930s WPA national-park map, hand-illustrated tourism map, mid-century travel poster cartography.",
    "Show the geographic shape of the region: coastlines, mountains, lakes, rivers, forests, key landmarks — rendered as illustrated icons rather than topographic detail.",
    "Flat posterized art style with bold flat color blocks. Limited warm muted palette: cream-paper background, deep teals for water, sage and forest greens for land, warm ochre and burnt orange for accents and routes.",
    "Subtle paper texture or ink-printing imperfections. Slightly aged.",
    "Hand-drawn pictorial elements: tiny mountain silhouettes, pine-tree clumps, wave lines on water, illustrated landmarks. Stylized and decorative, not realistic.",
    "No text or letters of any kind. No street labels. Pure illustration.",
    "Square composition. Full-bleed edge-to-edge with no border anywhere.",
  ].join(" ");
}

function slugify(destination) {
  return destination
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function persistMapUrl(supabase, tripId, imageUrl) {
  if (!tripId || !imageUrl) return;
  try {
    const { error } = await supabase
      .from("trips")
      .update({ map_image: imageUrl })
      .eq("id", tripId);
    if (error) console.error("[map] persist update error:", error);
  } catch (err) {
    console.error("[map] persist error:", err);
  }
}

async function generateWithGemini(modelName, prompt, apiKey) {
  const endpoint = `${API_BASE}/${modelName}:generateContent?key=${apiKey}`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
        temperature: 0.85,
        imageConfig: { aspectRatio: "1:1" },
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[map/${modelName}] error:`, res.status, errText);
    return null;
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      console.log(`[map/${modelName}] image generated`);
      return {
        base64: part.inlineData.data,
        mimeType: part.inlineData.mimeType || "image/png",
      };
    }
  }
  console.error(`[map/${modelName}] No image part in response:`, JSON.stringify(data).slice(0, 500));
  return null;
}

export async function POST(request) {
  try {
    const { destination, tripId, force = false } = await request.json();

    if (!destination) {
      return Response.json({ error: "Missing destination" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Image generation not configured" }, { status: 500 });
    }

    const supabase = getSupabaseAdmin();
    const slug = slugify(destination);
    const cachedPath = `maps/${slug}.png`;

    // Cache check (skipped when force=true)
    if (!force) {
      const { data: fileList } = await supabase.storage
        .from(BUCKET)
        .list("maps", { search: `${slug}.png`, limit: 1 });

      if (fileList && fileList.length > 0) {
        const { data: cachedFile } = supabase.storage.from(BUCKET).getPublicUrl(cachedPath);
        if (cachedFile?.publicUrl) {
          await persistMapUrl(supabase, tripId, cachedFile.publicUrl);
          return Response.json({ imageUrl: cachedFile.publicUrl, cached: true });
        }
      }
    }

    const prompt = buildMapPrompt(destination);
    let imageResult = null;
    for (const model of [GEMINI_25_MODEL, GEMINI_31_MODEL]) {
      console.log(`[map] Trying ${model} for:`, destination);
      imageResult = await generateWithGemini(model, prompt, apiKey);
      if (imageResult) break;
    }
    if (!imageResult) {
      return Response.json({ error: "Map generation failed with all models" }, { status: 502 });
    }

    const imageBuffer = Buffer.from(imageResult.base64, "base64");
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(cachedPath, imageBuffer, { contentType: imageResult.mimeType, upsert: true });

    if (uploadError) {
      console.error("[map] Storage upload error:", uploadError);
      return Response.json({
        imageUrl: `data:${imageResult.mimeType};base64,${imageResult.base64}`,
        cached: false,
      });
    }

    const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(cachedPath);
    const publicUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
    await persistMapUrl(supabase, tripId, publicUrl);

    return Response.json({ imageUrl: publicUrl, cached: false });
  } catch (err) {
    console.error("[map] error:", err);
    return Response.json({ error: "Map generation failed" }, { status: 500 });
  }
}
