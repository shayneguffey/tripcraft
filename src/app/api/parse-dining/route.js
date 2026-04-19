// Server-side API route: sends a screenshot or URL to Gemini to extract dining/restaurant data

export const maxDuration = 30; // Allow up to 30s on Vercel (default is 10s)

import { NextResponse } from "next/server";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const SYSTEM_PROMPT = `You are a restaurant and dining data extraction expert. You will receive either:
1. An image (screenshot) of a restaurant/dining webpage or review
2. A URL (and possibly HTML content) from a restaurant/dining booking or review site

Extract ALL information about the restaurant, cafe, or dining venue.

Common sources: Google Maps, Yelp, TripAdvisor, OpenTable, Resy, individual restaurant websites, food blogs, Instagram posts.

Return ONLY valid JSON (no markdown fences, no explanation):

{
  "name": "Full name of the restaurant/cafe/venue",
  "description": "Brief description (2-3 sentences max)",
  "cuisine_type": "Thai" or "Italian" or "Seafood" or "Japanese" or "Mexican" or "Cafe" or "Street Food" or "Other",
  "price_range": "$" or "$$" or "$$$" or "$$$$",
  "avg_meal_cost": number representing average cost per meal,
  "currency": "USD",
  "location_name": "City or area name (e.g. 'Bangkok', 'Shibuya, Tokyo')",
  "address": "Full street address (e.g. '123 Main St, City, State 12345')",
  "hours": "Business hours as string, e.g. '11am-10pm' or 'Mon-Sat 12pm-9pm'",
  "rating": number like 4.7 (out of 5),
  "review_count": integer number of reviews,
  "known_for": "Signature dishes or specialties (comma-separated or sentence)",
  "reservation_required": boolean,
  "dietary_options": "Comma-separated list: vegetarian, vegan, halal, gluten-free, etc.",
  "provider": "Source platform name (Google Maps, Yelp, TripAdvisor, etc.)",
  "meal_type": "breakfast" or "lunch" or "dinner" or "snack" or "dessert" or "drinks" (best guess)
}

CRITICAL RULES:
- NEVER return null if the data is visible/available
- For price_range: use $ symbols. "$" = budget, "$$" = moderate, "$$$" = upscale, "$$$$" = fine dining
- For avg_meal_cost: extract a numeric value representing typical cost per person for a meal
- For rating: use a 5-point scale. If shown as percentage, convert (90% = 4.5)
- For cuisine_type: identify the primary cuisine or type. Common ones: Thai, Italian, Seafood, Japanese, Mexican, Cafe, Street Food, Other
- For meal_type: infer from context (breakfast place, lunch spot, dinner restaurant, etc.)
- For dietary_options: return as comma-separated values (e.g. "vegetarian, vegan, gluten-free")
- For reservation_required: true only if explicitly stated as required
- Return raw JSON only`;

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { image, mimeType, url } = body;

    if (!image && !url) {
      return NextResponse.json({ error: "No image or URL provided" }, { status: 400 });
    }

    // Build the request parts — match the structure of the working flight parser
    let parts;

    if (image) {
      // Screenshot mode — put system prompt and image in parts (same pattern as flight parser)
      const base64Data = image.includes(",") ? image.split(",")[1] : image;
      const imageMediaType = mimeType || "image/png";
      parts = [
        { text: SYSTEM_PROMPT },
        { inlineData: { mimeType: imageMediaType, data: base64Data } },
      ];
    } else if (url) {
      // URL mode — try to fetch page content
      let pageContent = "";
      try {
        const pageResponse = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "text/html",
          },
          redirect: "follow",
          signal: AbortSignal.timeout(5000),
        });
        if (pageResponse.ok) {
          const html = await pageResponse.text();
          pageContent = html
            .replace(/<script[\s\S]*?<\/script>/gi, "")
            .replace(/<style[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .substring(0, 8000);
        }
      } catch (_) {}

      let msg = `Extract restaurant/dining information from this URL:\n${url}`;
      if (pageContent) {
        msg += `\n\nPage content:\n${pageContent}`;
      }
      parts = [{ text: SYSTEM_PROMPT }, { text: msg }];
    } else {
      return NextResponse.json({ error: "No image or URL provided" }, { status: 400 });
    }

    // Call Gemini — try with responseMimeType first, fall back without it
    async function callGemini(useJsonMime) {
      const genConfig = {
        temperature: 0.1,
        maxOutputTokens: 4096,
      };
      if (useJsonMime) genConfig.responseMimeType = "application/json";

      return fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: genConfig,
        }),
      });
    }

    let geminiResponse = await callGemini(true);

    // If responseMimeType causes an error with vision, retry without it
    if (!geminiResponse.ok) {
      const status1 = geminiResponse.status;
      const errorText1 = await geminiResponse.text();
      console.error("Gemini attempt 1 error:", status1, errorText1.substring(0, 300));

      if (image && (status1 === 400 || status1 === 500)) {
        console.log("Retrying without responseMimeType...");
        geminiResponse = await callGemini(false);
      }

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text().catch(() => errorText1);
        console.error("Gemini API final error:", geminiResponse.status, errorText.substring(0, 300));
        let detail = "";
        try { detail = JSON.parse(errorText)?.error?.message || errorText.substring(0, 300); } catch (_) { detail = errorText.substring(0, 300); }
        return NextResponse.json(
          { error: `Gemini API error (${geminiResponse.status}): ${detail}` },
          { status: 502 }
        );
      }
    }

    const geminiData = await geminiResponse.json();

    // Handle thinking model response
    const responseParts = geminiData.candidates?.[0]?.content?.parts || [];
    let responseText = "";
    for (const part of responseParts) {
      if (part.text && !part.thought) responseText = part.text;
    }
    if (!responseText) responseText = responseParts.find(p => p.text)?.text || "";

    if (!responseText) {
      console.error("Gemini returned no text. Full response:", JSON.stringify(geminiData).substring(0, 500));
      return NextResponse.json({ error: "No response from Gemini" }, { status: 502 });
    }

    console.log("Gemini dining response (first 300):", responseText.substring(0, 300));

    // Parse JSON
    let cleanJson = responseText.trim();
    cleanJson = cleanJson.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?\s*```\s*$/i, "");
    const firstBrace = cleanJson.indexOf("{");
    const lastBrace = cleanJson.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
    }
    cleanJson = cleanJson.replace(/,\s*([}\]])/g, "$1");

    const diningData = JSON.parse(cleanJson);
    return NextResponse.json(diningData);
  } catch (error) {
    console.error("Parse dining API error:", error);
    return NextResponse.json(
      { error: "Failed to parse dining: " + error.message },
      { status: 500 }
    );
  }
}
