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
exports.getGeminiResponse = getGeminiResponse;
// services/service_gemini.ts
const generative_ai_1 = require("@google/generative-ai");
const chat_ai_1 = require("../../../knowledge/chat_ai");
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
function getGeminiResponse(question_1) {
    return __awaiter(this, arguments, void 0, function* (question, history = []) {
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
                    parts: [{ text: chat_ai_1.HOTEL_KNOWLEDGE }],
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
            const result = yield chat.sendMessage(question);
            const response = yield result.response;
            return response.text();
        }
        catch (error) {
            console.error("Gemini API Error:", error);
            throw error;
        }
    });
}
