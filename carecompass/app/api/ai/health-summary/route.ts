import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  limit,
} from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { uid } = await req.json();

    if (!uid) {
      return NextResponse.json(
        { summary: "User not authenticated.", healthScore: 0, riskLevel: "Unknown" },
        { status: 400 }
      );
    }

    // 🔹 Fetch Profile
    const profileSnap = await getDocs(
      query(collection(db, "users"), where("__name__", "==", uid))
    );
    const profile = profileSnap.docs[0]?.data() || {};

    // 🔹 Health Logs (latest 20)
    const healthSnap = await getDocs(
      query(
        collection(db, "health_logs"),
        where("userId", "==", uid),
        limit(20)
      )
    );
    const healthLogs = healthSnap.docs.map((d) => d.data());

    // 🔹 Reports History
    const reportsSnap = await getDocs(
      query(
        collection(db, "history"),
        where("userId", "==", uid),
        where("type", "==", "reports"),
        limit(10)
      )
    );
    const reports = reportsSnap.docs.map((d) => d.data());

    // 🔹 Prescriptions
    const prescriptionSnap = await getDocs(
      query(
        collection(db, "history"),
        where("userId", "==", uid),
        where("type", "==", "prescriptions"),
        limit(10)
      )
    );
    const prescriptions = prescriptionSnap.docs.map((d) => d.data());

    // 🔹 Disease Predictions
    const diseaseSnap = await getDocs(
      query(
        collection(db, "disease_history"),
        where("userId", "==", uid),
        limit(10)
      )
    );
    const diseases = diseaseSnap.docs.map((d) => d.data());

    const prompt = `
You are an advanced clinical AI health assistant.

Analyze the user's health data and generate:

1. A personalized NON-DIAGNOSTIC health summary
2. A Health Score (0-100)
3. A Risk Level (Low, Moderate, High)

User Profile:
${JSON.stringify(profile)}

Health Logs:
${JSON.stringify(healthLogs)}

Reports Count:
${reports.length}

Prescriptions Count:
${prescriptions.length}

Disease Risk Analyses:
${JSON.stringify(diseases)}

Rules:
- Be professional and simple
- Non-diagnostic guidance only
- If limited data, give conservative insights
- Health Score must be realistic (not always high)

Respond ONLY in JSON format:
{
  "summary": "...",
  "healthScore": number,
  "riskLevel": "Low" | "Moderate" | "High"
}
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

    const geminiData = await geminiRes.json();
    const text =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "";

    let parsed = {
      summary: "No summary generated.",
      healthScore: 50,
      riskLevel: "Low",
    };

    try {
      parsed = JSON.parse(text);
    } catch {
      parsed.summary = text || "AI summary generated.";
    }

    return NextResponse.json({
      summary: parsed.summary,
      healthScore: parsed.healthScore ?? 50,
      riskLevel: parsed.riskLevel ?? "Low",
    });
  } catch (error) {
    console.error("AI Summary Error:", error);
    return NextResponse.json({
      summary: "Failed to generate AI health summary.",
      healthScore: 0,
      riskLevel: "Unknown",
    });
  }
}