import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer, { Page, Browser } from 'puppeteer';

// Definisikan interface di sini atau import dari file types
export interface ScrapingResult {
  url: string;
  title?: string;
  description?: string | null;
  keywords?: string[];
  images?: string[];
  links?: string[];
  content?: string;
  metadata?: Record<string, any>; // Gunakan Record untuk flexibility
  error?: string;
}

export interface SmartScrapingOptions {
  timeout?: number;
  waitForSelectors?: string[];
  waitForNetworkIdle?: boolean;
  executeScripts?: string[];
  screenshot?: boolean;
}

export class SmartScraperService {
  private browser: Browser | null = null;

  async initialize(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=site-per-process'
        ]
      });
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  // Deteksi tipe website
  private async detectWebsiteType(url: string): Promise<'static' | 'dynamic' | 'spa'> {
    try {
      const response = await axios.get(url, {
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
      } else if (scripts > 10 || hasReact) {
        return 'dynamic';
      } else {
        return 'static';
      }
    } catch (error) {
      return 'dynamic';
    }
  }

  // Smart scraping dengan auto-detection
  async smartScrape(url: string, options: SmartScrapingOptions = {}): Promise<ScrapingResult> {
    await this.initialize();
    
    const websiteType = await this.detectWebsiteType(url);
    console.log(`Detected website type: ${websiteType} for ${url}`);

    switch (websiteType) {
      case 'static':
        return await this.scrapeStatic(url);
      case 'dynamic':
        return await this.scrapeDynamic(url, options);
      case 'spa':
        return await this.scrapeSPA(url, options);
      default:
        return await this.scrapeDynamic(url, options);
    }
  }

  // Scraping untuk website static (optimized)
  private async scrapeStatic(url: string): Promise<ScrapingResult> {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      return this.extractDataWithCheerio($, url);
    } catch (error) {
      return await this.scrapeDynamic(url);
    }
  }

  // Scraping untuk website dynamic
  private async scrapeDynamic(url: string, options: SmartScrapingOptions = {}): Promise<ScrapingResult> {
    if (!this.browser) throw new Error('Browser not initialized');

    const page = await this.browser.newPage();
    
    try {
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if (['image', 'font', 'stylesheet'].includes(req.resourceType())) {
          req.abort();
        } else {
          req.continue();
        }
      });

      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: options.timeout || 30000
      });

      if (options.waitForNetworkIdle) {
        await page.waitForNetworkIdle();
      }

      if (options.waitForSelectors) {
        for (const selector of options.waitForSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 5000 });
          } catch (error) {
            console.log(`Selector ${selector} not found`);
          }
        }
      }

      if (options.executeScripts) {
        for (const script of options.executeScripts) {
          await page.evaluate(script);
        }
      }

      await this.autoScroll(page);

      return await this.extractDataWithPuppeteer(page, url, options);

    } finally {
      await page.close();
    }
  }

  // Scraping khusus untuk Single Page Applications (SPA)
  private async scrapeSPA(url: string, options: SmartScrapingOptions = {}): Promise<ScrapingResult> {
    if (!this.browser) throw new Error('Browser not initialized');

    const page = await this.browser.newPage();
    
    try {
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: options.timeout || 45000
      });

      await new Promise(resolve => setTimeout(resolve, 3000));
      await this.autoScroll(page);
      await this.clickLoadMoreButtons(page);

      return await this.extractDataWithPuppeteer(page, url, options);

    } finally {
      await page.close();
    }
  }

  // Auto-scroll untuk memuat lazy content
  private async autoScroll(page: Page): Promise<void> {
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
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
    });
  }

  // Coba klik tombol "Load More", "See More", dll.
  private async clickLoadMoreButtons(page: Page): Promise<void> {
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
        const button = await page.$(selector);
        if (button) {
          await button.click();
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        // Continue jika gagal klik
      }
    }
  }

  // Extract data dengan Cheerio
  private extractDataWithCheerio($: cheerio.CheerioAPI, url: string): ScrapingResult {
    const title = $('title').text() || $('meta[property="og:title"]').attr('content') || undefined;
    const description = $('meta[name="description"]').attr('content') || 
                       $('meta[property="og:description"]').attr('content') || undefined;
    
    const keywords = $('meta[name="keywords"]').attr('content')?.split(',').map(k => k.trim()) || [];

    const images: string[] = [];
    $('img').each((_, element) => {
      const src = $(element).attr('src');
      if (src) {
        try {
          const fullUrl = new URL(src, url).href;
          if (fullUrl.startsWith('http')) {
            images.push(fullUrl);
          }
        } catch (error) {
          // Skip invalid URLs
        }
      }
    });

    const links: string[] = [];
    $('a').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        try {
          const fullUrl = new URL(href, url).href;
          if (fullUrl.startsWith('http')) {
            links.push(fullUrl);
          }
        } catch (error) {
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
  private async extractDataWithPuppeteer(page: Page, url: string, options: SmartScrapingOptions): Promise<ScrapingResult> {
    const result = await page.evaluate(() => {
      const getMetaContent = (name: string): string | undefined => {
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

      const structuredData: any[] = [];
      const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
      jsonLdScripts.forEach(script => {
        try {
          const data = JSON.parse(script.textContent || '');
          structuredData.push(data);
        } catch (error) {
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
    let metadata = result.metadata as Record<string, any>;

    // Ambil screenshot jika diminta
    if (options.screenshot) {
      const screenshot = await page.screenshot({ encoding: 'base64' });
      metadata = {
        ...metadata,
        screenshot: `data:image/png;base64,${screenshot}`
      };
    }

    return {
      url,
      ...result,
      metadata
    };
  }
}