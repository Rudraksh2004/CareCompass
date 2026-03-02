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
        { summary: "User not authenticated." },
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
You are a clinical AI health assistant for a platform called CareCompass.

Generate a personalized NON-DIAGNOSTIC health summary based on the user data below.

User Profile:
${JSON.stringify(profile)}

Health Logs:
${JSON.stringify(healthLogs)}

Reports History Count:
${reports.length}

Prescriptions History Count:
${prescriptions.length}

Disease Risk Analyses:
${JSON.stringify(diseases)}

Required Output Format:
1. Overall Health Overview
2. Key Observations
3. Risk Signals (if any)
4. Lifestyle Suggestions
5. Preventive Tips

Tone: Clinical, professional, simple, reassuring.
IMPORTANT: This is NON-DIAGNOSTIC AI guidance only.
`;

    // 🔥 GEMINI API CALL (gemini-3-flash-preview)
    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 800,
          },
        }),
      }
    );

    const data = await aiRes.json();

    const summary =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No AI health summary generated.";

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("AI Summary Error:", error);
    return NextResponse.json({
      summary: "Failed to generate AI health summary.",
    });
  }
}