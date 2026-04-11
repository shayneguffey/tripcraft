// Server-side API route: sends a screenshot or URL to Gemini to extract activity/tour data

import { NextResponse } from "next/server";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const SYSTEM_PROMPT = `You are a travel activity data extraction expert. You will receive either:
1. An image (screenshot) of a tour, experience, or activity booking page
2. A URL (and possibly HTML content) from a tour/activity booking site

Extract ALL information about the activity/tour/experience.

Common sources: Viator, GetYourGuide, Airbnb Experiences, Klook, TripAdvisor, Google Maps, Yelp, individual tour operator websites, attraction booking pages.

Return ONLY valid JSON (no markdown fences, no explanation):

{
  "name": "Full name of the activity/tour",
  "description": "Brief description (2-3 sentences max)",
  "category": "experience" or "tour" or "attraction" or "show" or "day_trip" or "outdoor" or "class" or "other",
  "price": number without currency symbol (per person unless noted),
  "currency": "USD",
  "price_per": "person" or "group" or "total",
  "duration_minutes": integer (convert hours to minutes, e.g. 3 hours = 180),
  "start_time": "HH:MM in 24-hour format" or null,
  "location_name": "Where the activity takes place (landmark, area, city)",
  "address": "Street address if available",
  "provider": "Booking platform or tour operator name",
  "rating": number like 4.7 (out of 5),
  "review_count": integer number of reviews,
  "source": "Website name"
}

CRITICAL RULES:
- NEVER return null if the data is visible/available
- For duration: convert to minutes (2 hours = 120, 3.5 hours = 210, "half day" = 240, "full day" = 480)
- For price: extract the base/main price as a number. Note if it's per person or per group
- For rating: use a 5-point scale. If shown as percentage, convert (90% = 4.5)
- For category: "tour" = guided tours, "experience" = hands-on activities, "attraction" = places to visit, "outdoor" = hiking/kayaking/etc, "class" = cooking/art/etc, "day_trip" = full day excursions, "show" = performances/entertainment
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
          signal: AbortSignal.timeout(8000),
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

      let msg = `Extract activity/tour information from this URL:\n${url}`;
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

    console.log("Gemini activity response (first 300):", responseText.substring(0, 300));

    // Parse JSON
    let cleanJson = responseText.trim();
    cleanJson = cleanJson.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?\s*```\s*$/i, "");
    const firstBrace = cleanJson.indexOf("{");
    const lastBrace = cleanJson.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
    }
    cleanJson = cleanJson.replace(/,\s*([}\]])/g, "$1");

    const activityData = JSON.parse(cleanJson);
    return NextResponse.json(activityData);
  } catch (error) {
    console.error("Parse activity API error:", error);
    return NextResponse.json(
      { error: "Failed to parse activity: " + error.message },
      { status: 500 }
    );
  }
}
