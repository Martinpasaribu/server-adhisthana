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
exports.SmartScraperService = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const puppeteer_1 = __importDefault(require("puppeteer"));
class SmartScraperService {
    constructor() {
        this.browser = null;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.browser) {
                this.browser = yield puppeteer_1.default.launch({
                    headless: true,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-web-security',
                        '--disable-features=site-per-process'
                    ]
                });
            }
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.browser) {
                yield this.browser.close();
                this.browser = null;
            }
        });
    }
    // Deteksi tipe website
    detectWebsiteType(url) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(url, {
                    timeout: 5000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                const $ = cheerio.load(response.data);
                const scripts = $('script').length;
                const hasReact = $('script[src*="react"]').length > 0 ||
                    $('script[src*="vue"]').length > 0 ||
                    $('script[src*="angular"]').length > 0;
                const hasNextJs = $('script[src*="_next"]').length > 0;
                const hasAppRoot = $('#root, #app, #__next').length > 0;
                const minimalContent = $('body').text().trim().length < 100;
                if (hasReact || hasNextJs || hasAppRoot || (minimalContent && scripts > 5)) {
                    return 'spa';
                }
                else if (scripts > 10 || hasReact) {
                    return 'dynamic';
                }
                else {
                    return 'static';
                }
            }
            catch (error) {
                return 'dynamic';
            }
        });
    }
    // Smart scraping dengan auto-detection
    smartScrape(url_1) {
        return __awaiter(this, arguments, void 0, function* (url, options = {}) {
            yield this.initialize();
            const websiteType = yield this.detectWebsiteType(url);
            console.log(`Detected website type: ${websiteType} for ${url}`);
            switch (websiteType) {
                case 'static':
                    return yield this.scrapeStatic(url);
                case 'dynamic':
                    return yield this.scrapeDynamic(url, options);
                case 'spa':
                    return yield this.scrapeSPA(url, options);
                default:
                    return yield this.scrapeDynamic(url, options);
            }
        });
    }
    // Scraping untuk website static (optimized)
    scrapeStatic(url) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(url, {
                    timeout: 10000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                const $ = cheerio.load(response.data);
                return this.extractDataWithCheerio($, url);
            }
            catch (error) {
                return yield this.scrapeDynamic(url);
            }
        });
    }
    // Scraping untuk website dynamic
    scrapeDynamic(url_1) {
        return __awaiter(this, arguments, void 0, function* (url, options = {}) {
            if (!this.browser)
                throw new Error('Browser not initialized');
            const page = yield this.browser.newPage();
            try {
                yield page.setViewport({ width: 1920, height: 1080 });
                yield page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
                yield page.setRequestInterception(true);
                page.on('request', (req) => {
                    if (['image', 'font', 'stylesheet'].includes(req.resourceType())) {
                        req.abort();
                    }
                    else {
                        req.continue();
                    }
                });
                yield page.goto(url, {
                    waitUntil: 'domcontentloaded',
                    timeout: options.timeout || 30000
                });
                if (options.waitForNetworkIdle) {
                    yield page.waitForNetworkIdle();
                }
                if (options.waitForSelectors) {
                    for (const selector of options.waitForSelectors) {
                        try {
                            yield page.waitForSelector(selector, { timeout: 5000 });
                        }
                        catch (error) {
                            console.log(`Selector ${selector} not found`);
                        }
                    }
                }
                if (options.executeScripts) {
                    for (const script of options.executeScripts) {
                        yield page.evaluate(script);
                    }
                }
                yield this.autoScroll(page);
                return yield this.extractDataWithPuppeteer(page, url, options);
            }
            finally {
                yield page.close();
            }
        });
    }
    // Scraping khusus untuk Single Page Applications (SPA)
    scrapeSPA(url_1) {
        return __awaiter(this, arguments, void 0, function* (url, options = {}) {
            if (!this.browser)
                throw new Error('Browser not initialized');
            const page = yield this.browser.newPage();
            try {
                yield page.setViewport({ width: 1920, height: 1080 });
                yield page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
                yield page.goto(url, {
                    waitUntil: 'networkidle0',
                    timeout: options.timeout || 45000
                });
                yield new Promise(resolve => setTimeout(resolve, 3000));
                yield this.autoScroll(page);
                yield this.clickLoadMoreButtons(page);
                return yield this.extractDataWithPuppeteer(page, url, options);
            }
            finally {
                yield page.close();
            }
        });
    }
    // Auto-scroll untuk memuat lazy content
    autoScroll(page) {
        return __awaiter(this, void 0, void 0, function* () {
            yield page.evaluate(() => __awaiter(this, void 0, void 0, function* () {
                yield new Promise((resolve) => {
                    let totalHeight = 0;
                    const distance = 100;
                    const timer = setInterval(() => {
                        const scrollHeight = document.body.scrollHeight;
                        window.scrollBy(0, distance);
                        totalHeight += distance;
                        if (totalHeight >= scrollHeight) {
                            clearInterval(timer);
                            resolve();
                        }
                    }, 100);
                });
            }));
        });
    }
    // Coba klik tombol "Load More", "See More", dll.
    clickLoadMoreButtons(page) {
        return __awaiter(this, void 0, void 0, function* () {
            const buttonSelectors = [
                'button:contains("Load More")',
                'button:contains("See More")',
                'button:contains("Show More")',
                'a:contains("Load More")',
                'a:contains("See More")',
                '.load-more',
                '.see-more',
                '[data-load-more]'
            ];
            for (const selector of buttonSelectors) {
                try {
                    const button = yield page.$(selector);
                    if (button) {
                        yield button.click();
                        yield new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }
                catch (error) {
                    // Continue jika gagal klik
                }
            }
        });
    }
    // Extract data dengan Cheerio
    extractDataWithCheerio($, url) {
        var _a;
        const title = $('title').text() || $('meta[property="og:title"]').attr('content') || undefined;
        const description = $('meta[name="description"]').attr('content') ||
            $('meta[property="og:description"]').attr('content') || undefined;
        const keywords = ((_a = $('meta[name="keywords"]').attr('content')) === null || _a === void 0 ? void 0 : _a.split(',').map(k => k.trim())) || [];
        const images = [];
        $('img').each((_, element) => {
            const src = $(element).attr('src');
            if (src) {
                try {
                    const fullUrl = new URL(src, url).href;
                    if (fullUrl.startsWith('http')) {
                        images.push(fullUrl);
                    }
                }
                catch (error) {
                    // Skip invalid URLs
                }
            }
        });
        const links = [];
        $('a').each((_, element) => {
            const href = $(element).attr('href');
            if (href) {
                try {
                    const fullUrl = new URL(href, url).href;
                    if (fullUrl.startsWith('http')) {
                        links.push(fullUrl);
                    }
                }
                catch (error) {
                    // Skip invalid URLs
                }
            }
        });
        const contentSelectors = [
            'main', 'article', '.content', '#content', '.main-content',
            '.post-content', '.entry-content', '.story-content'
        ];
        let content = '';
        for (const selector of contentSelectors) {
            const element = $(selector);
            if (element.length) {
                content = element.text().replace(/\s+/g, ' ').trim();
                break;
            }
        }
        if (!content) {
            content = $('body').text().replace(/\s+/g, ' ').trim();
        }
        return {
            url,
            title,
            description,
            keywords: keywords.length > 0 ? keywords : undefined,
            images: images.slice(0, 15),
            links: links.slice(0, 25),
            content: content.substring(0, 2000),
            metadata: {
                language: $('html').attr('lang') || undefined,
                charset: $('meta[charset]').attr('charset') || undefined,
                scraper: 'smart-static'
            }
        };
    }
    // Extract data dengan Puppeteer - VERSI YANG SUDAH DIPERBAIKI
    extractDataWithPuppeteer(page, url, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield page.evaluate(() => {
                const getMetaContent = (name) => {
                    const element = document.querySelector(`meta[name="${name}"]`) ||
                        document.querySelector(`meta[property="og:${name}"]`);
                    return element ? element.getAttribute('content') || undefined : undefined;
                };
                const images = Array.from(document.querySelectorAll('img'))
                    .map(img => img.src)
                    .filter(src => src.startsWith('http'));
                const links = Array.from(document.querySelectorAll('a'))
                    .map(a => a.href)
                    .filter(href => href.startsWith('http'));
                const keywordsContent = getMetaContent('keywords');
                const keywords = keywordsContent ? keywordsContent.split(',').map(k => k.trim()) : [];
                const contentSelectors = [
                    'main', 'article', '.content', '#content', '.main-content',
                    '.post-content', '.entry-content', '.story-content', 'section'
                ];
                let mainContent = '';
                for (const selector of contentSelectors) {
                    const element = document.querySelector(selector);
                    if (element) {
                        mainContent = element.textContent || '';
                        break;
                    }
                }
                if (!mainContent) {
                    mainContent = document.body.textContent || '';
                }
                const structuredData = [];
                const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
                jsonLdScripts.forEach(script => {
                    try {
                        const data = JSON.parse(script.textContent || '');
                        structuredData.push(data);
                    }
                    catch (error) {
                        // Skip invalid JSON
                    }
                });
                return {
                    title: document.title || undefined,
                    description: getMetaContent('description'),
                    keywords: keywords.length > 0 ? keywords : undefined,
                    images: images.slice(0, 15),
                    links: links.slice(0, 25),
                    content: mainContent.replace(/\s+/g, ' ').trim().substring(0, 2000),
                    metadata: {
                        language: document.documentElement.lang || undefined,
                        url: window.location.href,
                        structuredData: structuredData.length > 0 ? structuredData : undefined,
                        scraper: 'smart-dynamic'
                    }
                };
            });
            // PERBAIKAN: Type assertion untuk metadata
            let metadata = result.metadata;
            // Ambil screenshot jika diminta
            if (options.screenshot) {
                const screenshot = yield page.screenshot({ encoding: 'base64' });
                metadata = Object.assign(Object.assign({}, metadata), { screenshot: `data:image/png;base64,${screenshot}` });
            }
            return Object.assign(Object.assign({ url }, result), { metadata });
        });
    }
}
exports.SmartScraperService = SmartScraperService;
