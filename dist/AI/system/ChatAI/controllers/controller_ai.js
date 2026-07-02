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
exports.chatHandler = void 0;
const main_1 = require("../services/main");
const chatHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    let question;
    let history = [];
    console.log("Received request body:", req.body);
    console.log("Content-Type:", req.headers['content-type']);
    try {
        if (typeof req.body === "string") {
            question = req.body.trim();
        }
        else {
            const body = req.body;
            question = ((_a = body.question) === null || _a === void 0 ? void 0 : _a.trim()) || "";
            history = body.history || [];
        }
        console.log("Processed question:", question);
        console.log("History length:", history.length);
        if (!question) {
            return res.status(400).json({ error: "Pertanyaan tidak boleh kosong" });
        }
        const answer = yield (0, main_1.getAIResponse)(question, history);
        console.log("Successfully generated answer");
        res.json({
            answer,
            newHistory: [
                ...history,
                { role: "user", content: question },
                { role: "assistant", content: answer }
            ]
        });
    }
    catch (error) {
        console.error("Controller Error:", {
            message: error.message,
            response: (_b = error.response) === null || _b === void 0 ? void 0 : _b.data,
            status: (_c = error.response) === null || _c === void 0 ? void 0 : _c.status
        });
        // Berikan error message yang lebih spesifik
        if (((_d = error.response) === null || _d === void 0 ? void 0 : _d.status) === 400) {
            return res.status(400).json({
                error: "Permintaan tidak valid ke AI API. Periksa parameter request."
            });
        }
        if (((_e = error.response) === null || _e === void 0 ? void 0 : _e.status) === 429) {
            return res.status(429).json({
                error: "Rate limit exceeded. Coba lagi nanti."
            });
        }
        if (((_f = error.response) === null || _f === void 0 ? void 0 : _f.status) === 401) {
            return res.status(401).json({
                error: "API key tidak valid"
            });
        }
        res.status(500).json({
            error: "Maaf, Mbok Siti sedang istirahat sejenak. Monggo coba lagi ya."
        });
    }
});
exports.chatHandler = chatHandler;
