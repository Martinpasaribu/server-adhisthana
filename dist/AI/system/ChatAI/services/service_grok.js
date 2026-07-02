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
exports.getGrokResponse = getGrokResponse;
// services/service_grok.ts
const axios_1 = __importDefault(require("axios"));
const chat_ai_1 = require("../../../knowledge/chat_ai");
const SECRET_KEY_GROK = process.env.SECRET_KEY_GROK;
function getGrokResponse(question_1) {
    return __awaiter(this, arguments, void 0, function* (question, history = []) {
        var _a, _b;
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
            console.log(`Using Grok model: $llama-3.1-8b-instant`);
            const res = yield axios_1.default.post("https://api.groq.com/openai/v1/chat/completions", {
                model: "llama-3.1-8b-instant", // Model Groq yang valid
                messages: messages,
                temperature: 0.7,
                max_tokens: 4096, // Parameter yang benar
                top_p: 1,
                stream: false // Nonaktifkan streaming untuk response JSON biasa
            }, {
                headers: {
                    Authorization: `Bearer ${SECRET_KEY_GROK}`,
                    "Content-Type": "application/json"
                },
                timeout: 30000
            });
            console.log("Groq API Response received successfully");
            return res.data.choices[0].message.content;
        }
        catch (error) {
            console.error("Groq API Error:", {
                status: (_a = error.response) === null || _a === void 0 ? void 0 : _a.status,
                data: (_b = error.response) === null || _b === void 0 ? void 0 : _b.data,
                message: error.message
            });
            throw error;
        }
    });
}
