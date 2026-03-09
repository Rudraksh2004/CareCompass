import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ suggestions: [] });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    const prompt = `
You are an AI health assistant.

Based on the following AI response, generate 3 short follow-up health questions the user might ask next.

Rules:
- Questions must be short
- Keep them helpful
- Do not repeat the same topic
- Return ONLY the questions

AI Response:
${text}

Format output as JSON:

{
  "suggestions": [
    "question 1",
    "question 2",
    "question 3"
  ]
}
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
            maxOutputTokens: 200,
          },
        }),
      }
    );

    const data = await response.json();

    const textOutput =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let suggestions: string[] = [];

    try {
      const parsed = JSON.parse(textOutput);
      suggestions = parsed.suggestions || [];
    } catch {
      suggestions = [];
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Suggestion API error:", error);

    return NextResponse.json({ suggestions: [] });
  }
}