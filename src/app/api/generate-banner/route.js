/**
 * Generate Banner API — creates wide panoramic landscape banners for trip planning pages.
 *
 * Same generation pipeline as generate-poster (Gemini Flash → fallback),
 * but uses a 16:5 landscape aspect ratio and a cinematic panoramic prompt.
 *
 * POST body: { destination: string, tripId: string }
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

/**
 * Build the prompt for a wide panoramic landscape banner.
 * Cinematic, wide composition showing the destination's most iconic scenery.
 */
function buildBannerPrompt(destination) {
  return [
    "IMPORTANT RULES: The image must contain absolutely ZERO text, words, or letters. The painting must extend to every edge with no border, frame, or margin.",
    `A wide cinematic panoramic landscape painting of ${destination}.`,
    "Flat posterized art style inspired by 1930s WPA national park posters and Art Deco travel advertisements.",
    "Bold flat color blocks, limited warm muted palette: earthy tones, deep teals, warm oranges, muted golds, soft blues.",
    "Wide panoramic composition — show the iconic skyline, coastline, or landscape stretching across the full width.",
    "Layered depth with foreground, midground, and background elements creating a sense of vast space.",
    "Vary the sky: layered clouds, color gradient bands, atmospheric haze, golden hour, or moody overcast. Never sunburst rays.",
    "Stylized geometric shapes, simplified forms, clean lines, painterly quality.",
    "Landscape orientation. Full-bleed edge-to-edge painting with no border anywhere.",
  ].join(" ");
}

function slugify(destination) {
  return destination
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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
          aspectRatio: "16:9",
        },
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[banner/${modelName}] error:`, res.status, errText);
    return null;
  }

  const data = await res.json();

  const parts = data?.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      console.log(`[banner/${modelName}] ✓ image generated successfully`);
      return {
        base64: part.inlineData.data,
        mimeType: part.inlineData.mimeType || "image/png",
      };
    }
  }

  console.error(`[banner/${modelName}] No image part in response:`, JSON.stringify(data).slice(0, 500));
  return null;
}

export async function POST(request) {
  try {
    const { destination, tripId } = await request.json();

    if (!destination) {
      return Response.json({ error: "Missing destination" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Image generation not configured" }, { status: 500 });
    }

    const supabase = getSupabaseAdmin();
    const slug = slugify(destination);

    // ─── Step 1: Check cache ──────────────────────────────────
    const cachedPath = `banners/${slug}.png`;
    const { data: cachedFile } = await supabase.storage
      .from(BUCKET)
      .getPublicUrl(cachedPath);

    if (cachedFile?.publicUrl) {
      const { data: fileList } = await supabase.storage
        .from(BUCKET)
        .list("banners", { search: `${slug}.png`, limit: 1 });

      if (fileList && fileList.length > 0) {
        return Response.json({
          imageUrl: cachedFile.publicUrl,
          cached: true,
        });
      }
    }

    // ─── Step 2: Generate image ─────────────────────────────────
    const prompt = buildBannerPrompt(destination);
    let imageResult = null;

    const modelsToTry = [GEMINI_25_MODEL, GEMINI_31_MODEL];

    for (const model of modelsToTry) {
      console.log(`[banner] Trying ${model} for:`, destination);
      imageResult = await generateWithGemini(model, prompt, apiKey);
      if (imageResult) break;
    }

    if (!imageResult) {
      console.error("[banner] All models failed for:", destination);
      return Response.json(
        { error: "Banner generation failed with all models" },
        { status: 502 }
      );
    }

    // ─── Step 3: Upload to Supabase storage ─────────────────────
    const imageBuffer = Buffer.from(imageResult.base64, "base64");

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(cachedPath, imageBuffer, {
        contentType: imageResult.mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error("[banner] Storage upload error:", uploadError);
      return Response.json({
        imageUrl: `data:${imageResult.mimeType};base64,${imageResult.base64}`,
        cached: false,
      });
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(cachedPath);

    const publicUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

    return Response.json({
      imageUrl: publicUrl,
      cached: false,
    });
  } catch (err) {
    console.error("[banner] Generate error:", err);
    return Response.json(
      { error: "Failed to generate banner image" },
      { status: 500 }
    );
  }
}
