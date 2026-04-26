/**
 * AI Trip Pitch API — generates a short, punchy "pitch" describing the trip.
 *
 * POST { destination, title, startDate, endDate, numTravelers, days?, highlights? }
 * Returns: { pitch: string }
 *
 * The pitch is 2–3 sentences, declarative voice, capturing the spirit of the
 * trip in the WPA travel-poster register (vivid, slightly elevated, no clichés).
 */

export const maxDuration = 30;

import { NextResponse } from "next/server";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const SYSTEM_PROMPT = `You write trip pitches for a travel-planning app. Each pitch is the opening
paragraph of a printable Trip Plan: 2–3 sentences, 35–55 words total. Voice is
warm, vivid, declarative — like a 1930s travel-poster caption written by a
modern travel writer. Mention the destination by name. Hint at what makes this
particular trip special (terrain, theme, season, the people going). Avoid
clichés ("hidden gem", "must-see", "bucket list", "adventure of a lifetime").
Avoid second-person ("you'll love…"); write about the trip, not the reader.
Return ONLY the pitch text, no quotes, no preamble, no markdown.`;

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    const body = await request.json();
    const {
      destination, title, startDate, endDate, numTravelers,
      travelers = [], days = [], highlights = [],
    } = body;

    let userMessage = "Trip context:\n";
    if (title) userMessage += `Title: ${title}\n`;
    if (destination) userMessage += `Destination: ${destination}\n`;
    if (startDate && endDate) userMessage += `Dates: ${startDate} to ${endDate}\n`;
    if (numTravelers) userMessage += `Travelers: ${numTravelers}\n`;
    if (travelers.length > 0) {
      userMessage += `Travelers: ${travelers.map((t) => `${t.name}${t.role ? ` (${t.role})` : ""}`).join(", ")}\n`;
    }
    if (days.length > 0) {
      userMessage += `\nDay-by-day highlights:\n`;
      days.forEach((d, i) => {
        const t = d.title ? d.title : "";
        const evts = (d.events || []).slice(0, 3).join(", ");
        userMessage += `Day ${i + 1} (${d.date}): ${t}${evts ? ` — ${evts}` : ""}\n`;
      });
    }
    if (highlights.length > 0) {
      userMessage += `\nNotable highlights: ${highlights.join("; ")}\n`;
    }
    userMessage += "\nWrite the pitch.";

    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: SYSTEM_PROMPT }, { text: userMessage }] }],
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 512,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("[ai/pitch] Gemini error:", geminiResponse.status, errText);
      return NextResponse.json({ error: "Failed to generate pitch" }, { status: 502 });
    }

    const data = await geminiResponse.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const pitch = text.trim().replace(/^["'\u201c\u201d]|["'\u201c\u201d]$/g, "").trim();

    if (!pitch) {
      return NextResponse.json({ error: "Empty response from model" }, { status: 502 });
    }

    return NextResponse.json({ pitch });
  } catch (err) {
    console.error("[ai/pitch] error:", err);
    return NextResponse.json({ error: "Failed to generate pitch" }, { status: 500 });
  }
}
