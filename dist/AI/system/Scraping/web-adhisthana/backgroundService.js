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
exports.startBackgroundDataRefresh = startBackgroundDataRefresh;
// services/backgroundService.ts
const advancedScrapingService_1 = require("./advancedScrapingService");
const cacheService_1 = require("./cacheService");
const CACHE_KEY = 'comprehensive_villa_data';
function startBackgroundDataRefresh() {
    // Refresh setiap 30 menit
    setInterval(() => __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Background data refresh started...');
            const freshData = yield (0, advancedScrapingService_1.comprehensiveScrape)();
            cacheService_1.cacheService.set(CACHE_KEY, freshData, 30 * 60 * 1000);
            console.log('Background data refresh completed');
        }
        catch (error) {
            console.error('Background data refresh failed:', error);
        }
    }), 30 * 60 * 1000); // 30 menit
    // Juga refresh saat startup
    setTimeout(() => __awaiter(this, void 0, void 0, function* () {
        try {
            const freshData = yield (0, advancedScrapingService_1.comprehensiveScrape)();
            cacheService_1.cacheService.set(CACHE_KEY, freshData, 30 * 60 * 1000);
            console.log('Initial data load completed');
        }
        catch (error) {
            console.error('Initial data load failed:', error);
        }
    }), 5000); // 5 detik setelah startup
}
