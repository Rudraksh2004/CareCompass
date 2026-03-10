import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ suggestions: [] });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    const prompt = `
Based on the following health AI answer, generate 3 short follow-up questions the user might ask next.

Answer:
${text}

Rules:
- Avoid numbering
- Return only the questions separated by new lines
`;

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
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 120,
          },
        }),
      }
    );

    const data = await response.json();

    const output =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const suggestions = output
      .split("\n")
      .map((s: string) =>
        s.replace(/^[0-9]+\.\s*/, "").trim()
      )
      .filter((s: string) => s.length > 5)
      .slice(0, 3);

    return NextResponse.json({ suggestions });

  } catch (error) {
    console.error("Suggestion API error:", error);
    return NextResponse.json({ suggestions: [] });
  }
}