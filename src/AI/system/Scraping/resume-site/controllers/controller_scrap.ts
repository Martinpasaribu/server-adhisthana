import { Request, Response } from 'express';
import { ScraperService, ScrapingResult } from '../services/service_scrap';

const scraperService = new ScraperService();

export class ScraperController {
  
  async scrapeWebsite(req: Request, res: Response): Promise<void> {
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
      const result: ScrapingResult = await scraperService.scrapeWebsite(url, usePuppeteer);
      
      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  async scrapeMultipleWebsites(req: Request, res: Response): Promise<void> {
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
      const results = await Promise.all(
        urls.map(async (url: string) => {
          try {
            return await scraperService.scrapeWebsite(url, usePuppeteer);
          } catch (error) {
            return {
              url,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        })
      );
      
      res.json({
        success: true,
        data: results,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  getScrapingStatus(req: Request, res: Response): void {
    res.json({
      status: 'active',
      service: 'Web Scraper API',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  }
}