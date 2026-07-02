// services/advancedScrapingService.ts
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface VillaData {
  basicInfo: {
    name: string;
    description: string;
    location: string;
    contact: {
      phone: string;
      email: string;
      website: string;
    };
  };
  villas: Villa[];
  facilities: string[];
  promos: Promo[];
  events: Event[];
  testimonials: Testimonial[];
  gallery: GalleryItem[];
  lastUpdated: Date;
}

export interface Villa {
  name: string;
  price: string;
  capacity: string;
  features: string[];
  description: string;
}

export interface Promo {
  title: string;
  description: string;
  validity: string;
  terms: string;
}

export interface Event {
  title: string;
  date: string;
  description: string;
  location: string;
}

export interface Testimonial {
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface GalleryItem {
  type: 'image' | 'video';
  url: string;
  caption: string;
}

export async function comprehensiveScrape(): Promise<VillaData> {
  try {
    console.log('Starting comprehensive website scraping...');
    
    const baseUrl = 'https://adhisthanavillas.com';
    
    const [
      basicInfo,
      villas,
      facilities,
      promos,
      events,
      testimonials,
      gallery
    ] = await Promise.all([
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
  } catch (error) {
    console.error('Comprehensive scraping failed:', error);
    throw error;
  }
}

async function scrapeBasicInfo(baseUrl: string) {
  try {
    const response = await axios.get(baseUrl, {
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
  } catch (error) {
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
}

async function scrapeVillas(baseUrl: string): Promise<Villa[]> {
  try {
    // Try multiple possible villa page URLs
    const villaUrls = [
      `${baseUrl}/villas`,
      `${baseUrl}/rooms`,
      `${baseUrl}/accommodation`,
      `${baseUrl}/villa`
    ];

    let villas: Villa[] = [];
    
    for (const url of villaUrls) {
      try {
        const response = await axios.get(url, { timeout: 8000 });
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
            const features: string[] = [];
            $el.find('li, .feature, .amenity').each((i, feat) => {
              const featureText = $(feat).text().trim();
              if (featureText) features.push(featureText);
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
        
        if (villas.length > 0) break; // Stop if we found villas
      } catch (error) {
        continue; // Try next URL
      }
    }
    
    // Fallback: If no villas found, use knowledge base
    if (villas.length === 0) {
      villas = getFallbackVillas();
    }
    
    console.log(`Found ${villas.length} villas`);
    return villas;
  } catch (error) {
    console.error('Error scraping villas:', error);
    return getFallbackVillas();
  }
}

async function scrapeFacilities(baseUrl: string): Promise<string[]> {
  try {
    const facilityUrls = [
      `${baseUrl}/facilities`,
      `${baseUrl}/amenities`,
      `${baseUrl}/services`
    ];

    let facilities: string[] = [];
    
    for (const url of facilityUrls) {
      try {
        const response = await axios.get(url, { timeout: 8000 });
        const $ = cheerio.load(response.data);
        
        $('li, .facility, .amenity, .feature').each((index, element) => {
          const text = $(element).text().trim();
          if (text && text.length > 5 && !facilities.includes(text)) {
            facilities.push(text);
          }
        });
        
        if (facilities.length > 0) break;
      } catch (error) {
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
  } catch (error) {
    console.error('Error scraping facilities:', error);
    return [];
  }
}

async function scrapePromos(baseUrl: string): Promise<Promo[]> {
  try {
    const response = await axios.get(`${baseUrl}/promo`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AdhisthanaBot/1.0; +https://adhisthanavillas.com)'
      }
    });

    const $ = cheerio.load(response.data);
    const promos: Promo[] = [];

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
  } catch (error) {
    console.error('Error scraping promos:', error);
    return [];
  }
}

async function scrapeEvents(baseUrl: string): Promise<Event[]> {
  try {
    const response = await axios.get(`${baseUrl}/event`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AdhisthanaBot/1.0; +https://adhisthanavillas.com)'
      }
    });

    const $ = cheerio.load(response.data);
    const events: Event[] = [];

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
  } catch (error) {
    console.error('Error scraping events:', error);
    return [];
  }
}

async function scrapeTestimonials(baseUrl: string): Promise<Testimonial[]> {
  try {
    const testimonialUrls = [
      `${baseUrl}/testimonials`,
      `${baseUrl}/reviews`,
      `${baseUrl}/guestbook`
    ];

    let testimonials: Testimonial[] = [];
    
    for (const url of testimonialUrls) {
      try {
        const response = await axios.get(url, { timeout: 8000 });
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
        
        if (testimonials.length > 0) break;
      } catch (error) {
        continue;
      }
    }
    
    console.log(`Found ${testimonials.length} testimonials`);
    return testimonials.slice(0, 8);
  } catch (error) {
    console.error('Error scraping testimonials:', error);
    return [];
  }
}

async function scrapeGallery(baseUrl: string): Promise<GalleryItem[]> {
  try {
    const galleryUrls = [
      `${baseUrl}/gallery`,
      `${baseUrl}/photos`,
      `${baseUrl}/portfolio`
    ];

    let gallery: GalleryItem[] = [];
    
    for (const url of galleryUrls) {
      try {
        const response = await axios.get(url, { timeout: 8000 });
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
        
        if (gallery.length > 0) break;
      } catch (error) {
        continue;
      }
    }
    
    console.log(`Found ${gallery.length} gallery items`);
    return gallery.slice(0, 10);
  } catch (error) {
    console.error('Error scraping gallery:', error);
    return [];
  }
}

// Helper functions
function extractPhone(text: string): string {
  const phoneRegex = /(\+?62|0)[\s-]?8[1-9][\s-]?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,5}/g;
  const matches = text.match(phoneRegex);
  return matches ? matches[0] : '';
}

function extractEmail(text: string): string {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex);
  return matches ? matches[0] : '';
}

function extractValidityPeriod(text: string): string {
  const dateRegex = /(\d{1,2}[\s-/]\d{1,2}[\s-/]\d{2,4})|(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s,]*\d{1,2}[\s,]*\d{4}/gi;
  const matches = text.match(dateRegex);
  return matches ? matches.join(' - ') : '';
}

function extractTerms(text: string): string {
  if (text.includes('syarat') || text.includes('ketentuan')) {
    return 'Syarat dan ketentuan berlaku';
  }
  return '';
}

function extractRating(text: string): number {
  const starRegex = /⭐|★|⭑|[\d.]+(?=\s*star)/gi;
  const matches = text.match(starRegex);
  if (matches) {
    // Simple rating extraction
    return Math.min(5, Math.max(1, matches.length));
  }
  return 5; // Default rating
}

function getFallbackVillas(): Villa[] {
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