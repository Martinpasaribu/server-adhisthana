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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOpenAIResponse = getOpenAIResponse;
// services/service_openai.ts
const openai_1 = __importDefault(require("openai"));
const index_1 = require("../../../types/index");
const chat_ai_1 = require("../../../knowledge/chat_ai");
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
function getOpenAIResponse(question_1) {
    return __awaiter(this, arguments, void 0, function* (question, history = [], modelType = 'balanced') {
        const model = (0, index_1.getRecommendedModel)('openai', modelType);
        const messages = [
            {
                role: "system",
                content: chat_ai_1.HOTEL_KNOWLEDGE
            },
            ...history,
            {
                role: "user",
                content: question
            }
        ];
        try {
            console.log(`Using OpenAI model: ${model}`);
            const completion = yield openai.chat.completions.create({
                model: model,
                messages: messages,
                temperature: 0.7,
                max_tokens: 800,
                top_p: 1,
            });
            return completion.choices[0].message.content;
        }
        catch (error) {
            console.error("OpenAI API Error:", error);
            throw error;
        }
    });
}
