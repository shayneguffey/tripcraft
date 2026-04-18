/**
 * Generate Poster API — creates vintage travel poster-style images.
 *
 * Two generation strategies (tried in order):
 *   1. Gemini 2.0 Flash image generation  (generateContent with responseModalities)
 *   2. Imagen 3 predict endpoint          (predict with instances)
 *
 * Flow:
 *   a. Check Supabase storage cache for existing poster
 *   b. If not cached, try Gemini Flash, then Imagen
 *   c. Upload the result to Supabase storage
 *   d. Return the public URL
 *
 * POST body: { destination: string, tripId: string }
 * Returns:   { imageUrl: string, cached: boolean }
 */

import { createClient } from "@supabase/supabase-js";

const BUCKET = "trip-posters";

// ─── Model endpoints (ordered by preference) ─────────────────────
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

// Gemini 2.5 Flash Image (Nano Banana) — fast, reliable
const GEMINI_25_MODEL = "gemini-2.5-flash-image";
// Gemini 3.1 Flash Image (Nano Banana 2) — fallback
const GEMINI_31_MODEL = "gemini-3.1-flash-image-preview";

// ─── Supabase admin client (server-side only) ─────────────────────
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * Build the prompt for a vintage travel poster.
 * Carefully crafted to match the WPA / Art Deco flat posterized style
 * from the reference images, WITHOUT any text in the image.
 */
function buildPosterPrompt(destination) {
  return [
    "IMPORTANT RULES: The image must contain absolutely ZERO text, words, or letters. The painting must extend to every edge with no border, frame, or margin.",
    `A full-bleed vintage travel poster painting of ${destination}.`,
    "Flat posterized art style inspired by 1930s WPA national park posters and Art Deco travel advertisements.",
    "Bold flat color blocks, limited warm muted palette: earthy tones, deep teals, warm oranges, muted golds, soft blues.",
    "Show the most iconic landmark or scenery of this destination as the dominant focal point filling most of the canvas.",
    "The landmark should occupy at least two-thirds of the composition. Keep sky minimal — just a narrow band at top.",
    "Vary the sky: layered clouds, color gradient bands, atmospheric haze, golden hour, or moody overcast. Never sunburst rays.",
    "Stylized geometric shapes, simplified forms, clean lines, painterly quality.",
    "Portrait orientation. Full-bleed edge-to-edge painting with no border anywhere.",
  ].join(" ");
}

/**
 * Normalize destination into a safe filename slug for storage.
 * e.g., "Paris, France" → "paris-france"
 */
function slugify(destination) {
  return destination
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Gemini generateContent image generation ──────────────────────
async function generateWithGemini(modelName, prompt, apiKey) {
  const endpoint = `${API_BASE}/${modelName}:generateContent?key=${apiKey}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
        temperature: 0.8,
        imageConfig: {
          aspectRatio: "3:4",
        },
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[${modelName}] error:`, res.status, errText);
    return null;
  }

  const data = await res.json();

  // Find the image part in the response
  const parts = data?.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      console.log(`[${modelName}] ✓ image generated successfully`);
      return {
        base64: part.inlineData.data,
        mimeType: part.inlineData.mimeType || "image/png",
      };
    }
  }

  console.error(`[${modelName}] No image part in response:`, JSON.stringify(data).slice(0, 500));
  return null;
}

// ─── Main handler ─────────────────────────────────────────────────
export async function POST(request) {
  try {
    const { destination, tripId, regenerate: regen } = await request.json();

    if (!destination) {
      return Response.json({ error: "Missing destination" }, { status: 400 });
    }

    const regenerate = regen === true;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Image generation not configured" }, { status: 500 });
    }

    const supabase = getSupabaseAdmin();
    const slug = slugify(destination);

    // ─── Step 1: Check cache (skip if regenerating) ──────────
    const cachedPath = `shared/${slug}.png`;
    if (!regenerate) {
      const { data: cachedFile } = await supabase.storage
        .from(BUCKET)
        .getPublicUrl(cachedPath);

      // Verify the file actually exists
      if (cachedFile?.publicUrl) {
        const { data: fileList } = await supabase.storage
          .from(BUCKET)
          .list("shared", { search: `${slug}.png`, limit: 1 });

        if (fileList && fileList.length > 0) {
          return Response.json({
            imageUrl: cachedFile.publicUrl,
            cached: true,
          });
        }
      }
    }

    // ─── Step 2: Generate image (try models in order) ───────────────
    const prompt = buildPosterPrompt(destination);
    let imageResult = null;

    const modelsToTry = [GEMINI_25_MODEL, GEMINI_31_MODEL];

    for (const model of modelsToTry) {
      console.log(`Trying ${model} for:`, destination);
      imageResult = await generateWithGemini(model, prompt, apiKey);
      if (imageResult) break;
    }

    if (!imageResult) {
      console.error("All image generation models failed for:", destination);
      return Response.json(
        { error: "Image generation failed with all models" },
        { status: 502 }
      );
    }

    // ─── Step 3: Upload to Supabase storage ───────────────────────
    const imageBuffer = Buffer.from(imageResult.base64, "base64");

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(cachedPath, imageBuffer, {
        contentType: imageResult.mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      // Fall back to returning data URL if storage fails
      return Response.json({
        imageUrl: `data:${imageResult.mimeType};base64,${imageResult.base64}`,
        cached: false,
      });
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(cachedPath);

    // Append a cache-buster for fresh uploads
    const publicUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

    return Response.json({
      imageUrl: publicUrl,
      cached: false,
    });
  } catch (err) {
    console.error("Generate poster error:", err);
    return Response.json(
      { error: "Failed to generate poster image" },
      { status: 500 }
    );
  }
}
