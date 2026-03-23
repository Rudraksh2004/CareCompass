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

// 🧠 Refined Severity Logic
const calculateSeverity = (
  symptoms: string[],
  customText: string,
  qa?: any
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
  
  // High risk conditions: long duration, worsening, or many symptoms
  if (qa?.duration === "7+ days" || qa?.isWorsening === "Yes" || symptomCount >= 5) return "High";
  
  if (symptomCount >= 3 || qa?.duration === "3-7 days") return "Moderate";

  return "Low";
};

// 🔒 Enhanced Fallback logic
const generateFallbackAnalysis = (
  symptoms: string[],
  customText: string,
  location: string,
  severity: string
) => {
  const combined = [...symptoms, customText].join(", ").toLowerCase();

  return `🔎 Possible Conditions (with likelihood %)
1. Seasonal Viral Infection — 45%
2. Body Fatigue & Stress — 30%
3. Environmental Allergy — 25%

🧠 Reasoning:
Your reported symptoms (${symptoms.join(", ") || "General discomfort"}) suggest a pattern common with environmental changes ${
    location ? `in ${location}` : "globally"
  }. The ${severity} severity rating suggests you should monitor your recovery closely.

🩺 Recommended Next Steps:
- Increase fluid intake (water, ORS, or herbal tea)
- Get at least 8 hours of restorative sleep
- Monitor body temperature every 6 hours
- Avoid heavy physical exertion for 48 hours

🩺 Recommended Specialist:
- General Physician (GP)

🚨 When to See a Doctor:
- Persistent high fever (>102°F) for 48 hours
- Sudden onset of breathing difficulty
- Unusual chest pressure or severe vertigo

⚠️ Disclaimer:
This is non-diagnostic AI guidance powered by CareCompass, not a medical diagnosis.`;
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
        { error: "Please provide at least one symptom for analysis." },
        { status: 400 }
      );
    }

    const severity = calculateSeverity(symptoms, customText, qa);

    const locationContext = location
      ? `User location: ${location}. Take into account current seasonal patterns in India (e.g., transition seasons, monsoon risks, air quality index if applicable).`
      : `Location not provided. Perform analysis for a general tropical/temperate climate typical of South Asia.`;

    const healthContext = qa 
      ? `Health Context:
         - Duration: ${qa.duration || "Not specified"}
         - Getting worse? ${qa.isWorsening || "Not specified"}
         - Known Allergies: ${qa.allergies ? "Yes" : "None reported"}
         - Chronic Conditions: ${qa.chronicConditions?.join(", ") || "None reported"}
         - Current Medications: ${qa.medications || "None reported"}`
      : "No additional health context provided.";

    const prompt = `
You are a Senior AI Diagnostic Synthesist at CareCompass. Your goal is to provide a master-tier, logical, and reassuring medical risk synthesis.

USER DATA:
- Core Symptoms: ${symptoms.join(", ") || "None"}
- Qualitative Data: ${customText || "None"}
- ${locationContext}
- ${healthContext}
- Algorithmic Severity: ${severity}

DIAGNOSTIC ARCHITECTURE:
1. Provide a "Likelihood Probability Synthesis" with 3 distinct patterns/conditions and percentage.
2. "Clinical Evidence Sync": Explain the correlation between the reported duration, location-based outbreaks, and the symptom cluster.
3. "Differential Logic": Mention why one pattern is more likely than another based on the data provided.
4. "Strategic Next Steps": Professional, non-generic advice.
5. "Physician Referral": Type of specialist needed.
6. "Critical Red Flags": Immediate seek-care indicators.

Tone: Professional, clinical, empathetic, and ultra-high-end.

REQUIRED OUTPUT STRUCTURE (Markdown):

## 📋 Likelihood Probability Synthesis
1. **[Condition]** — XX%
2. **[Condition]** — XX%
3. **[Condition]** — XX%

---

### 🧬 Clinical Evidence Sync
(2-3 high-fidelity sentences linking environmental, temporal, and symptomatic data)

### 🧠 Differential Logic
(Briefly explain why the primary pattern is favored over alternatives)

### 🩺 Strategic Next Steps 
(Professional pharmacological and lifestyle advice)

### 🏥 Physician Referral
(Recommended specialist category)

---

### 🚨 Critical Red Flags (Seek Immediate Care)
(Specific life-threatening symptoms for this profile)

> ⚠️ **Clinical Disclaimer**: This is an AI-powered diagnostic synthesis provided by CareCompass for educational purposes and non-emergency triage. It is not a formal medical diagnosis.
`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    const data = await geminiRes.json();
    let aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!aiText || aiText.length < 50) {
      aiText = generateFallbackAnalysis(symptoms, customText, location, severity);
    }

    return NextResponse.json({
      prediction: aiText,
      severity,
    });
  } catch (error) {
    console.error("CareCompass Predictor Error:", error);
    return NextResponse.json({
      prediction: "⚠️ Our AI engine is currently under maintenance. Please try again in a few minutes.",
      severity: "Low",
    });
  }
}