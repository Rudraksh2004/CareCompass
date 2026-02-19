import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { medicineText } = await req.json();

    if (!medicineText || medicineText.trim().length < 2) {
      return NextResponse.json(
        { error: "Medicine name is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `
You are CareCompass AI, a non-diagnostic medical information assistant.

Strict Rules:
- Do NOT diagnose diseases
- Do NOT prescribe medicines
- Provide educational and safe medical information only
- Use clear, structured clinical formatting

Explain the following medicine in a professional yet simple way:

Medicine: ${medicineText}

Return in this exact structured format:

## 💊 Medicine Overview
(What this medicine is and type)

## 🧪 Composition
(Active ingredients if commonly known)

## 🎯 Uses
(Common medical uses)

## ⚠️ Possible Side Effects
(Common + mild + serious)

## 🚫 Warnings & Precautions
(Who should avoid or be careful)

## 📌 General Guidance
(Safe, non-diagnostic advice)
                  `,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No description generated.";

    return NextResponse.json({ description: reply });
  } catch (error) {
    console.error("Medicine describer error:", error);
    return NextResponse.json(
      { error: "Medicine description failed" },
      { status: 500 }
    );
  }
}
