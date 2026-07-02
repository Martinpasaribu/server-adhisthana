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
exports.ScraperController = void 0;
const service_scrap_1 = require("../services/service_scrap");
const scraperService = new service_scrap_1.ScraperService();
class ScraperController {
    scrapeWebsite(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { url, method = 'puppeteer' } = req.body;
                if (!url) {
                    res.status(400).json({
                        success: false,
                        error: 'URL diperlukan'
                    });
                    return;
                }
                const usePuppeteer = method === 'puppeteer';
                const result = yield scraperService.scrapeWebsite(url, usePuppeteer);
                res.json({
                    success: true,
                    data: result,
                    timestamp: new Date().toISOString()
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui',
                    timestamp: new Date().toISOString()
                });
            }
        });
    }
    scrapeMultipleWebsites(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { urls, method = 'puppeteer' } = req.body;
                if (!urls || !Array.isArray(urls)) {
                    res.status(400).json({
                        success: false,
                        error: 'Array URLs diperlukan'
                    });
                    return;
                }
                const usePuppeteer = method === 'puppeteer';
                const results = yield Promise.all(urls.map((url) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        return yield scraperService.scrapeWebsite(url, usePuppeteer);
                    }
                    catch (error) {
                        return {
                            url,
                            error: error instanceof Error ? error.message : 'Unknown error'
                        };
                    }
                })));
                res.json({
                    success: true,
                    data: results,
                    timestamp: new Date().toISOString()
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui',
                    timestamp: new Date().toISOString()
                });
            }
        });
    }
    getScrapingStatus(req, res) {
        res.json({
            status: 'active',
            service: 'Web Scraper API',
            version: '1.0.0',
            timestamp: new Date().toISOString()
        });
    }
}
exports.ScraperController = ScraperController;
