/**
 * Batch poster generation — pre-generates poster images for the top 100
 * travel destinations. Skips any that already exist in storage.
 *
 * GET /api/generate-bank          — generates all missing posters
 * GET /api/generate-bank?limit=5  — generates up to 5 missing posters
 * GET /api/generate-bank?status=1 — returns count of existing vs missing
 *
 * Each image takes ~7 seconds. Run with a high limit or repeatedly
 * to build up the full bank over time.
 */

import { createClient } from "@supabase/supabase-js";

const BUCKET = "trip-posters";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_25_MODEL = "gemini-2.5-flash-image";
const GEMINI_31_MODEL = "gemini-3.1-flash-image-preview";

const DESTINATIONS = [
  "Paris France", "Rome Italy", "Barcelona Spain", "London England",
  "Amsterdam Netherlands", "Santorini Greece", "Athens Greece",
  "Prague Czech Republic", "Vienna Austria", "Dubrovnik Croatia",
  "Amalfi Coast Italy", "Edinburgh Scotland", "Lisbon Portugal",
  "Swiss Alps Switzerland", "Reykjavik Iceland", "Istanbul Turkey",
  "Budapest Hungary", "Cinque Terre Italy", "Norwegian Fjords Norway",
  "Bruges Belgium", "Tokyo Japan", "Kyoto Japan", "Bali Indonesia",
  "Bangkok Thailand", "Singapore", "Hong Kong", "Seoul South Korea",
  "Hanoi Vietnam", "Angkor Wat Cambodia", "Jaipur India", "Maldives",
  "Phuket Thailand", "Great Wall of China", "Kathmandu Nepal",
  "Luang Prabang Laos", "Petra Jordan", "Dubai UAE", "Zhangjiajie China",
  "Ha Long Bay Vietnam", "Sri Lanka", "New York City USA",
  "Machu Picchu Peru", "Rio de Janeiro Brazil", "Havana Cuba",
  "Grand Canyon USA", "Patagonia Argentina", "Mexico City Mexico",
  "San Francisco USA", "Cartagena Colombia", "Banff National Park Canada",
  "Costa Rica", "Buenos Aires Argentina", "Yellowstone USA", "Tulum Mexico",
  "Galapagos Islands Ecuador", "Niagara Falls Canada", "Hawaiian Islands USA",
  "Antigua Guatemala", "Portland Oregon USA", "Nashville Tennessee USA",
  "Marrakech Morocco", "Cape Town South Africa", "Serengeti Tanzania",
  "Cairo Egypt", "Victoria Falls Zimbabwe", "Zanzibar Tanzania",
  "Sahara Desert Morocco", "Nairobi Kenya", "Madagascar", "Luxor Egypt",
  "Sydney Australia", "New Zealand Queenstown", "Great Barrier Reef Australia",
  "Fiji Islands", "Bora Bora French Polynesia", "Melbourne Australia",
  "Tasmania Australia", "Milford Sound New Zealand", "St Lucia Caribbean",
  "Barbados", "Jamaica", "Turks and Caicos", "Bermuda", "Puerto Rico", "Aruba",
  "Northern Lights Norway", "African Safari Kenya", "Amazon Rainforest Brazil",
  "Antarctic Peninsula", "Taj Mahal India", "Mount Fuji Japan",
  "Cappadocia Turkey", "Lake Bled Slovenia", "Santo Domingo Dominican Republic",
  "Puerto Vallarta Mexico", "Cancun Mexico", "Olympic National Park USA",
  "Cinque Terre sunset Italy", "Yosemite Valley USA", "Lake Como Italy",
  "Scottish Highlands Scotland",
];

function slugify(destination) {
  return destination.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

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

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

async function generateWithGemini(modelName, prompt, apiKey) {
  const res = await fetch(`${API_BASE}/${modelName}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
        temperature: 0.8,
        imageConfig: { aspectRatio: "3:4" },
      },
    }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      return { base64: part.inlineData.data, mimeType: part.inlineData.mimeType || "image/png" };
    }
  }
  return null;
}

export async function GET(request) {
  const url = new URL(request.url);
  const statusOnly = url.searchParams.get("status") === "1";
  const limit = parseInt(url.searchParams.get("limit") || "100", 10);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return Response.json({ error: "No GEMINI_API_KEY" }, { status: 500 });

  const supabase = getSupabaseAdmin();

  // List existing files in storage
  const { data: existingFiles } = await supabase.storage
    .from(BUCKET)
    .list("shared", { limit: 500 });
  const existingSlugs = new Set((existingFiles || []).map((f) => f.name.replace(/\.png$/, "")));

  // Find missing destinations
  const missing = DESTINATIONS.filter((d) => !existingSlugs.has(slugify(d)));

  if (statusOnly) {
    return Response.json({
      total: DESTINATIONS.length,
      existing: DESTINATIONS.length - missing.length,
      missing: missing.length,
      missingDestinations: missing.slice(0, 20),
    });
  }

  // Generate missing posters up to the limit
  const toGenerate = missing.slice(0, limit);
  const results = [];

  for (const destination of toGenerate) {
    const slug = slugify(destination);
    const prompt = buildPosterPrompt(destination);
    console.log(`[bank] Generating ${results.length + 1}/${toGenerate.length}: ${destination}`);

    let imageResult = null;
    for (const model of [GEMINI_25_MODEL, GEMINI_31_MODEL]) {
      imageResult = await generateWithGemini(model, prompt, apiKey);
      if (imageResult) break;
    }

    if (!imageResult) {
      results.push({ destination, status: "failed" });
      continue;
    }

    // Upload to storage
    const imageBuffer = Buffer.from(imageResult.base64, "base64");
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(`shared/${slug}.png`, imageBuffer, {
        contentType: imageResult.mimeType,
        upsert: true,
      });

    results.push({
      destination,
      status: uploadError ? "upload_failed" : "success",
      error: uploadError?.message,
    });
  }

  const succeeded = results.filter((r) => r.status === "success").length;
  const failed = results.filter((r) => r.status !== "success").length;

  return Response.json({
    message: `Generated ${succeeded}/${toGenerate.length} posters (${failed} failed). ${missing.length - toGenerate.length} still remaining.`,
    generated: succeeded,
    failed,
    remaining: missing.length - toGenerate.length,
    results,
  });
}
