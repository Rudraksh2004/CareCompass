import { NextRequest, NextResponse } from "next/server";

// 🔴 Red Flag Symptoms (instant severity boost)
const RED_FLAG_SYMPTOMS = [
  "chest pain",
  "breathing difficulty",
  "shortness of breath",
  "severe dizziness",
  "unconscious",
  "loss of consciousness",
  "persistent high fever",
];

// 🧠 Normalize text safely
const normalize = (text: string) => text.toLowerCase().trim();

// 🧠 Hybrid Severity Logic (Type C)
const calculateSeverity = (
  symptoms: string[],
  customText: string,
  duration?: string
): "Low" | "Moderate" | "High" => {
  const allText = [
    ...symptoms.map(normalize),
    normalize(customText || ""),
  ].join(" ");

  // 🚨 Red flag detection (highest priority)
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

    // 🔒 Validation (at least one symptom required)
    if ((!symptoms || symptoms.length === 0) && !customText) {
      return NextResponse.json(
        { error: "Please provide at least one symptom." },
        { status: 400 }
      );
    }

    // 🧠 Hybrid logic BEFORE AI
    const severity = calculateSeverity(
      symptoms,
      customText,
      qa?.duration
    );

    // 🌍 Location Context (optional-safe)
    const locationContext = location
      ? `User location: ${location}. Consider regional diseases and environmental factors common in this region.`
      : `Location not provided. Perform general global medical analysis.`;

    // 🧾 Optional Clinical Q&A Context (SAFE)
    const qaContext = qa
      ? `
Optional Clinical Background:
- Allergies: ${qa.allergies ? "Yes" : "No / Not specified"}
- Past Surgeries: ${qa.surgeries ? "Yes" : "No / Not specified"}
- Chronic Conditions: ${
          qa.chronicConditions?.length
            ? qa.chronicConditions.join(", ")
            : "None / Not specified"
        }
- Symptom Duration: ${qa.duration || "Not specified"}
- Current Medications: ${qa.medications || "Not specified"}
`
      : "No additional clinical background provided.";

    const prompt = `
You are an AI health assistant inside a student health app called CareCompass.

IMPORTANT:
- Do NOT give a medical diagnosis
- Provide educational, non-diagnostic insights only
- Use simple, student-friendly language
- Always include a medical disclaimer

User Selected Symptoms:
${symptoms.join(", ") || "None"}

Additional Symptom Description:
${customText || "None"}

${locationContext}

${qaContext}

Pre-calculated Severity (from hybrid logic): ${severity}

Generate a structured response with:
1. Possible Conditions (Top 3, non-diagnostic)
2. Severity Assessment (with reasoning)
3. Location-based insight (if location given)
4. Recommended Care Steps
5. When to See a Doctor (red flag guidance)
6. Medical Disclaimer (clear and safe)

Keep it clinically structured but easy to understand.
`;

    // 🔥 DIRECT GEMINI URL (Matches your existing routes)
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

    const aiText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Unable to generate analysis at the moment.";

    return NextResponse.json({
      prediction: aiText,
      severity, // Hybrid logic output
    });
  } catch (error) {
    console.error("Disease Predictor API Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze symptoms." },
      { status: 500 }
    );
  }
}