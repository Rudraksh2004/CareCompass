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

// 🧠 Helper: Normalize text safely
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

  // 📊 Symptom count logic
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
        { error: "At least one symptom is required." },
        { status: 400 }
      );
    }

    // 🧠 Hybrid Severity (Logic Layer BEFORE AI)
    const severity = calculateSeverity(
      symptoms,
      customText,
      qa?.duration
    );

    // 🌍 Location Context (optional-safe)
    const locationContext = location
      ? `User location: ${location}. Consider regional diseases and environmental factors relevant to this area.`
      : `Location not provided. Perform general global medical analysis.`;

    // 🧾 Optional Clinical QA Context
    const qaContext = qa
      ? `
Clinical Background (Optional):
- Allergies: ${qa.allergies ? "Yes" : "No/Not specified"}
- Past Surgeries: ${qa.surgeries ? "Yes" : "No/Not specified"}
- Chronic Conditions: ${
          qa.chronicConditions?.length
            ? qa.chronicConditions.join(", ")
            : "None/Not specified"
        }
- Symptom Duration: ${qa.duration || "Not specified"}
- Current Medications: ${qa.medications || "Not specified"}
`
      : "No additional clinical background provided.";

    const prompt = `
You are a non-diagnostic AI health assistant inside a student health web app called CareCompass.

IMPORTANT MEDICAL SAFETY RULES:
- Do NOT provide a medical diagnosis
- Provide possible conditions only (educational)
- Always include a disclaimer
- Encourage consulting a doctor for serious symptoms

User Symptoms (Selected Chips):
${symptoms.join(", ") || "None"}

Additional Symptom Description:
${customText || "None"}

${locationContext}

${qaContext}

Pre-calculated Severity Level (from logic layer): ${severity}

Now generate a structured clinical-style response with:
1. Possible Conditions (Top 3, non-diagnostic)
2. Severity Assessment (Low/Moderate/High with reasoning)
3. Location-based insight (if location provided)
4. Recommended Care Steps
5. When to See a Doctor (clear red flag guidance)
6. Friendly medical disclaimer (non-diagnostic)

Keep the language simple, safe, and student-friendly.
`;

    // 🔥 Gemini Call (MATCHES your existing API pattern B)
    const geminiRes = await fetch(
      `${process.env.GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
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

    const geminiData = await geminiRes.json();

    const aiText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Unable to generate analysis at the moment.";

    return NextResponse.json({
      prediction: aiText,
      severity, // 🔥 hybrid logic output
    });
  } catch (error) {
    console.error("Disease Predictor API Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze symptoms." },
      { status: 500 }
    );
  }
}