// services/service_gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Message } from '../../../types/index';
import { HOTEL_KNOWLEDGE } from '../../../knowledge/chat_ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function getGeminiResponse(question: string, history: Message[] = []) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 800,
    }
  });

  // Format messages untuk Gemini
  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: HOTEL_KNOWLEDGE }],
      },
      {
        role: "model",
        parts: [{ text: "Siap! Saya Mbok Siti, siap membantu dengan informasi villa Adhisthana." }],
      },
      ...history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }))
    ],
  });

  try {
    
    console.log(`Using Gemini model: ${model}`);

    const result = await chat.sendMessage(question);
    const response = await result.response;
    return response.text();
    
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}