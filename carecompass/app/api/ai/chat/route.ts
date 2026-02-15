import { NextResponse } from "next/server";
import { GEMINI_CONFIG } from "@/lib/aiConfig";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    const response = await fetch(
      `${GEMINI_CONFIG.baseUrl}/models/${GEMINI_CONFIG.model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `
You are CareCompass, a non-diagnostic AI health assistant.

Rules:
- Do NOT diagnose
- Do NOT prescribe medicine
- Provide educational health information
- Be calm and supportive

User Question:
${message}
                  `,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text;

    return NextResponse.json({ reply });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Chat failed" },
      { status: 500 }
    );
  }
}
