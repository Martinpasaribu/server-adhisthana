"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.ScraperService = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const puppeteer_1 = __importDefault(require("puppeteer"));
class ScraperService {
    // Scraping dengan axios dan cheerio (untuk situs statis)
    scrapeWithCheerio(url) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const response = yield axios_1.default.get(url, {
                    timeout: 10000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                const $ = cheerio.load(response.data);
                // Ekstrak title
                const title = $('title').text() || $('meta[property="og:title"]').attr('content') || undefined;
                // Ekstrak description
                const description = $('meta[name="description"]').attr('content') ||
                    $('meta[property="og:description"]').attr('content') || undefined;
                // Ekstrak keywords
                const keywords = ((_a = $('meta[name="keywords"]').attr('content')) === null || _a === void 0 ? void 0 : _a.split(',').map(k => k.trim())) || [];
                // Ekstrak semua gambar
                const images = [];
                $('img').each((_, element) => {
                    const src = $(element).attr('src');
                    if (src) {
                        try {
                            images.push(new URL(src, url).href);
                        }
                        catch (error) {
                            // Skip invalid URLs
                            console.log(`Invalid image URL: ${src}`);
                        }
                    }
                });
                // Ekstrak semua link
                const links = [];
                $('a').each((_, element) => {
                    const href = $(element).attr('href');
                    if (href) {
                        try {
                            links.push(new URL(href, url).href);
                        }
                        catch (error) {
                            // Skip invalid URLs
                            console.log(`Invalid link URL: ${href}`);
                        }
                    }
                });
                // Ekstrak konten teks
                const content = $('body').text().replace(/\s+/g, ' ').trim();
                return {
                    url,
                    title,
                    description,
                    keywords,
                    images: images.slice(0, 10), // Batasi jumlah gambar
                    links: links.slice(0, 20), // Batasi jumlah link
                    content: content.substring(0, 1000), // Batasi konten
                    metadata: {
                        language: $('html').attr('lang') || undefined,
                        charset: $('meta[charset]').attr('charset') || undefined
                    }
                };
            }
            catch (error) {
                throw new Error(`Scraping dengan Cheerio gagal: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    // Scraping dengan Puppeteer (untuk situs dinamis/JavaScript)
    scrapeWithPuppeteer(url) {
        return __awaiter(this, void 0, void 0, function* () {
            let browser;
            try {
                browser = yield puppeteer_1.default.launch({
                    headless: true,
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                });
                const page = yield browser.newPage();
                yield page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
                yield page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
                // PERBAIKAN 1: Ganti waitForTimeout dengan setTimeout
                yield new Promise(resolve => setTimeout(resolve, 2000));
                const result = yield page.evaluate(() => {
                    const getMetaContent = (name) => {
                        const element = document.querySelector(`meta[name="${name}"]`) ||
                            document.querySelector(`meta[property="og:${name}"]`);
                        return element ? element.getAttribute('content') : null;
                    };
                    // Kumpulkan semua gambar
                    const images = Array.from(document.querySelectorAll('img'))
                        .map(img => img.src)
                        .filter(src => src.startsWith('http'));
                    // Kumpulkan semua link
                    const links = Array.from(document.querySelectorAll('a'))
                        .map(a => a.href)
                        .filter(href => href.startsWith('http'));
                    // Handle null values untuk description
                    const description = getMetaContent('description');
                    const keywordsContent = getMetaContent('keywords');
                    const keywords = keywordsContent ? keywordsContent.split(',').map(k => k.trim()) : [];
                    return {
                        title: document.title || undefined,
                        description: description || undefined, // Konversi null ke undefined
                        keywords: keywords.length > 0 ? keywords : undefined,
                        images: images.slice(0, 5),
                        links: links.slice(0, 20),
                        content: document.body.innerText.replace(/\s+/g, ' ').trim().substring(0, 5000),
                        metadata: {
                            language: document.documentElement.lang || undefined,
                            url: window.location.href
                        }
                    };
                });
                yield browser.close();
                return Object.assign({ url }, result);
            }
            catch (error) {
                if (browser) {
                    yield browser.close();
                }
                throw new Error(`Scraping dengan Puppeteer gagal: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    // Method utama untuk scraping
    scrapeWebsite(url_1) {
        return __awaiter(this, arguments, void 0, function* (url, usePuppeteer = false) {
            try {
                // Validasi URL
                if (!this.isValidUrl(url)) {
                    throw new Error('URL tidak valid');
                }
                if (usePuppeteer) {
                    return yield this.scrapeWithPuppeteer(url);
                }
                else {
                    return yield this.scrapeWithCheerio(url);
                }
            }
            catch (error) {
                throw new Error(`Scraping gagal: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    isValidUrl(urlString) {
        try {
            const url = new URL(urlString);
            return url.protocol === 'http:' || url.protocol === 'https:';
        }
        catch (_a) {
            return false;
        }
    }
}
exports.ScraperService = ScraperService;
