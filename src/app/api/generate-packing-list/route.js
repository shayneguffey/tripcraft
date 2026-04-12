export const maxDuration = 30;

import { NextResponse } from "next/server";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const SYSTEM_PROMPT = `You are a travel packing expert. Based on the trip details provided, generate a comprehensive packing list.

Consider:
- Destination climate and weather for the travel dates
- Cultural norms (e.g. modest clothing for temples, smart dress codes)
- Planned activities (hiking gear, beach items, formal wear, etc.)
- Accommodation type (hostel vs hotel may affect what you bring)
- Trip duration (more days = more clothing or laundry supplies)
- Essential travel documents and health items

Return ONLY valid JSON (no markdown, no backticks, no explanation):

{
  "items": [
    {
      "text": "Item name",
      "category": "clothing|toiletries|electronics|documents|health|accessories|gear|snacks|other"
    }
  ]
}

RULES:
- Generate 20-40 items depending on trip complexity
- Be specific (e.g. "lightweight rain jacket" not just "jacket")
- Include destination-specific items (e.g. mosquito repellent for tropical areas, power adapter for the country)
- Do NOT include items the user already has (provided in existing_items)
- Category must be one of: clothing, toiletries, electronics, documents, health, accessories, gear, snacks, other
- Return raw JSON only`;

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { destination, startDate, endDate, activities, accommodation, existingItems } = body;

    let userMessage = "Generate a packing list for this trip:\n\n";
    if (destination) userMessage += `Destination: ${destination}\n`;
    if (startDate && endDate) userMessage += `Dates: ${startDate} to ${endDate}\n`;
    if (activities && activities.length > 0) userMessage += `Planned activities: ${activities.join(", ")}\n`;
    if (accommodation && accommodation.length > 0) userMessage += `Accommodation: ${accommodation.join(", ")}\n`;
    if (existingItems && existingItems.length > 0) {
      userMessage += `\nAlready on the list (DO NOT include these): ${existingItems.join(", ")}`;
    }

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
          temperature: 0.3,
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

    const result = JSON.parse(cleanJson);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Generate packing list error:", error);
    return NextResponse.json({ error: "Failed to generate packing list: " + error.message }, { status: 500 });
  }
}
