import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || text.trim().length < 5) {
      return NextResponse.json(
        { medicines: [] },
        { status: 200 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
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
You are a medical text analyzer.

Task:
Extract ONLY medicine names from the prescription text below.

Strict Rules:
- Return ONLY medicine names
- Do NOT include dosage, instructions, or extra text
- Do NOT explain anything
- Return as a simple comma-separated list
- If no medicines found, return: NONE

Prescription Text:
${text}
                  `,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    const raw =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!raw || raw.toUpperCase().includes("NONE")) {
      return NextResponse.json({ medicines: [] });
    }

    // Clean & convert to array
    const medicines = raw
      .split(",")
      .map((m: string) => m.trim())
      .filter((m: string) => m.length > 1);

    return NextResponse.json({ medicines });
  } catch (error) {
    console.error("Medicine extraction error:", error);
    return NextResponse.json(
      { medicines: [] },
      { status: 500 }
    );
  }
}