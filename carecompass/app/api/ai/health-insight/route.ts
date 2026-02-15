import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { logs, type } = await req.json();

    if (!logs || logs.length === 0) {
      return NextResponse.json({
        insight: "No health data available to analyze.",
      });
    }

    const formattedLogs = logs
      .map((log: any, i: number) => `Entry ${i + 1}: ${log.value}`)
      .join("\n");

    const prompt = `
You are CareCompass AI, a non-diagnostic health assistant.

Health Metric: ${type}

User Health Logs (chronological):
${formattedLogs}

Explain:
1. What the trend suggests (simple language)
2. Whether values are stable, increasing, or fluctuating
3. Lifestyle insights (non-medical)
4. Gentle wellness suggestions
5. Add a short disclaimer: Not medical advice
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
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

    console.log("Health Insight API Response:", data);

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "AI insight could not be generated.";

    return NextResponse.json({ insight: text });
  } catch (error) {
    console.error("Health Insight Error:", error);
    return NextResponse.json(
      { insight: "Health insight failed due to server error." },
      { status: 500 }
    );
  }
}
