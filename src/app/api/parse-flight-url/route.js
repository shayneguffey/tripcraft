// Server-side API route: sends a flight URL (+ fetched page content) to Gemini for extraction

export const maxDuration = 30; // Allow up to 30s on Vercel

import { NextResponse } from "next/server";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const SYSTEM_PROMPT = `You are a flight data extraction expert. You will receive a flight booking or search URL, and possibly HTML content from that page. Your job is to extract EVERY piece of flight information available.

IMPORTANT: You must be thorough. Extract ALL of these fields for EVERY flight leg. Do not leave fields as null if the data exists anywhere in the URL or page content.

How to find data in URLs:
- Google Flights: decode the "tfs" base64 parameter — it contains protobuf with airport codes, dates, airline codes, flight numbers. The "tfu" parameter contains price data encoded in protobuf (amount in cents + currency).
- Delta: "itinSegment[N]" params have format segNum:cabinCode:FROM:TO:AIRLINE:flightNum:MONTH:day:year:time. "price" param has the fare.
- Skyscanner: path contains /from/to/YYMMDD/YYMMDD/. Config segment has departure/arrival times as YYMMDDHHMM.
- Alaska Airlines: look for route, date, and flight data in URL params or page content.
- United, American, Southwest, etc.: examine all URL parameters for encoded flight data.

How to find data in page content:
- Look for airport codes (3 letters), dates, times (AM/PM or 24h), flight numbers (XX 1234), prices ($xxx.xx), durations (Xh Ym), cabin class, airline names.

Return ONLY valid JSON (no markdown fences, no explanation, no comments):

{
  "name": "human-friendly name for this whole flight option (e.g. \"JFK \u2192 SEA, Jun 30\" or the airline+route). REQUIRED \u2014 if the source doesn\'t state one, generate from first leg origin \u2192 last leg destination plus the first leg date.",
  "trip_type": "one_way" | "round_trip" | "multi_city" | "open_jaw" | null,
  "confirmation_number": "master booking PNR / confirmation code if visible, else null",
  "booking_site": "where the booking was made (e.g. \"Delta.com\", \"Expedia\", \"Chase Travel\"). Look at the URL hostname or any \"booked through\" text. null if not visible.",
  "refundable": true | false | null,
  "change_fee_policy": "free-text policy snippet if visible (e.g. \"$200 change fee\", \"Non-refundable, $99 change fee, no value retained\")",
  "flights": [
    {
      "departure_airport": "3-letter IATA code",
      "arrival_airport": "3-letter IATA code",
      "departure_date": "YYYY-MM-DD",
      "departure_time": "HH:MM in 24-hour format",
      "arrival_date": "YYYY-MM-DD (only if different from departure_date, otherwise same as departure_date)",
      "arrival_time": "HH:MM in 24-hour format",
      "airline_code": "2-letter IATA code (marketing carrier)",
      "airline_name": "Full marketing-carrier airline name",
      "flight_number": "XX 1234 format",
      "operating_airline_code": "2-letter IATA code if codeshare, else null",
      "operating_airline_name": "Operating-carrier airline name if codeshare, else null",
      "duration_minutes": integer,
      "cabin_class": "economy" or "business" or "first",
      "aircraft_type": "e.g. Boeing 737, Airbus A320, null if not visible",
      "terminal_departure": "departure terminal label if visible (e.g. \"4\", \"B\"), else null",
      "terminal_arrival": "arrival terminal label if visible, else null",
      "gate_departure": "departure gate label if visible (typically only on day-of), else null",
      "gate_arrival": "arrival gate label if visible, else null",
      "seat": "seat assignment for this leg if visible (e.g. \"23A\"), else null",
      "baggage_allowance": "baggage rules for this leg if visible (e.g. \"1 carry-on + 1 checked\", \"2 \u00d7 23kg\"), else null",
      "segment_confirmation": "if this leg has its own PNR distinct from the master, else null"
    }
  ],
  "total_price": number without currency symbol,
  "currency": "USD",
  "airline_name": "Primary airline",
  "num_passengers": integer (number of passengers/travelers the price covers),
  "source": "Website name"
}

CRITICAL RULES:
- NEVER return null for a field if you can determine or reasonably infer the value
- For times: always use 24-hour format (18:53 not 6:53 PM)
- For dates: always use YYYY-MM-DD format. If no year shown, use 2026
- For duration: calculate from departure/arrival times if not explicitly stated
- For price: look in URL params (price=, fare=, tfu=) AND page content ($xxx.xx patterns)
- For airline: read the marketing carrier into airline_name/airline_code; if "operated by X" appears, populate operating_airline_*
- For trip_type: if legs reverse the route, "round_trip"; one direction only, "one_way"; >2 distinct routes, "multi_city"; arrive in one city and depart from a different city, "open_jaw"
- Order legs CHRONOLOGICALLY by departure date+time. Do NOT label "outbound"/"return"
- For passengers: look for "1 passenger", "2 adults", "passengers=2", traveler count in URL params or page content. Default to 1 if not found
- For confirmation_number / booking_site / refundable / change_fee_policy: extract if visible (e.g. URL host = "delta.com" → booking_site "Delta.com"); else null
- For terminal/gate/seat/baggage: leave null on search results; only populate from confirmed booking pages
- Always produce a non-empty "name" — if none in source, generate it from "{first_leg_dep} \u2192 {last_leg_arr}, {first_leg_date}"
- Return raw JSON only — no backticks, no markdown, no explanation text`;

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured. Add GEMINI_API_KEY to your environment variables." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // Try to fetch the page content (best-effort — many airline pages are JS-rendered)
    let pageContent = "";
    try {
      const pageResponse = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(8000),
      });

      if (pageResponse.ok) {
        const html = await pageResponse.text();
        // Strip scripts/styles, keep text + important meta/data attributes
        pageContent = html
          .replace(/<script[\s\S]*?<\/script>/gi, "")
          .replace(/<style[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .substring(0, 8000); // More content for better extraction
      }
    } catch (fetchErr) {
      console.log("Could not fetch URL:", fetchErr.message);
    }

    // Build the user message — include the full URL for parameter analysis
    let userMessage = `Extract ALL flight information from this URL. Decode any encoded parameters.\n\nFull URL:\n${url}`;
    if (pageContent) {
      userMessage += `\n\nPage text content:\n${pageContent}`;
    } else {
      userMessage += `\n\n(Could not fetch page content — extract everything you can from the URL parameters alone)`;
    }

    // Call Gemini API
    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: SYSTEM_PROMPT },
              { text: userMessage },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errorText);
      let detail = "";
      try { detail = JSON.parse(errorText)?.error?.message || errorText.substring(0, 300); } catch (_) { detail = errorText.substring(0, 300); }
      return NextResponse.json(
        { error: `Gemini API error (${geminiResponse.status}): ${detail}` },
        { status: 502 }
      );
    }

    const geminiData = await geminiResponse.json();

    // Gemini 2.5 Flash is a thinking model — the response may have multiple parts
    // (thought parts + text parts). We need the last text part (non-thought).
    const parts = geminiData.candidates?.[0]?.content?.parts || [];
    let responseText = "";
    for (const part of parts) {
      if (part.text && !part.thought) {
        responseText = part.text;
      }
    }
    // Fallback: if no non-thought part found, try the first text part
    if (!responseText) {
      responseText = parts.find(p => p.text)?.text || "";
    }

    if (!responseText) {
      return NextResponse.json({ error: "No response from Gemini" }, { status: 502 });
    }

    console.log("Gemini URL response (first 300):", responseText.substring(0, 300));

    // Parse JSON — handle any extra formatting
    let cleanJson = responseText.trim();
    cleanJson = cleanJson.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?\s*```\s*$/i, "");
    const firstBrace = cleanJson.indexOf("{");
    const lastBrace = cleanJson.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
    }
    cleanJson = cleanJson.replace(/,\s*([}\]])/g, "$1");

    const flightData = JSON.parse(cleanJson);

    return NextResponse.json(flightData);
  } catch (error) {
    console.error("Parse flight URL API error:", error);
    return NextResponse.json(
      { error: "Failed to parse flight URL: " + error.message },
      { status: 500 }
    );
  }
}
