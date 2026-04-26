// Server-side API route: sends a screenshot to Gemini Vision to extract flight data
// This runs on the server so the API key is never exposed to the browser

export const maxDuration = 30; // Allow up to 30s on Vercel

import { NextResponse } from "next/server";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const SYSTEM_PROMPT = `You are a flight data extraction expert. Analyze the provided image of an airline booking page, search results, or flight itinerary. Extract EVERY piece of flight information visible.

IMPORTANT: Be thorough. Extract ALL fields for EVERY flight leg. Do not leave fields as null if the data is visible in the image.

Return ONLY valid JSON (no markdown fences, no explanation):

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
  "num_passengers": integer (number of passengers/travelers the price covers)
}

CRITICAL RULES:
- NEVER return null for a field if the data is visible in the image
- For times: always convert to 24-hour format (18:53 not 6:53 PM)
- For dates: always use YYYY-MM-DD. If no year shown, use 2026
- For duration: if shown as "3h 7m", convert to minutes (187). If not shown, calculate from times
- For price: look for dollar amounts, "Total price", "Airfare", or any price displayed
- For airline: read the marketing carrier (the one selling the ticket) into airline_name/airline_code; if a codeshare is shown ("operated by X"), put X into operating_airline_name/operating_airline_code
- For trip_type: if all legs share an origin/destination pair in reverse, "round_trip"; one direction only, "one_way"; >2 distinct routes, "multi_city"; arrive in one city and depart from a different city, "open_jaw"
- Order legs in the "flights" array CHRONOLOGICALLY by departure date+time (no "outbound"/"return" labeling)
- For passengers: look for "1 passenger", "2 adults", "passengers: 3", traveler count, etc. Default to 1 if not visible
- For confirmation_number / booking_site / refundable / change_fee_policy: leave null if not visible (these typically only appear on confirmed bookings, not search results)
- For terminal/gate/seat: leave null on search results; populate only when visible on a real booking confirmation or boarding pass
- Always produce a non-empty "name" for the overall option — if no clear label exists, build one from the first leg\'s origin airport + an arrow + the last leg\'s destination airport, plus the first leg date
- Return raw JSON only — no backticks, no markdown`;

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
    const { image, mimeType } = body;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // image should be a base64-encoded string (without the data:image/... prefix)
    // Strip the data URL prefix if present
    const base64Data = image.includes(",") ? image.split(",")[1] : image;
    const imageMediaType = mimeType || "image/png";

    // Call Gemini Vision API
    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: SYSTEM_PROMPT },
              {
                inlineData: {
                  mimeType: imageMediaType,
                  data: base64Data,
                },
              },
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

    // Gemini 2.5 Flash is a thinking model — response may have thought + text parts
    const parts = geminiData.candidates?.[0]?.content?.parts || [];
    let responseText = "";
    for (const part of parts) {
      if (part.text && !part.thought) {
        responseText = part.text;
      }
    }
    if (!responseText) {
      responseText = parts.find(p => p.text)?.text || "";
    }

    if (!responseText) {
      return NextResponse.json({ error: "No response from Gemini" }, { status: 502 });
    }

    console.log("Gemini image response (first 300):", responseText.substring(0, 300));

    // Parse JSON — handle any extra formatting
    let cleanJson = responseText.trim();
    cleanJson = cleanJson.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?\s*```\s*$/i, "");
    const firstBrace = cleanJson.indexOf("{");
    const lastBrace = cleanJson.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
    }
    cleanJson = cleanJson.replace(/,\s*([}\]])/g, "$1");

    console.log("Gemini raw response:", responseText.substring(0, 200));

    const flightData = JSON.parse(cleanJson);

    return NextResponse.json(flightData);
  } catch (error) {
    console.error("Parse flight API error:", error);
    return NextResponse.json(
      { error: "Failed to parse flight image: " + error.message },
      { status: 500 }
    );
  }
}
