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
      ? `User location: ${location}. Consider regional diseases and seasonal factors.`
      : `Location not provided. Perform general global medical analysis.`;

    const prompt = `
You are an AI health assistant inside CareCompass (a student health app).

STRICT RULES:
- DO NOT give a medical diagnosis
- Provide risk-based educational analysis only
- Use simple language
- Show illness likelihood in percentages
- Be structured and clean

User Symptoms (selected):
${symptoms.join(", ") || "None"}

Additional Symptoms:
${customText || "None"}

${locationContext}

Pre-calculated Severity: ${severity}

Generate response in EXACT format:

🔎 Possible Conditions (with likelihood %)
1. Condition Name — XX%
2. Condition Name — XX%
3. Condition Name — XX%

🧠 Reasoning:
(Explain based on symptoms + location)

🩺 Recommended Next Steps:
(simple actionable advice)

🚨 When to See a Doctor:
(red flag guidance)

⚠️ Disclaimer:
This is non-diagnostic AI guidance, not a medical diagnosis.
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

    // 🔥 ROBUST PARSING (FIXES your issue)
    let aiText = "Unable to generate analysis at the moment.";

    if (data?.candidates?.length > 0) {
      const parts = data.candidates[0]?.content?.parts;
      if (Array.isArray(parts)) {
        aiText = parts.map((p: any) => p.text || "").join("\n");
      }
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