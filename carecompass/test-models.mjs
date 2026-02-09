import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

async function list() {
  try {
    const models = await genAI.listModels();
    console.log("--- AVAILABLE MODELS ---");
    models.models.forEach(m => console.log(m.name));
  } catch (e) {
    console.error("Error fetching models:", e);
  }
}

list();