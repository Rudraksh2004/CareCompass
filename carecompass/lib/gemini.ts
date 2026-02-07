import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export const medicalModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `
    You are CareCompass AI. Your goal is to simplify medical jargon.
    1. NEVER diagnose. 
    2. NEVER suggest medication changes.
    3. Use phrases like "This value is typically associated with..." 
    4. If a user is in pain, suggest "Please consult a healthcare professional."
    5. Always end with a disclaimer.
  `,
});