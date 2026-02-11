import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { logs, type } = await req.json();

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
You are CareCompass AI.

Analyze the following ${type} data points and give insights.

Rules:
- Do NOT diagnose diseases
- Provide general trend observations
- Mention if increasing, decreasing or stable
- Suggest healthy habits (general advice only)

Data:
${JSON.stringify(logs)}
                  `,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    const insight =
      data.candidates?.[0]?.content?.parts?.[0]?.text;

    return NextResponse.json({ insight });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Insight generation failed" },
      { status: 500 }
    );
  }
}
