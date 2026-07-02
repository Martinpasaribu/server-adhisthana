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
exports.comprehensiveScrape = comprehensiveScrape;
// services/advancedScrapingService.ts
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
function comprehensiveScrape() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Starting comprehensive website scraping...');
            const baseUrl = 'https://adhisthanavillas.com';
            const [basicInfo, villas, facilities, promos, events, testimonials, gallery] = yield Promise.all([
                scrapeBasicInfo(baseUrl),
                scrapeVillas(baseUrl),
                scrapeFacilities(baseUrl),
                scrapePromos(baseUrl),
                scrapeEvents(baseUrl),
                scrapeTestimonials(baseUrl),
                scrapeGallery(baseUrl)
            ]);
            return {
                basicInfo,
                villas,
                facilities,
                promos,
                events,
                testimonials,
                gallery,
                lastUpdated: new Date()
            };
        }
        catch (error) {
            console.error('Comprehensive scraping failed:', error);
            throw error;
        }
    });
}
function scrapeBasicInfo(baseUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(baseUrl, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; AdhisthanaBot/1.0; +https://adhisthanavillas.com)'
                }
            });
            const $ = cheerio.load(response.data);
            // Extract basic information
            const name = $('h1').first().text().trim() || 'Adhisthana Villas & Resort';
            const description = $('meta[name="description"]').attr('content') ||
                $('p').first().text().trim().substring(0, 200);
            // Extract contact info - adjust selectors based on actual website
            const phone = extractPhone($('body').html() || '');
            const email = extractEmail($('body').html() || '');
            // Extract location
            const location = $('[class*="address"], [class*="location"]').text().trim() ||
                'Kawasan Borobudur, Magelang, Jawa Tengah';
            return {
                name,
                description,
                location,
                contact: {
                    phone: phone || '081111177199',
                    email: email || 'info@adhisthanavillas.com',
                    website: baseUrl
                }
            };
        }
        catch (error) {
            console.error('Error scraping basic info:', error);
            return {
                name: 'Adhisthana Villas & Resort',
                description: 'Villa mewah di kawasan Borobudur, Magelang',
                location: 'Kawasan Borobudur, Magelang, Jawa Tengah',
                contact: {
                    phone: '081111177199',
                    email: 'info@adhisthanavillas.com',
                    website: baseUrl
                }
            };
        }
    });
}
function scrapeVillas(baseUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Try multiple possible villa page URLs
            const villaUrls = [
                `${baseUrl}/villas`,
                `${baseUrl}/rooms`,
                `${baseUrl}/accommodation`,
                `${baseUrl}/villa`
            ];
            let villas = [];
            for (const url of villaUrls) {
                try {
                    const response = yield axios_1.default.get(url, { timeout: 8000 });
                    const $ = cheerio.load(response.data);
                    // Multiple strategies to find villa information
                    const villaElements = $('.villa-item, .room-item, .package-item, .card, .product');
                    villaElements.each((index, element) => {
                        const $el = $(element);
                        const name = $el.find('h2, h3, .title, .name').first().text().trim();
                        const price = $el.find('.price, .cost, .rate').first().text().trim();
                        const capacity = $el.find('[class*="capacity"], [class*="guest"]').text().trim();
                        const description = $el.find('p, .description').first().text().trim();
                        if (name && name.length > 3) {
                            const features = [];
                            $el.find('li, .feature, .amenity').each((i, feat) => {
                                const featureText = $(feat).text().trim();
                                if (featureText)
                                    features.push(featureText);
                            });
                            villas.push({
                                name,
                                price: price || 'Hubungi untuk harga',
                                capacity: capacity || '2-6 orang',
                                features: features.slice(0, 8), // Limit features
                                description: description || `Villa ${name} dengan fasilitas lengkap`
                            });
                        }
                    });
                    if (villas.length > 0)
                        break; // Stop if we found villas
                }
                catch (error) {
                    continue; // Try next URL
                }
            }
            // Fallback: If no villas found, use knowledge base
            if (villas.length === 0) {
                villas = getFallbackVillas();
            }
            console.log(`Found ${villas.length} villas`);
            return villas;
        }
        catch (error) {
            console.error('Error scraping villas:', error);
            return getFallbackVillas();
        }
    });
}
function scrapeFacilities(baseUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const facilityUrls = [
                `${baseUrl}/facilities`,
                `${baseUrl}/amenities`,
                `${baseUrl}/services`
            ];
            let facilities = [];
            for (const url of facilityUrls) {
                try {
                    const response = yield axios_1.default.get(url, { timeout: 8000 });
                    const $ = cheerio.load(response.data);
                    $('li, .facility, .amenity, .feature').each((index, element) => {
                        const text = $(element).text().trim();
                        if (text && text.length > 5 && !facilities.includes(text)) {
                            facilities.push(text);
                        }
                    });
                    if (facilities.length > 0)
                        break;
                }
                catch (error) {
                    continue;
                }
            }
            // Fallback facilities
            if (facilities.length === 0) {
                facilities = [
                    'Private pool di setiap villa',
                    'Floating breakfast atau prasmanan',
                    'Butler pribadi 07.00–22.00',
                    'Shuttle gratis ke Candi Borobudur',
                    'Welcome drink + buah segar'
                ];
            }
            console.log(`Found ${facilities.length} facilities`);
            return facilities.slice(0, 15); // Limit to 15 facilities
        }
        catch (error) {
            console.error('Error scraping facilities:', error);
            return [];
        }
    });
}
function scrapePromos(baseUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`${baseUrl}/promo`, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; AdhisthanaBot/1.0; +https://adhisthanavillas.com)'
                }
            });
            const $ = cheerio.load(response.data);
            const promos = [];
            // Multiple selector strategies
            const promoElements = $('.promo, .offer, .discount, .special, .card, .package');
            promoElements.each((index, element) => {
                const $el = $(element);
                const title = $el.find('h2, h3, h4, .title').first().text().trim();
                const description = $el.find('p, .description').first().text().trim();
                if (title && title.length > 5) {
                    // Try to extract validity period
                    const text = $el.text();
                    const validity = extractValidityPeriod(text);
                    const terms = extractTerms(text);
                    promos.push({
                        title,
                        description: description || title,
                        validity: validity || 'Periode terbatas',
                        terms: terms || 'Syarat dan ketentuan berlaku'
                    });
                }
            });
            console.log(`Found ${promos.length} promos`);
            return promos.slice(0, 5); // Limit to 5 promos
        }
        catch (error) {
            console.error('Error scraping promos:', error);
            return [];
        }
    });
}
function scrapeEvents(baseUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`${baseUrl}/event`, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; AdhisthanaBot/1.0; +https://adhisthanavillas.com)'
                }
            });
            const $ = cheerio.load(response.data);
            const events = [];
            const eventElements = $('.event, .activity, .news, .blog-post, .card');
            eventElements.each((index, element) => {
                const $el = $(element);
                const title = $el.find('h2, h3, h4, .title').first().text().trim();
                const description = $el.find('p, .description, .excerpt').first().text().trim();
                const date = $el.find('.date, .time, [class*="datetime"]').first().text().trim();
                const location = $el.find('.location, .venue, .place').first().text().trim();
                if (title && title.length > 5) {
                    events.push({
                        title,
                        description: description || title,
                        date: date || 'Segera hadir',
                        location: location || 'Adhisthana Villas & Resort'
                    });
                }
            });
            console.log(`Found ${events.length} events`);
            return events.slice(0, 5);
        }
        catch (error) {
            console.error('Error scraping events:', error);
            return [];
        }
    });
}
function scrapeTestimonials(baseUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const testimonialUrls = [
                `${baseUrl}/testimonials`,
                `${baseUrl}/reviews`,
                `${baseUrl}/guestbook`
            ];
            let testimonials = [];
            for (const url of testimonialUrls) {
                try {
                    const response = yield axios_1.default.get(url, { timeout: 8000 });
                    const $ = cheerio.load(response.data);
                    $('.testimonial, .review, .comment').each((index, element) => {
                        const $el = $(element);
                        const author = $el.find('.author, .name, .guest').text().trim() || 'Guest';
                        const comment = $el.find('p, .text, .content').text().trim();
                        const rating = extractRating($el.text());
                        const date = $el.find('.date, .time').text().trim() || 'Recent';
                        if (comment && comment.length > 10) {
                            testimonials.push({
                                author,
                                rating,
                                comment: comment.substring(0, 200), // Limit comment length
                                date
                            });
                        }
                    });
                    if (testimonials.length > 0)
                        break;
                }
                catch (error) {
                    continue;
                }
            }
            console.log(`Found ${testimonials.length} testimonials`);
            return testimonials.slice(0, 8);
        }
        catch (error) {
            console.error('Error scraping testimonials:', error);
            return [];
        }
    });
}
function scrapeGallery(baseUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const galleryUrls = [
                `${baseUrl}/gallery`,
                `${baseUrl}/photos`,
                `${baseUrl}/portfolio`
            ];
            let gallery = [];
            for (const url of galleryUrls) {
                try {
                    const response = yield axios_1.default.get(url, { timeout: 8000 });
                    const $ = cheerio.load(response.data);
                    $('img, [class*="gallery"], [class*="photo"]').each((index, element) => {
                        const $el = $(element);
                        const src = $el.attr('src');
                        const alt = $el.attr('alt') || 'Villa photo';
                        if (src && !src.includes('icon') && !src.includes('logo')) {
                            const fullUrl = src.startsWith('http') ? src : `${baseUrl}${src}`;
                            gallery.push({
                                type: 'image',
                                url: fullUrl,
                                caption: alt
                            });
                        }
                    });
                    if (gallery.length > 0)
                        break;
                }
                catch (error) {
                    continue;
                }
            }
            console.log(`Found ${gallery.length} gallery items`);
            return gallery.slice(0, 10);
        }
        catch (error) {
            console.error('Error scraping gallery:', error);
            return [];
        }
    });
}
// Helper functions
function extractPhone(text) {
    const phoneRegex = /(\+?62|0)[\s-]?8[1-9][\s-]?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,5}/g;
    const matches = text.match(phoneRegex);
    return matches ? matches[0] : '';
}
function extractEmail(text) {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailRegex);
    return matches ? matches[0] : '';
}
function extractValidityPeriod(text) {
    const dateRegex = /(\d{1,2}[\s-/]\d{1,2}[\s-/]\d{2,4})|(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s,]*\d{1,2}[\s,]*\d{4}/gi;
    const matches = text.match(dateRegex);
    return matches ? matches.join(' - ') : '';
}
function extractTerms(text) {
    if (text.includes('syarat') || text.includes('ketentuan')) {
        return 'Syarat dan ketentuan berlaku';
    }
    return '';
}
function extractRating(text) {
    const starRegex = /⭐|★|⭑|[\d.]+(?=\s*star)/gi;
    const matches = text.match(starRegex);
    if (matches) {
        // Simple rating extraction
        return Math.min(5, Math.max(1, matches.length));
    }
    return 5; // Default rating
}
function getFallbackVillas() {
    return [
        {
            name: "Villa Joglo Atas",
            price: "Rp 4.950.000/malam",
            capacity: "4 orang",
            features: ["2 kamar", "private pool", "view sawah & Merapi"],
            description: "Villa dengan pemandangan sawah dan Gunung Merapi"
        },
        {
            name: "Villa Joglo Bawah",
            price: "Rp 5.300.000/malam",
            capacity: "4 orang",
            features: ["2 kamar", "private pool lebih luas"],
            description: "Villa dengan kolam pribadi yang lebih luas"
        },
        {
            name: "Villa Kandang",
            price: "Rp 6.800.000/malam",
            capacity: "6 orang",
            features: ["3 kamar", "private pool besar", "view terbaik"],
            description: "Villa terbesar dengan pemandangan terbaik"
        },
        {
            name: "Villa Omah Putih",
            price: "Rp 3.800.000/malam",
            capacity: "2 orang",
            features: ["1 kamar", "private pool", "konsep romantis"],
            description: "Villa romantis untuk pasangan"
        },
        {
            name: "Villa Omah Kayu",
            price: "Rp 3.500.000/malam",
            capacity: "2 orang",
            features: ["1 kamar", "konsep glamping mewah"],
            description: "Villa dengan konsep glamping yang mewah"
        }
    ];
}
