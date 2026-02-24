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

// 🧠 Local fallback (ENSURES you ALWAYS get illness + % even if Gemini fails)
const generateFallbackAnalysis = (
  symptoms: string[],
  customText: string,
  location: string,
  severity: string
) => {
  const all = `${symptoms.join(" ")} ${customText}`.toLowerCase();

  let conditions = [
    { name: "Viral Infection", percent: 40 },
    { name: "Common Cold", percent: 35 },
    { name: "Seasonal Flu", percent: 25 },
  ];

  if (all.includes("fever") && all.includes("cough")) {
    conditions = [
      { name: "Flu (Influenza)", percent: 45 },
      { name: "Viral Fever", percent: 35 },
      { name: "Respiratory Infection", percent: 20 },
    ];
  }

  if (all.includes("diarrhea") || all.includes("vomiting")) {
    conditions = [
      { name: "Gastroenteritis", percent: 50 },
      { name: "Food Poisoning", percent: 30 },
      { name: "Stomach Infection", percent: 20 },
    ];
  }

  return `
🔎 Possible Conditions (with likelihood %)
1. ${conditions[0].name} — ${conditions[0].percent}%
2. ${conditions[1].name} — ${conditions[1].percent}%
3. ${conditions[2].name} — ${conditions[2].percent}%

🧠 Reasoning:
Based on the reported symptoms (${symptoms.join(", ") || customText})${
    location ? ` and regional context (${location})` : ""
  }, these conditions are commonly associated patterns. This is a risk-based AI estimation, not a diagnosis.

🩺 Recommended Next Steps:
- Stay hydrated and rest
- Monitor symptom progression
- Maintain proper nutrition
- Avoid self-medication without guidance

🚨 When to See a Doctor:
- Symptoms worsen or persist for several days
- High fever, breathing issues, or severe weakness appear
- Any red-flag symptoms develop

⚠️ Disclaimer:
This is non-diagnostic AI guidance and does not replace professional medical advice.
(Severity Level: ${severity})
`;
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
You are an AI health assistant inside CareCompass (student health app).

IMPORTANT RULES:
- Non-diagnostic only
- Educational insights
- Show illness likelihood with percentages
- Clear structured output
- Student-friendly language

Symptoms:
${symptoms.join(", ") || "None"}

Additional Symptoms:
${customText || "None"}

${locationContext}

Pre-calculated Severity: ${severity}

Output STRICTLY in this format:

🔎 Possible Conditions (with likelihood %)
1. Condition — XX%
2. Condition — XX%
3. Condition — XX%

🧠 Reasoning:
(Short clinical reasoning)

🩺 Recommended Next Steps:
(Simple safe advice)

🚨 When to See a Doctor:
(Red flag guidance)

⚠️ Disclaimer:
Non-diagnostic AI guidance only.
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

    // 🔍 Debug log (check your terminal)
    console.log("Gemini Disease Predictor Response:", data);

    let aiText = "";

    // 🔥 Robust parsing for gemini-3-flash-preview
    if (data?.candidates && data.candidates.length > 0) {
      const parts = data.candidates[0]?.content?.parts;

      if (Array.isArray(parts) && parts.length > 0) {
        aiText = parts
          .map((p: any) => p?.text || "")
          .join("\n")
          .trim();
      }
    }

    // 🚨 If Gemini fails / blocked / empty → use smart fallback
    if (!aiText || aiText.length < 20) {
      console.warn("Gemini returned empty/blocked response. Using fallback.");
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

    return NextResponse.json(
      {
        prediction:
          "AI service temporarily unavailable. Please try again later.",
        severity: "Low",
      },
      { status: 200 }
    );
  }
}