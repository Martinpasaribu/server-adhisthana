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
exports.healthCheckHandler = exports.getDataStatusHandler = exports.refreshDataHandler = exports.chatHandler = void 0;
const main_scarp_1 = require("../services/main_scarp"); // Pastikan path ini benar
const advancedScrapingService_1 = require("../../Scraping/web-adhisthana/advancedScrapingService"); // Fungsi scraping comprehensive
// Fungsi utama chat handler (sudah ada)
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
        // ✅ INI YANG UTAMA: Panggil getAIResponse yang sudah include scraping
        const answer = yield (0, main_scarp_1.getAIResponse)(question, history);
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
// ✅ FUNGSI BARU 1: Manual Data Refresh
const refreshDataHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Manual data refresh requested');
        // Lakukan scraping comprehensive
        const scrapedData = yield (0, advancedScrapingService_1.comprehensiveScrape)();
        res.json({
            success: true,
            message: 'Data berhasil diperbarui',
            data: {
                villasCount: scrapedData.villas.length,
                promosCount: scrapedData.promos.length,
                eventsCount: scrapedData.events.length,
                facilitiesCount: scrapedData.facilities.length,
                testimonialsCount: scrapedData.testimonials.length,
                lastUpdated: scrapedData.lastUpdated
            }
        });
    }
    catch (error) {
        console.error('Manual refresh failed:', error);
        res.status(500).json({
            success: false,
            message: `Gagal memperbarui data: ${error.message}`
        });
    }
});
exports.refreshDataHandler = refreshDataHandler;
// ✅ FUNGSI BARU 2: Get Current Data Status
const getDataStatusHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Anda bisa mengembalikan status cache atau data terakhir
        // Ini contoh sederhana, sesuaikan dengan cache service Anda
        res.json({
            success: true,
            message: 'Service AI berjalan dengan baik',
            features: [
                'Web scraping otomatis untuk data terbaru',
                'Cache data 30 menit untuk performa',
                'Fallback system jika scraping gagal',
                'Multi-provider AI (OpenAI/Gemini/Groq)'
            ],
            lastChecked: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Data status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking data status'
        });
    }
});
exports.getDataStatusHandler = getDataStatusHandler;
// ✅ FUNGSI BARU 3: Health Check
const healthCheckHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Test basic AI response
        const testQuestion = "Halo";
        const testAnswer = yield (0, main_scarp_1.getAIResponse)(testQuestion, []);
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            aiService: 'operational',
            scrapingService: 'enabled',
            message: 'Mbok Siti siap melayani!'
        });
    }
    catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message,
            message: 'Service sedang mengalami gangguan'
        });
    }
});
exports.healthCheckHandler = healthCheckHandler;
