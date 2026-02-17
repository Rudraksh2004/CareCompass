import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { message, uid, sessionId } = await req.json();

    if (!message) {
      return NextResponse.json({ reply: "No message provided." });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // 🧠 STEP 1: Fetch conversation history (for memory)
    let historyContext = "";

    if (uid && sessionId) {
      try {
        const messagesRef = collection(
          db,
          "users",
          uid,
          "chatSessions",
          sessionId,
          "messages"
        );

        const q = query(messagesRef, orderBy("createdAt", "asc"));
        const snapshot = await getDocs(q);

        const history = snapshot.docs.map((doc) => doc.data());

        // 🔥 Only last 12 messages (prevents token overload)
        const recentHistory = history.slice(-12);

        historyContext = recentHistory
          .map((msg: any) =>
            msg.role === "user"
              ? `User: ${msg.content}`
              : `Assistant: ${msg.content}`
          )
          .join("\n");
      } catch (err) {
        console.error("History fetch error:", err);
        historyContext = "";
      }
    }

    // 🏥 STEP 2: CareCompass System Prompt (Premium + Safe)
    const systemPrompt = `
You are CareCompass, an advanced AI Health Assistant.

CORE RULES:
- You are NON-DIAGNOSTIC
- Do NOT diagnose diseases
- Do NOT prescribe medicines
- Provide educational, safe, and supportive health insights
- Use simple and calm language
- Personalize responses if context is available

BEHAVIOR STYLE:
- Professional but friendly
- Clear explanations
- Structured answers (bullet points when helpful)
- Health-aware but not alarming

Conversation History:
${historyContext || "No previous conversation."}

Current User Question:
${message}

Provide a helpful, personalized, and easy-to-understand response.
`;

    // 🤖 STEP 3: Call Gemini (Your existing model kept)
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
                  text: systemPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 800,
          },
        }),
      }
    );

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm here to help with your health questions. Could you please rephrase that?";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { reply: "AI chat failed. Please try again." },
      { status: 500 }
    );
  }
}
