import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

export interface ScrapingResult {
  url: string;
  title?: string;
  description?: string | null;
  keywords?: string[];
  images?: string[];
  links?: string[];
  content?: string;
  metadata?: Record<string, any>;
  error?: string;
}

export class ScraperService {
  
  // Scraping dengan axios dan cheerio (untuk situs statis)
  async scrapeWithCheerio(url: string): Promise<ScrapingResult> {
    try {
      const response = await axios.get(url, {
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
      const keywords = $('meta[name="keywords"]').attr('content')?.split(',').map(k => k.trim()) || [];
      
      // Ekstrak semua gambar
      const images: string[] = [];
      $('img').each((_, element) => {
        const src = $(element).attr('src');
        if (src) {
          try {
            images.push(new URL(src, url).href);
          } catch (error) {
            // Skip invalid URLs
            console.log(`Invalid image URL: ${src}`);
          }
        }
      });
      
      // Ekstrak semua link
      const links: string[] = [];
      $('a').each((_, element) => {
        const href = $(element).attr('href');
        if (href) {
          try {
            links.push(new URL(href, url).href);
          } catch (error) {
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
        links: links.slice(0, 20),   // Batasi jumlah link
        content: content.substring(0, 1000), // Batasi konten
        metadata: {
          language: $('html').attr('lang') || undefined,
          charset: $('meta[charset]').attr('charset') || undefined
        }
      };
      
    } catch (error) {
      throw new Error(`Scraping dengan Cheerio gagal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Scraping dengan Puppeteer (untuk situs dinamis/JavaScript)
  async scrapeWithPuppeteer(url: string): Promise<ScrapingResult> {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // PERBAIKAN 1: Ganti waitForTimeout dengan setTimeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = await page.evaluate((): Omit<ScrapingResult, 'url'> => {
        const getMetaContent = (name: string): string | null => {
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
      
      await browser.close();
      
      return {
        url,
        ...result
      };
      
    } catch (error) {
      if (browser) {
        await browser.close();
      }
      throw new Error(`Scraping dengan Puppeteer gagal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Method utama untuk scraping
  async scrapeWebsite(url: string, usePuppeteer: boolean = false): Promise<ScrapingResult> {
    try {
      // Validasi URL
      if (!this.isValidUrl(url)) {
        throw new Error('URL tidak valid');
      }
      
      if (usePuppeteer) {
        return await this.scrapeWithPuppeteer(url);
      } else {
        return await this.scrapeWithCheerio(url);
      }
      
    } catch (error) {
      throw new Error(`Scraping gagal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private isValidUrl(urlString: string): boolean {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }
}