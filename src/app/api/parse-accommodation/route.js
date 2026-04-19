// Server-side API route: sends a screenshot or URL to Gemini to extract accommodation data

export const maxDuration = 30; // Allow up to 30s on Vercel (default is 10s)

import { NextResponse } from "next/server";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const SYSTEM_PROMPT = `You are a travel accommodation data extraction expert. You will receive either:
1. An image (screenshot) of a hotel, Airbnb, or accommodation booking page
2. A URL (and possibly HTML content) from a booking site

Extract ALL information about the accommodation.

Common sources: Booking.com, Airbnb, Hotels.com, Expedia, VRBO, TripAdvisor, individual hotel websites.

Return ONLY valid JSON (no markdown fences, no explanation):

{
  "name": "Property name",
  "description": "Brief description (2-3 sentences max)",
  "category": "hotel" or "airbnb" or "hostel" or "resort" or "vacation_rental" or "boutique" or "other",
  "price_per_night": number (nightly rate),
  "total_price": number (total for stay if available),
  "currency": "USD",
  "check_in_date": "YYYY-MM-DD" or null,
  "check_out_date": "YYYY-MM-DD" or null,
  "room_type": "Private Room" or "Entire Place" or "Shared Room" or similar,
  "bedrooms": integer,
  "bathrooms": integer,
  "max_guests": integer,
  "rating": number like 4.7 (out of 5),
  "review_count": integer number of reviews,
  "amenities": "wifi, kitchen, pool, parking, ac" (comma-separated list),
  "cancellation_policy": "Free cancellation" or policy description,
  "location_name": "City or area name (e.g. 'Phuket', 'Shibuya, Tokyo')",
  "address": "Full street address (e.g. '10 Moo 4, Srisoonthorn Road, Cherngtalay, Phuket 83110')",
  "distance_info": "Distance to landmarks or attractions",
  "provider": "Booking platform name"
}

CRITICAL RULES:
- NEVER return null if the data is visible/available
- For amenities: return as comma-separated list (wifi, kitchen, pool, parking, ac, etc)
- For category: "hotel" = hotels, "airbnb" = Airbnb/homestays, "hostel" = hostels, "resort" = resorts, "vacation_rental" = VRBO/vacation rentals, "boutique" = boutique hotels
- For price: extract the nightly rate and total price separately
- For dates: extract check-in and check-out dates if visible
- For rating: use a 5-point scale. If shown as percentage, convert (90% = 4.5)
- For room type: extract private room, shared room, entire place, studio, suite, etc.
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

      let msg = `Extract accommodation information from this URL:\n${url}`;
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

    console.log("Gemini accommodation response (first 300):", responseText.substring(0, 300));

    // Parse JSON
    let cleanJson = responseText.trim();
    cleanJson = cleanJson.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?\s*```\s*$/i, "");
    const firstBrace = cleanJson.indexOf("{");
    const lastBrace = cleanJson.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
    }
    cleanJson = cleanJson.replace(/,\s*([}\]])/g, "$1");

    const accommodationData = JSON.parse(cleanJson);
    return NextResponse.json(accommodationData);
  } catch (error) {
    console.error("Parse accommodation API error:", error);
    return NextResponse.json(
      { error: "Failed to parse accommodation: " + error.message },
      { status: 500 }
    );
  }
}
