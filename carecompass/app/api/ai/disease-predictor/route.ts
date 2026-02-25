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

// 🔒 Smart fallback analysis (if Gemini fails or returns empty)
const generateFallbackAnalysis = (
  symptoms: string[],
  customText: string,
  location: string,
  severity: string
) => {
  const combined = [...symptoms, customText].join(", ").toLowerCase();

  let conditions = [
    { name: "Common Viral Infection", percent: 50 },
    { name: "Seasonal Flu", percent: 30 },
    { name: "Mild Respiratory Irritation", percent: 20 },
  ];

  if (combined.includes("cough") && combined.includes("fever")) {
    conditions = [
      { name: "Seasonal Viral Flu", percent: 55 },
      { name: "Upper Respiratory Infection", percent: 30 },
      { name: "Weather-related Viral Fever", percent: 15 },
    ];
  } else if (combined.includes("headache") && combined.includes("fatigue")) {
    conditions = [
      { name: "Stress or Fatigue-related Illness", percent: 45 },
      { name: "Mild Viral Infection", percent: 35 },
      { name: "Dehydration or Sleep Deficiency", percent: 20 },
    ];
  }

  return `🔎 Possible Conditions (with likelihood %)
1. ${conditions[0].name} — ${conditions[0].percent}%
2. ${conditions[1].name} — ${conditions[1].percent}%
3. ${conditions[2].name} — ${conditions[2].percent}%

🧠 Reasoning:
Based on the reported symptoms (${symptoms.join(", ") || customText}), the pattern suggests a mild to moderate health issue. Environmental factors ${
    location ? `in ${location}` : "globally"
  } and symptom combination influence this risk estimation.

🩺 Recommended Next Steps:
- Stay hydrated and rest adequately
- Monitor temperature and symptom progression
- Maintain a balanced diet and sleep schedule

🚨 When to See a Doctor:
- If symptoms worsen
- Persistent fever > 3 days
- Breathing issues or chest discomfort

⚠️ Disclaimer:
This is non-diagnostic AI guidance, not a medical diagnosis.`;
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
      ? `User location: ${location}. Consider regional diseases, pollution levels, climate, and seasonal patterns common in this area of India.`
      : `Location not provided. Perform general global medical analysis.`;

    const prompt = `
You are an AI health assistant inside CareCompass (a student health app).

CRITICAL RULES:
- Do NOT give a medical diagnosis
- Provide risk-based educational insights only
- Use simple student-friendly language
- MUST show illness likelihood in percentage
- Structured clean output

User Symptoms:
${symptoms.join(", ") || "None"}

Additional Symptoms:
${customText || "None"}

${locationContext}

Pre-calculated Severity: ${severity}

Return EXACT format:

🔎 Possible Conditions (with likelihood %)
1. Condition — XX%
2. Condition — XX%
3. Condition — XX%

🧠 Reasoning:
(short explanation)

🩺 Recommended Next Steps:
(simple steps)

🚨 When to See a Doctor:
(red flags)

⚠️ Disclaimer:
This is non-diagnostic AI guidance, not a medical diagnosis.
`;

    const geminiRes = await fetch(
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

    const data = await geminiRes.json();

    let aiText = "";

    // ✅ Robust parsing (handles all Gemini structures)
    if (
      data?.candidates &&
      Array.isArray(data.candidates) &&
      data.candidates.length > 0
    ) {
      const parts = data.candidates[0]?.content?.parts;

      if (Array.isArray(parts)) {
        aiText = parts
          .map((p: any) => p?.text || "")
          .join("\n")
          .trim();
      }
    }

    // 🔥 If Gemini fails or returns empty → fallback analysis
    if (!aiText || aiText.length < 20 || data?.error) {
      console.warn("Using fallback disease analysis");
      aiText = generateFallbackAnalysis(
        symptoms,
        customText,
        location,
        severity
      );
    }

    return NextResponse.json({
      prediction: aiText,
      severity,
    });
  } catch (error) {
    console.error("Disease Predictor API Error:", error);

    return NextResponse.json({
      prediction:
        "⚠️ Unable to generate AI analysis right now. Please try again later.",
      severity: "Low",
    });
  }
}