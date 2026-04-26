// Server-side API route: sends a screenshot or URL to Gemini to extract transportation data

export const maxDuration = 30; // Allow up to 30s on Vercel (default is 10s)

import { NextResponse } from "next/server";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const SYSTEM_PROMPT = `You are a travel transportation data extraction expert. You will receive either:
1. An image (screenshot) of a car rental, train booking, bus, ferry, or transfer service, OR
2. A URL (and possibly HTML content) from a transportation booking site.

YOUR TASK has two steps:

STEP 1 \u2014 IDENTIFY THE MODE.
Determine which transportation mode this is. Use these heuristics, then pick exactly ONE category value:

  category = "car_rental"
    Sources: Hertz, Sixt, Enterprise, Avis, Budget, National, Alamo, Rentalcars.com, AutoEurope.
    Vocabulary: "Pick-up", "Drop-off", "Days", "Mileage", "Fuel policy", "Insurance", car classes (Economy, Compact, SUV, etc).

  category = "private_transfer"
    Sources: Blacklane, Welcome Pickups, GetTransfer, SunTransfers, Klook transfers, hotel-arranged transfers, chauffeur services.
    Vocabulary: "Driver", "Meeting point", "Sign with your name", "Flight tracking", airport-to-hotel routes.

  category = "ferry"
    Sources: Stena Line, BC Ferries, Color Line, DirectFerries, Greek/Italian island operators.
    Vocabulary: "Vessel", "Foot passenger", "Vehicle deck", "Boarding deadline", "Cabin", "Dock".

  category = "train"
    Sources: Trainline, Eurostar, SNCF Connect, Trenitalia, Renfe, Amtrak, JR, Deutsche Bahn, Eurail.
    Vocabulary: "Coach", "Seat", "Platform", "Track", "Class" (1st/2nd), "Sleeper", "TGV", "ICE".

  category = "bus"
    Sources: FlixBus, Greyhound, Megabus, BoltBus, intercity coach operators.
    Vocabulary: "Bus number", "Stop", "Boarding", "Coach class".

  category = "rideshare"
    Sources: Uber pre-bookings, Lyft pre-scheduled, Grab, local rideshare apps.

  category = "shuttle"
    Sources: Hotel airport shuttles, theme park shuttles, multi-passenger transit vans on a fixed route.

  category = "taxi"
    Pre-booked taxi reservations.

  category = "other"
    Anything that doesn't fit the above (e.g., bike rental, scooter, helicopter charter).

STEP 2 \u2014 EXTRACT FIELDS.
Return ONLY valid JSON (no markdown fences, no explanation):

{
  "name": "Human-friendly name. REQUIRED. If the source doesn\\'t state one, generate from the mode + provider + route, e.g. \\"Hertz \\u2014 SEA airport pickup\\", \\"Eurostar 9114 \\u2014 STP \\u2192 GDN\\", \\"Blacklane \\u2014 LHR \\u2192 hotel\\".",
  "description": "Brief description (2-3 sentences max), or null",
  "category": one of the values listed in STEP 1,
  "provider": "The company name (Hertz, Eurostar, Blacklane, FlixBus, etc.)",
  "service_name": "Route name, train name/number, ferry line, bus route, etc.",
  "vehicle_type": "Mode-specific vehicle class. Examples: car rental \\u2192 \\"Economy\\", \\"SUV\\", \\"Luxury\\". Train \\u2192 same as class_type. Ferry \\u2192 \\"Foot passenger\\", \\"Car + driver\\", \\"RV\\". Transfer \\u2192 \\"Sedan\\", \\"SUV\\", \\"Van\\", \\"Limousine\\".",
  "class_type": "Travel class if applicable: \\"first class\\", \\"second class\\", \\"sleeper\\", \\"business\\", \\"economy\\", \\"standard\\".",
  "is_private": true | false,
  "pickup_location": "Pickup point: car rental branch, train station, ferry port, transfer pickup address.",
  "dropoff_location": "Drop-off point.",
  "departure_date": "YYYY-MM-DD" or null,
  "departure_time": "HH:MM in 24-hour format" or null,
  "arrival_date": "YYYY-MM-DD" or null,
  "arrival_time": "HH:MM in 24-hour format" or null,
  "duration_minutes": integer total journey time, or null,
  "price": number (total price as shown),
  "currency": "USD" | "EUR" | "GBP" | "JPY" | etc.,
  "price_per": "total" | "person" | "day",
  "passengers": integer or null,
  "booking_reference": "PNR / confirmation number when present, else null",
  "cancellation_policy": "Free-text policy snippet when present (e.g. \\"Free cancellation up to 24h before\\").",
  "notes": null,

  // ── Train / Bus / Ferry-specific ──
  "vehicle_id": "Train number (e.g. \\"Eurostar 9114\\"), bus number/route, ferry vessel name. null otherwise.",
  "platform_terminal": "Track for trains, platform for buses, dock for ferries, terminal for airports. null otherwise.",
  "seat_number": "Seat designation when assigned (e.g. \\"Coach 5 / Seat 32A\\", \\"Window seat 23A\\"). null otherwise.",
  "boarding_deadline": "HH:MM in 24-hour format \\u2014 typically only for ferries (\\"Boarding closes 30 min before sail time\\"). null otherwise.",

  // ── Private transfer / chauffeur-specific ──
  "driver_name": "If pre-assigned and visible, else null.",
  "driver_phone": "If provided, else null.",
  "meeting_instructions": "Where to find the driver: \\"Driver will meet you at international arrivals with sign reading [name]\\", \\"Curb pickup at door 4\\". null otherwise.",

  // ── Car rental-specific ──
  "fuel_policy": "Examples: \\"Full to full\\", \\"Prepaid full tank\\", \\"Return as received\\". null otherwise.",
  "mileage_policy": "Examples: \\"Unlimited\\", \\"100 mi/day\\". null otherwise.",
  "insurance_included": true | false | null,
  "additional_drivers": "Free-text list of additional approved drivers, e.g. \\"Jane Smith\\". null otherwise."
}

CRITICAL RULES:
- ALWAYS produce a non-empty "name" \u2014 generate one from provider + route if the source doesn\\'t supply it.
- For dates/times: YYYY-MM-DD and HH:MM (24-hour). If no year shown, assume 2026.
- For duration: calculate from departure/arrival times if not stated.
- For price: extract the main displayed price.
- For category: pick exactly one value from STEP 1. Never invent new categories.
- For mode-specific fields: leave as null when the field doesn\\'t apply to the mode (e.g. fuel_policy is null for trains; seat_number is null for car rentals).
- For booking_reference: only populate from a confirmation page; leave null on search results.
- Return raw JSON only \u2014 no backticks, no markdown.`;

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

      let msg = `Extract transportation information from this URL:\n${url}`;
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

    console.log("Gemini transportation response (first 300):", responseText.substring(0, 300));

    // Parse JSON
    let cleanJson = responseText.trim();
    cleanJson = cleanJson.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?\s*```\s*$/i, "");
    const firstBrace = cleanJson.indexOf("{");
    const lastBrace = cleanJson.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
    }
    cleanJson = cleanJson.replace(/,\s*([}\]])/g, "$1");

    const transportationData = JSON.parse(cleanJson);
    return NextResponse.json(transportationData);
  } catch (error) {
    console.error("Parse transportation API error:", error);
    return NextResponse.json(
      { error: "Failed to parse transportation: " + error.message },
      { status: 500 }
    );
  }
}
