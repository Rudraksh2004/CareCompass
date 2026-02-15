import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { profile, healthLogs, reports, prescriptions } =
      await req.json();

    const prompt = `
You are CareCompass, a non-diagnostic AI health companion.

User Profile:
- Name: ${profile?.name || "Unknown"}
- Age: ${profile?.age || "Unknown"}
- Blood Group: ${profile?.bloodGroup || "Unknown"}

Health Logs:
${JSON.stringify(healthLogs, null, 2)}

Medical Reports History:
${JSON.stringify(reports, null, 2)}

Prescription History:
${JSON.stringify(prescriptions, null, 2)}

TASK:
Generate a clear, simple, NON-DIAGNOSTIC health summary including:
1. Overall trend analysis
2. Possible lifestyle observations
3. Gentle health suggestions (non-medical)
4. Risk flags (if any abnormal patterns)
5. Encouraging tone

IMPORTANT:
- Do NOT give medical diagnosis
- Do NOT prescribe treatment
- Keep language simple for non-medical users
- Add a disclaimer at the end
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
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

    const summary =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Unable to generate health summary.";

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Health Summary API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate health summary" },
      { status: 500 }
    );
  }
}
