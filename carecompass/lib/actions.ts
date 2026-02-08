"use server";

import { medicalModel } from "./gemini";

export async function analyzeMedicalReport(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file uploaded");

  // Convert File to Base64 for Gemini processing
  const bytes = await file.arrayBuffer();
  const base64Data = Buffer.from(bytes).toString("base64");

  const prompt = `
    Analyze this medical report image or PDF. 
    1. Extract test names, values, and reference ranges.
    2. Explain what each test means in simple, everyday language.
    3. If a value is high or low, explain what that *might* be associated with, but do not diagnose.
    4. Provide a "Summary" section at the end.
    
    STRICT SAFETY: Always end with: "This is for educational purposes only. Consult your doctor for clinical advice."
  `;

  try {
    const result = await medicalModel.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType: file.type } },
    ]);
    
    return result.response.text();
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "I'm sorry, I couldn't process this document. Please ensure the image is clear and try again.";
  }
}