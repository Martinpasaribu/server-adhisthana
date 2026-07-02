"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAIResponse = getAIResponse;
exports.getAIResponseWithFallback = getAIResponseWithFallback;
// services/aiService.ts
const service_grok_1 = require("./service_grok");
const service_openai_1 = require("./service_openai");
const service_gemini_1 = require("./service_gemini");
const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini'; // default ke Gemini karena gratis
function getAIResponse(question_1) {
    return __awaiter(this, arguments, void 0, function* (question, history = []) {
        switch (AI_PROVIDER) {
            case 'openai':
                return yield (0, service_openai_1.getOpenAIResponse)(question, history);
            case 'groq':
                return yield (0, service_grok_1.getGrokResponse)(question, history);
            case 'gemini':
            default:
                return yield (0, service_gemini_1.getGeminiResponse)(question, history);
        }
    });
}
// Atau dengan automatic fallback
function getAIResponseWithFallback(question_1) {
    return __awaiter(this, arguments, void 0, function* (question, history = []) {
        const providers = ['gemini', 'groq', 'openai']; // Priority order
        for (const provider of providers) {
            try {
                console.log(`Trying ${provider} provider...`);
                switch (provider) {
                    case 'openai':
                        return yield (0, service_openai_1.getOpenAIResponse)(question, history);
                    case 'groq':
                        return yield (0, service_grok_1.getGrokResponse)(question, history);
                    case 'gemini':
                        return yield (0, service_gemini_1.getGeminiResponse)(question, history);
                }
            }
            catch (error) {
                console.error(`${provider} failed:`, error);
                continue; // Coba provider berikutnya
            }
        }
        throw new Error('All AI providers failed');
    });
}
