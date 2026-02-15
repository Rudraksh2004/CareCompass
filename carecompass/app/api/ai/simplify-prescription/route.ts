import { NextResponse } from "next/server";
import { GEMINI_CONFIG } from "@/lib/aiConfig";

export async function POST(req: Request) {
  try {
    const { prescriptionText } = await req.json();

    if (!prescriptionText || prescriptionText.trim() === "") {
      return NextResponse.json(
        { error: "Prescription text is required" },
        { status: 400 },
      );
    }

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

Your task is to simplify the following medical prescription.

Rules:
- Do NOT diagnose any condition
- Do NOT suggest new medicines
- Explain abbreviations like BD, OD, HS, SOS
- Explain what each medicine is generally used for
- Explain when to take it (morning/night/before food etc.)
- Use simple language
- Use bullet points

Prescription:
${prescriptionText}
                  `,
                },
              ],
            },
          ],
        }),
      },
    );

    const data = await response.json();

    const simplified = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return NextResponse.json({ simplified });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Prescription simplification failed" },
      { status: 500 },
    );
  }
}
