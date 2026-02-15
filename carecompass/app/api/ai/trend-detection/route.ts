import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { logs, type, profile } = await req.json();

    if (!logs || logs.length < 2) {
      return NextResponse.json({
        analysis: "Add at least 2 logs to detect trends.",
      });
    }

    const formattedLogs = logs
      .map((log: any, i: number) => `Entry ${i + 1}: ${log.value}`)
      .join("\n");

    const prompt = `
You are CareCompass AI Trend Analyzer (NON-DIAGNOSTIC).

User Profile:
Name: ${profile?.name || "User"}
Age: ${profile?.age || "Unknown"}
Blood Group: ${profile?.bloodGroup || "Unknown"}

Metric: ${type}

Health Data (chronological):
${formattedLogs}

Provide:
- Trend direction (Increasing / Stable / Fluctuating / Decreasing)
- Pattern analysis
- Lifestyle insights (non-medical)
- Gentle suggestions
- Safety disclaimer (not medical advice)
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
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

    console.log("Trend Detection API Response:", data);

    const analysis =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Trend analysis could not be generated.";

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Trend Detection Error:", error);
    return NextResponse.json(
      { analysis: "Trend detection failed." },
      { status: 500 }
    );
  }
}
