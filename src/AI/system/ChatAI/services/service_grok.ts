// services/service_grok.ts
import axios from "axios";
import { Message } from "../../../types/index";
import { HOTEL_KNOWLEDGE } from "../../../knowledge/chat_ai";

const SECRET_KEY_GROK = process.env.SECRET_KEY_GROK;

export async function getGrokResponse(question: string, history: Message[] = []) {
  const messages = [
    { 
      role: "system" as const, 
      content: HOTEL_KNOWLEDGE 
    },
    ...history,
    { 
      role: "user" as const, 
      content: question 
    }
  ];

  try {
    
    console.log(`Using Grok model: $llama-3.1-8b-instant`);
    
    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant", // Model Groq yang valid
        messages: messages,
        temperature: 0.7,
        max_tokens: 4096, // Parameter yang benar
        top_p: 1,
        stream: false // Nonaktifkan streaming untuk response JSON biasa
      },
      {
        headers: {
          Authorization: `Bearer ${SECRET_KEY_GROK}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    console.log("Groq API Response received successfully");
    return res.data.choices[0].message.content;
    
  } catch (error: any) {
    console.error("Groq API Error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
}