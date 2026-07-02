import { Request, Response } from 'express';
import { SmartScraperService } from '../services/service_smart_scrap';

const smartScraper = new SmartScraperService();

export class SmartScraperController {
  
  async smartScrape(req: Request, res: Response): Promise<void> {
    try {
      const { url, waitForSelectors, waitForNetworkIdle, screenshot } = req.body;
      
      if (!url) {
        res.status(400).json({
          success: false,
          error: 'URL diperlukan'
        });
        return;
      }

      const result = await smartScraper.smartScrape(url, {
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
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui',
        timestamp: new Date().toISOString()
      });
    }
  }

  async detectWebsiteType(req: Request, res: Response): Promise<void> {
    try {
      const { url } = req.body;
      
      if (!url) {
        res.status(400).json({
          success: false,
          error: 'URL diperlukan'
        });
        return;
      }

      await smartScraper.initialize();
      const websiteType = await (smartScraper as any).detectWebsiteType(url);

      res.json({
        success: true,
        data: { url, websiteType },
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
}