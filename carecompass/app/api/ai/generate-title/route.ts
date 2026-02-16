import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ title: "New Chat" });
    }

    const prompt = `
Generate a very short 3-5 word medical chat title based on this user query.
Rules:
- Professional
- Clear
- Medical context
- Max 5 words
- No quotes

User message: "${message}"
Title:
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    const title =
      data?.candidates?.[0]?.content?.parts?.[0]?.text
        ?.replace(/["\n]/g, "")
        ?.trim() || "Medical Discussion";

    return NextResponse.json({ title });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ title: "Medical Chat" });
  }
}
