import { NextRequest, NextResponse } from "next/server";

const RED_FLAG_SYMPTOMS = [
  "chest pain",
  "breathing difficulty",
  "shortness of breath",
  "severe dizziness",
  "unconscious",
  "loss of consciousness",
  "persistent high fever",
];

const normalize = (text: string) => text.toLowerCase().trim();

const calculateSeverity = (
  symptoms: string[],
  customText: string,
  duration?: string
): "Low" | "Moderate" | "High" => {
  const allText = [
    ...symptoms.map(normalize),
    normalize(customText || ""),
  ].join(" ");

  const hasRedFlag = RED_FLAG_SYMPTOMS.some((rf) =>
    allText.includes(rf)
  );
  if (hasRedFlag) return "High";

  const symptomCount = symptoms.length + (customText ? 1 : 0);

  if (duration === "1 week+" && symptomCount >= 2) return "High";
  if (symptomCount >= 3) return "Moderate";
  if (symptomCount === 2) return "Moderate";

  return "Low";
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      symptoms = [],
      customText = "",
      location = "",
      qa = null,
    } = body;

    if ((!symptoms || symptoms.length === 0) && !customText) {
      return NextResponse.json(
        { error: "Please provide at least one symptom." },
        { status: 400 }
      );
    }

    const severity = calculateSeverity(
      symptoms,
      customText,
      qa?.duration
    );

    const locationContext = location
      ? `User location: ${location}. Consider regional diseases, climate, and seasonal patterns common in this area of India.`
      : `Location not provided. Perform general global medical analysis.`;

    const prompt = `
You are an AI health assistant inside CareCompass (a student health app).

CRITICAL RULES:
- Do NOT give a medical diagnosis
- Provide risk-based educational insights only
- Use clear, student-friendly language
- MUST include illness likelihood in percentage
- Be structured and clinical but simple

User Symptoms:
${symptoms.join(", ") || "None"}

Additional Symptoms:
${customText || "None"}

${locationContext}

Pre-calculated Severity: ${severity}

Return STRICT structured format:

🔎 Possible Conditions (with likelihood %)
1. Condition Name — XX%
2. Condition Name — XX%
3. Condition Name — XX%

🧠 Reasoning:
Explain why these conditions match the symptoms.

🩺 Recommended Next Steps:
Simple actionable steps for a student.

🚨 When to See a Doctor:
Mention red flag situations clearly.

⚠️ Disclaimer:
This is non-diagnostic AI guidance, not a medical diagnosis.
`;

    // 🔥 FIX 1: Use stable Gemini model (no 404)
    const geminiRes = await fetch(
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

    const data = await geminiRes.json();

    console.log("Gemini Disease Predictor Response:", data);

    let aiText =
      "⚠️ Unable to generate analysis at the moment. Please try again.";

    // 🔥 ROBUST PARSING (handles all Gemini formats)
    if (data?.candidates?.length > 0) {
      const parts = data.candidates[0]?.content?.parts;

      if (Array.isArray(parts) && parts.length > 0) {
        aiText = parts
          .map((p: any) => p?.text || "")
          .join("\n")
          .trim();
      }
    }

    // 🚨 If Gemini API returned error
    if (data?.error) {
      console.error("Gemini API Error:", data.error);
      aiText =
        "AI service temporarily unavailable. Showing basic risk guidance only.";
    }

    return NextResponse.json({
      prediction: aiText,
      severity,
    });
  } catch (error) {
    console.error("Disease Predictor API Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze symptoms." },
      { status: 500 }
    );
  }
}