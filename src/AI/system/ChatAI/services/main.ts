// services/aiService.ts
import { getGrokResponse } from './service_grok';
import { getOpenAIResponse } from './service_openai';
import { getGeminiResponse } from './service_gemini';
import { Message } from '../../../types/index';

const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini'; // default ke Gemini karena gratis

export async function getAIResponse(question: string, history: Message[] = []) {
  switch (AI_PROVIDER) {
    case 'openai':
      return await getOpenAIResponse(question, history);
    case 'groq':
      return await getGrokResponse(question, history);
    case 'gemini':
    default:
      return await getGeminiResponse(question, history);
  }
}

// Atau dengan automatic fallback
export async function getAIResponseWithFallback(question: string, history: Message[] = []) {
  const providers = ['gemini', 'groq', 'openai']; // Priority order
  
  for (const provider of providers) {
    try {
      console.log(`Trying ${provider} provider...`);
      
      switch (provider) {
        case 'openai':
          return await getOpenAIResponse(question, history);
        case 'groq':
          return await getGrokResponse(question, history);
        case 'gemini':
          return await getGeminiResponse(question, history);
      }
    } catch (error) {
      console.error(`${provider} failed:`, error);
      continue; // Coba provider berikutnya
    }
  }
  
  throw new Error('All AI providers failed');
}