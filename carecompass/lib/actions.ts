"use server";
import { medicalModel } from "./gemini";

export async function analyzeMedicalReport(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file uploaded");

  const bytes = await file.arrayBuffer();
  const base64Data = Buffer.from(bytes).toString("base64");

  const safetyPrompt = `
    You are CareCompass AI. Analyze this medical report.
    1. Explain test names and values simply.
    2. Do not diagnose. 
    3. End with: "This is for educational purposes only."
  `;

  try {
    // We pass the prompt as the first part of the array
    const result = await medicalModel.generateContent([
      { text: safetyPrompt },
      { inlineData: { data: base64Data, mimeType: file.type } },
    ]);
    
    return result.response.text();
  } catch (error: any) {
    console.error("Gemini Error Details:", error.message);
    return "AI Error: " + error.message; // This will help us see the REAL error on screen
  }
}