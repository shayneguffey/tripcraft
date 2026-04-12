export const maxDuration = 30;

import { NextResponse } from "next/server";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const SYSTEM_PROMPT = `You are a travel document analysis expert. Analyze the provided image of a travel-related document and extract key information.

Return ONLY valid JSON (no markdown fences, no explanation):

{
  "name": "Short descriptive title for this document",
  "doc_type": "booking|visa|insurance|passport|itinerary|receipt|voucher|map|ticket|general",
  "category": "flights|accommodation|transport|activities|personal|financial|other",
  "reference_number": "Any booking reference, confirmation number, policy number, ticket number, etc.",
  "dates": "Any relevant dates found (check-in, departure, validity, etc.) as a brief string",
  "provider": "Company/airline/hotel/agency name",
  "ai_summary": "One or two sentence summary of what this document is and its key details"
}

DOCUMENT TYPE GUIDE:
- booking: Hotel, flight, tour, restaurant reservation confirmations
- visa: Visa approvals, e-visas, visa application receipts
- insurance: Travel insurance policies, coverage documents
- passport: Passport pages, ID documents
- itinerary: Day-by-day plans, tour schedules
- receipt: Payment receipts, invoices
- voucher: Hotel vouchers, activity vouchers, discount codes
- map: Maps, directions, transit maps
- ticket: Event tickets, train tickets, museum passes
- general: Anything that doesn't fit above

CATEGORY GUIDE:
- flights: Anything related to air travel
- accommodation: Hotels, Airbnbs, hostels
- transport: Ground transport, car rentals, trains, ferries
- activities: Tours, attractions, events
- personal: Passports, visas, ID, health documents
- financial: Insurance, receipts, currency exchange
- other: General documents

RULES:
- Be specific with the name (e.g. "Hilton Bangkok Confirmation" not just "Hotel Booking")
- Extract ALL reference numbers visible
- For dates, include the most important ones (check-in/out, departure, validity)
- Provider should be the main company name
- Summary should mention key details like amounts, dates, locations
- Return raw JSON only`;

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { image, mimeType } = body;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const base64Data = image.includes(",") ? image.split(",")[1] : image;
    const imageMediaType = mimeType || "image/png";

    // Try with responseMimeType first, fall back without it
    let geminiResponse = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: SYSTEM_PROMPT },
            { inlineData: { mimeType: imageMediaType, data: base64Data } },
          ],
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      }),
    });

    // Retry without responseMimeType if it fails
    if (!geminiResponse.ok) {
      geminiResponse = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: SYSTEM_PROMPT },
              { inlineData: { mimeType: imageMediaType, data: base64Data } },
            ],
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 4096,
          },
        }),
      });
    }

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errorText);
      let detail = "";
      try { detail = JSON.parse(errorText)?.error?.message || errorText.substring(0, 300); } catch (_) { detail = errorText.substring(0, 300); }
      return NextResponse.json({ error: `Gemini API error (${geminiResponse.status}): ${detail}` }, { status: 502 });
    }

    const geminiData = await geminiResponse.json();
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

    let cleanJson = responseText.trim();
    cleanJson = cleanJson.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?\s*```\s*$/i, "");
    const firstBrace = cleanJson.indexOf("{");
    const lastBrace = cleanJson.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
    }
    cleanJson = cleanJson.replace(/,\s*([}\]])/g, "$1");

    const docData = JSON.parse(cleanJson);
    return NextResponse.json(docData);
  } catch (error) {
    console.error("Parse document error:", error);
    return NextResponse.json({ error: "Failed to parse document: " + error.message }, { status: 500 });
  }
}
