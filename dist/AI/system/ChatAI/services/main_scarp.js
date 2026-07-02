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
// services/aiService.ts
const service_openai_1 = require("./service_openai");
const service_gemini_1 = require("./service_gemini");
const service_grok_1 = require("./service_grok");
const aiContextBuilder_1 = require("../../Scraping/web-adhisthana/aiContextBuilder"); // ✅ INI PENTING - untuk scraping context
const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini';
function getAIResponse(question_1) {
    return __awaiter(this, arguments, void 0, function* (question, history = []) {
        try {
            // ✅ DAPATKAN KONTEKS DARI SCRAPING
            const context = yield (0, aiContextBuilder_1.buildAIContext)();
            const messages = [
                {
                    role: "system",
                    content: context // ✅ GUNAKAN KONTEKS DYNAMIC DARI SCRAPING
                },
                ...history,
                {
                    role: "user",
                    content: question
                }
            ];
            // Pilih provider AI
            switch (AI_PROVIDER) {
                case 'openai':
                    return (yield (0, service_openai_1.getOpenAIResponse)(question, history)) || '';
                case 'groq':
                    return yield (0, service_grok_1.getGrokResponse)(question, history);
                case 'gemini':
                default:
                    return yield (0, service_gemini_1.getGeminiResponse)(question, history);
            }
        }
        catch (error) {
            console.error('Error in getAIResponse:', error);
            // Fallback response
            return "Maaf, Mbok Siti sedang mengalami gangguan teknis. Silakan hubungi WhatsApp kami langsung di 081111177199 untuk informasi villa.";
        }
    });
}
