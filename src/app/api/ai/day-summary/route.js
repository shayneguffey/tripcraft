/**
 * AI Day Summary API — generates a 1–2 sentence summary for a single day.
 *
 * POST { destination, date, dayNumber, title, events: [{ kind, time, label, sub }] }
 * Returns: { summary: string }
 */

export const maxDuration = 30;

import { NextResponse } from "next/server";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const SYSTEM_PROMPT = `You write per-day summaries for a printable Trip Plan. Each summary is
1–2 sentences, 18–32 words total, in the same warm, declarative travel-poster
voice. Capture the shape of the day — what makes it a coherent chapter of
the trip. Reference the place or activity directly. No clichés ("perfect day",
"unforgettable"). No second-person. No emoji. No preamble. Return ONLY the
summary text.`;

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { destination, date, dayNumber, title, events = [] } = body;

    let userMessage = "Day context:\n";
    if (destination) userMessage += `Destination: ${destination}\n`;
    if (date) userMessage += `Date: ${date}\n`;
    if (dayNumber) userMessage += `Day number: ${dayNumber}\n`;
    if (title) userMessage += `Day title: ${title}\n`;
    if (events.length > 0) {
      userMessage += `\nEvents:\n`;
      events.forEach((e) => {
        const time = e.time ? `${e.time} ` : "";
        const sub = e.sub ? ` (${e.sub})` : "";
        userMessage += `- ${time}[${e.kind}] ${e.label}${sub}\n`;
      });
    } else {
      userMessage += `\n(no scheduled events — open day)\n`;
    }
    userMessage += "\nWrite the summary.";

    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: SYSTEM_PROMPT }, { text: userMessage }] }],
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 256,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("[ai/day-summary] Gemini error:", geminiResponse.status, errText);
      return NextResponse.json({ error: "Failed to generate summary" }, { status: 502 });
    }

    const data = await geminiResponse.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const summary = text.trim().replace(/^["'\u201c\u201d]|["'\u201c\u201d]$/g, "").trim();

    if (!summary) {
      return NextResponse.json({ error: "Empty response from model" }, { status: 502 });
    }

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("[ai/day-summary] error:", err);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
