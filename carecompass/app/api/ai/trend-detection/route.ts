import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { logs, type, profile } = await req.json();

    if (!logs || logs.length === 0) {
      return NextResponse.json({
        analysis: "Not enough data to detect trends.",
      });
    }

    const prompt = `
You are an AI health trend analyzer (non-diagnostic).

User Profile:
Name: ${profile?.name || "Unknown"}
Age: ${profile?.age || "Unknown"}
Blood Group: ${profile?.bloodGroup || "Unknown"}

Health Metric Type: ${type}

Health Logs (chronological):
${JSON.stringify(logs, null, 2)}

TASK:
Analyze the trend patterns and provide:
1. Trend direction (Increasing / Decreasing / Stable)
2. Pattern observations (spikes, fluctuations, consistency)
3. Possible lifestyle insights (non-medical)
4. Gentle health suggestions (non-diagnostic)
5. Risk flags if abnormal patterns exist

RULES:
- DO NOT diagnose diseases
- DO NOT prescribe medicine
- Keep explanation simple and user-friendly
- Add a short disclaimer at the end
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
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

    const analysis =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Unable to detect trends at the moment.";

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Trend Detection Error:", error);
    return NextResponse.json(
      { analysis: "Trend analysis failed." },
      { status: 500 }
    );
  }
}
