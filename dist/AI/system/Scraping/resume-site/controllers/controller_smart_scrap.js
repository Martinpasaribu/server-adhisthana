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
exports.SmartScraperController = void 0;
const service_smart_scrap_1 = require("../services/service_smart_scrap");
const smartScraper = new service_smart_scrap_1.SmartScraperService();
class SmartScraperController {
    smartScrape(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { url, waitForSelectors, waitForNetworkIdle, screenshot } = req.body;
                if (!url) {
                    res.status(400).json({
                        success: false,
                        error: 'URL diperlukan'
                    });
                    return;
                }
                const result = yield smartScraper.smartScrape(url, {
                    waitForSelectors,
                    waitForNetworkIdle: waitForNetworkIdle || false,
                    screenshot: screenshot || false,
                    timeout: 30000
                });
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
    detectWebsiteType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { url } = req.body;
                if (!url) {
                    res.status(400).json({
                        success: false,
                        error: 'URL diperlukan'
                    });
                    return;
                }
                yield smartScraper.initialize();
                const websiteType = yield smartScraper.detectWebsiteType(url);
                res.json({
                    success: true,
                    data: { url, websiteType },
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
}
exports.SmartScraperController = SmartScraperController;
