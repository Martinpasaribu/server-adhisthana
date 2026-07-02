export interface ChatRequest {
  question: string;
  history?: Message[];
}

export interface Message {
  role: "user" | "assistant";
  content: string;
}

// constants/aiModels.ts
export const OPENAI_MODELS = {
  // GPT-4 Models (lebih mahal tapi lebih baik)
  GPT4: "gpt-5.1",
  GPT4_TURBO: "gpt-5-mini",
  GPT4_32K: "gpt-5-nano",
  
  // GPT-3.5 Models (lebih murah dan cepat)
  GPT3_TURBO: "gpt-3.5-turbo",
  GPT3_TURBO_16K: "gpt-3.5-turbo-16k"
};

export const GROQ_MODELS = {
  LLAMA_70B: "llama3-70b-8192",
  LLAMA_8B: "llama3-8b-8192",
  MIXTRAL: "mixtral-8x7b-32768"
};

// Config berdasarkan budget dan kebutuhan
export const getRecommendedModel = (provider: string, useCase: string) => {
  if (provider === 'openai') {
    switch (useCase) {
      case 'quality':
        return OPENAI_MODELS.GPT4;
      case 'balanced':
        return OPENAI_MODELS.GPT4_TURBO;
      case 'budget':
      default:
        return OPENAI_MODELS.GPT3_TURBO;
    }
  } else {
    return GROQ_MODELS.LLAMA_70B;
  }
};