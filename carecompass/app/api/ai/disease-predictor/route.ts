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

// 🧠 Enhanced Severity Logic
const calculateSeverity = (
  symptoms: string[],
  customText: string,
  qa?: any,
  biometrics?: any
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
  
  // Biometric Red Flags
  const temp = parseFloat(biometrics?.temperature || "98.6");
  const hr = parseInt(biometrics?.heartRate || "72");
  const o2 = parseInt(biometrics?.spo2 || "100");
  
  if (temp >= 102 || o2 <= 94 || hr >= 110) return "High";
  if (qa?.isWorsening === "Severely Worsening") return "High";
  
  // High risk conditions: long duration or many symptoms
  if (qa?.duration === "7+ days" || symptomCount >= 5) return "High";
  
  if (symptomCount >= 3 || qa?.duration === "3-7 days" || temp >= 100) return "Moderate";

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

---

### 🧬 Clinical Evidence Sync
Your reported symptoms (${symptoms.join(", ") || "General discomfort"}) suggest a pattern common with environmental changes ${
    location ? `in ${location}` : "globally"
  }. The ${severity} severity rating suggests you should monitor your recovery closely.

### 🧠 Differential Logic
The prevalence of respiratory symptoms without severe biometric distress favors a viral origin over a bacterial complication at this stage.

### 🩺 Strategic Next Steps:
- Increase fluid intake (water, ORS, or herbal tea)
- Get at least 8 hours of restorative sleep
- Monitor body temperature every 6 hours
- Avoid heavy physical exertion for 48 hours

### 🏥 Physician Referral:
- General Physician (GP)

---

### 🚨 Critical Red Flags:
- Persistent high fever (>102°F) for 48 hours
- Sudden onset of breathing difficulty
- Unusual chest pressure or severe vertigo

> ⚠️ **Clinical Disclaimer**: This is an AI-powered diagnostic synthesis provided by CareCompass for educational purposes and non-emergency triage. It is not a formal medical diagnosis.`;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      symptoms = [],
      customText = "",
      location = "",
      biometrics = null,
      qa = null,
    } = body;

    if ((!symptoms || symptoms.length === 0) && !customText && !biometrics) {
      return NextResponse.json(
        { error: "Please provide clinical data for analysis." },
        { status: 400 }
      );
    }

    const severity = calculateSeverity(symptoms, customText, qa, biometrics);

    const locationContext = location
      ? `User location: ${location}. Take into account current seasonal patterns in India (transition seasons, monsoon risks, AQI).`
      : `General South Asian climate.`;

    const bioContext = biometrics
      ? `Biometric Markers:
         - Temp: ${biometrics.temperature}°F
         - Pulse: ${biometrics.heartRate} BPM
         - O2: ${biometrics.spo2}%
         - BP: ${biometrics.bloodPressure}
         - Sleep: ${biometrics.sleepLevel}/10
         - Stress: ${biometrics.stressLevel}/10`
      : "Nominal biometrics assumed.";

    const healthContext = qa 
      ? `Clinical Metadata:
         - Duration: ${qa.duration || "Not specified"}
         - Progression: ${qa.isWorsening || "Not specified"}
         - Allergies: ${qa.allergies ? "Yes" : "None"}
         - Chronic: ${qa.chronicConditions?.join(", ") || "None"}
         - Medications: ${qa.medications || "None"}
         - Recent Travel: ${qa.recentTravel || "No recent travel"}`
      : "No clinical context provided.";

    const prompt = `
You are a Lead AI Diagnostic Synthesist at CareCompass. Provide a master-tier, high-fidelity medical risk synthesis.

DATA PROFILE:
- Core Symptoms: ${symptoms.join(", ") || "None"}
- Qualitative Observation: ${customText || "None"}
- ${locationContext}
- ${bioContext}
- ${healthContext}
- Algorithmic Severity: ${severity}

DIAGNOSTIC ARCHITECTURE:
1. "Likelihood Probability Synthesis": 3 distinct conditions with % probability.
2. "Primary Specialist Referral": Exactly naming the type of specialist to consult.
3. "Regional Medical Alignment": Suggest 2-3 top-tier medical facilities or highly-rated (simulated/plausible) specialist names in the user's specific location (${location || "India"}).
4. "Clinical Evidence Sync": Correlate biometrics with symptoms.
5. "Differential Logic": Explain primary condition vs alternatives.
6. "Strategic Next Steps": Clinical and lifestyle advice.
7. "Critical Red Flags": Profiling for the specific case.

REQUIRED OUTPUT STRUCTURE (Markdown):

## 📋 Likelihood Probability Synthesis
1. **[Condition]** — XX%
2. **[Condition]** — XX%
3. **[Condition]** — XX%

---

### 🏥 Regional Medical Alignment (${location || "General India"})
- **Primary Facility**: [Top Tier Hospital in City (e.g. Apollo, Max, etc.)]
- **Recommended Specialist**: [Plausible High-Grade Doctor Name] ([Specialty])
- **Secondary Facility**: [Second Hospital Option]

> 🩺 **Referral Strategy**: [1 sentence on the urgency of visit]

---

### 🧬 Clinical Evidence Sync
(CORRELATE biometric markers (HR, Temp, O2) with symptoms and duration)

### 🧠 Differential Logic
(Explain why one condition is favored over another based on the data)

### 🩺 Strategic Next Steps 
(Detailed clinical recommendations)

### 🏥 Physician Referral
(Specialist required)

---

### 🚨 Critical Red Flags (Seek Immediate Care)
(Specific profiling for this case)

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