// services/aiService.ts
import { getOpenAIResponse } from './service_openai';
import { getGeminiResponse } from './service_gemini';
import { getGrokResponse } from './service_grok';
import { buildAIContext } from '../../Scraping/web-adhisthana/aiContextBuilder'; // ✅ INI PENTING - untuk scraping context
import { Message } from '../../../types/index';

const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini';

export async function getAIResponse(question: string, history: Message[] = []): Promise<string> {
  try {
    // ✅ DAPATKAN KONTEKS DARI SCRAPING
    const context = await buildAIContext();
    
    const messages = [
      { 
        role: "system" as const, 
        content: context // ✅ GUNAKAN KONTEKS DYNAMIC DARI SCRAPING
      },
      ...history,
      { 
        role: "user" as const, 
        content: question 
      }
    ];

    // Pilih provider AI
    switch (AI_PROVIDER) {
      case 'openai':
        return await getOpenAIResponse(question, history) || '';
      case 'groq':
        return await getGrokResponse(question, history);
      case 'gemini':
      default:
        return await getGeminiResponse(question, history);
    }
    
  } catch (error: any) {
    console.error('Error in getAIResponse:', error);
    
    // Fallback response
    return "Maaf, Mbok Siti sedang mengalami gangguan teknis. Silakan hubungi WhatsApp kami langsung di 081111177199 untuk informasi villa.";
  }
}