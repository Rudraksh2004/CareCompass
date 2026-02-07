"use server";

import { medicalModel } from "./gemini";

export async function analyzeMedicalReport(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file uploaded");

  // Convert File to Base64 for Gemini
  const bytes = await file.arrayBuffer();
  const base64Data = Buffer.from(bytes).toString("base64");

  const prompt = `
    Analyze this medical report image. 
    1. Extract test names and values.
    2. Explain what each test means in simple, non-alarming terms.
    3. Compare values to standard ranges if visible.
    4. Provide a "Key Takeaway" section.
    5. Format the output in clean Markdown.
  `;

  try {
    const result = await medicalModel.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType: file.type } },
    ]);
    
    return result.response.text();
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "Sorry, I couldn't analyze this report. Please ensure the image is clear.";
  }
}