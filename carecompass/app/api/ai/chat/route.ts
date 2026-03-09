import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { message, uid, sessionId } = await req.json();

    if (!message) {
      return NextResponse.json({ reply: "No message provided." });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ reply: "AI service not configured." });
    }

    // 🔹 Fetch conversation memory
    let historyContext = "";

    if (uid && sessionId) {
      try {
        const messagesRef = collection(
          db,
          "users",
          uid,
          "chatSessions",
          sessionId,
          "messages",
        );

        const q = query(messagesRef, orderBy("createdAt", "asc"));
        const snapshot = await getDocs(q);

        const history = snapshot.docs.map((doc) => doc.data());

        const recentHistory = history.slice(-12);

        historyContext = recentHistory
          .map((msg: any) =>
            msg.role === "user"
              ? `User: ${msg.content}`
              : `Assistant: ${msg.content}`,
          )
          .join("\n");
      } catch (err) {
        console.error("History error:", err);
      }
    }

    // 🔹 Advanced CareCompass AI Prompt
    const systemPrompt = `
You are CareCompass, an advanced AI Health Assistant.

Your purpose is to provide educational health insights.

STRICT RULES
• Do NOT diagnose diseases
• Do NOT prescribe medicines
• Do NOT replace doctors
• Always recommend consulting professionals for serious issues

STYLE
• Friendly and professional
• Easy to understand
• Use structured sections
• Use bullet points when helpful

FORMAT RESPONSES LIKE:

### Overview
Simple explanation

### Key Points
• point
• point

### When To Seek Medical Help
Short safety advice

Conversation History:
${historyContext || "No previous conversation."}

User Question:
${message}
`;

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
              parts: [{ text: systemPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 1120,
          },
        }),
      },
    );

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm here to help with your health questions.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API Error:", error);

    return NextResponse.json(
      { reply: "AI chat failed. Please try again." },
      { status: 500 },
    );
  }
}
