import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ suggestions: [] });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    const prompt = `
Based on the following AI health answer, generate exactly 4 follow-up questions a user might ask next.

Answer:
${text}

Rules:
- Each item must be a complete question
- Each question must end with a question mark
- Return the questions as a numbered list

Example format:

1. Question one?
2. Question two?
3. Question three?
4. Question four?
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
      },
    );

    const data = await response.json();

    const output = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const suggestions = output
      .split(/\d+\.\s/)
      .map((q: string) => q.trim())
      .filter((q: string) => q.length > 10)
      .slice(0, 4);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Suggestion API error:", error);
    return NextResponse.json({ suggestions: [] });
  }
}
