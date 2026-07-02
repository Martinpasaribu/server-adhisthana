// services/service_openai.ts
import OpenAI from 'openai';
import { Message, getRecommendedModel } from '../../../types/index';
import { HOTEL_KNOWLEDGE } from '../../../knowledge/chat_ai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function getOpenAIResponse(
  question: string, 
  history: Message[] = [],
  modelType: 'quality' | 'balanced' | 'budget' = 'balanced' 
) {
  const model = getRecommendedModel('openai', modelType);
  
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
    console.log(`Using OpenAI model: ${model}`);
    
    const completion = await openai.chat.completions.create({
      model: model, 
      messages: messages,
      temperature: 0.7,
      max_tokens: 800,
      top_p: 1,
    });

    return completion.choices[0].message.content;
    
  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    throw error;
  }
}