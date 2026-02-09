"use server";
import { medicalModel } from "./gemini";

export async function analyzeMedicalReport(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file uploaded");

  const bytes = await file.arrayBuffer();
  const base64Data = Buffer.from(bytes).toString("base64");

  try {
    // We pass parts explicitly to ensure the API receives them correctly
    const result = await medicalModel.generateContent([
      { text: "Analyze this medical report. Explain results in simple English. Do not diagnose. End with a medical disclaimer." },
      {
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      },
    ]);

    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Gemini Error:", error);
    // This helps us see the actual error message in the UI
    return `Analysis failed: ${error.message || "Unknown AI error"}`;
  }
}