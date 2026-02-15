import { NextResponse } from "next/server";
import { GEMINI_CONFIG } from "@/lib/aiConfig";

export async function POST(req: Request) {
  try {
    const { reportText } = await req.json();

    if (!reportText || reportText.trim() === "") {
      return NextResponse.json(
        { error: "Report text is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key missing" },
        { status: 500 }
      );
    }

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

Explain the following medical report in simple language.

Rules:
- Do NOT diagnose diseases
- Do NOT prescribe treatment
- Use bullet points
- Explain medical terms simply
- Add a section: "When should you consult a doctor?"

Medical Report:
${reportText}
                  `,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Gemini Error:", data);
      return NextResponse.json(
        { error: "Gemini API failed" },
        { status: 500 }
      );
    }

    const explanation =
      data.candidates?.[0]?.content?.parts?.[0]?.text;

    return NextResponse.json({ explanation });
  } catch (err) {
    console.error("❌ Server Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
