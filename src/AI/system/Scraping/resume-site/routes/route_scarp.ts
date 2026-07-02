import { Router } from 'express';
import { ScraperController } from '../controllers/controller_scrap';
import { SmartScraperController } from '../controllers/controller_smart_scrap';
import { loginLimiter } from '../../../../../middleware/Server-Security/RateLimit';

const RouterScraping = Router();
const scraperController = new ScraperController();
const smartScraperController = new SmartScraperController();

RouterScraping.post('/one', loginLimiter, scraperController.scrapeWebsite.bind(scraperController));
RouterScraping.post('/multiple', loginLimiter, scraperController.scrapeMultipleWebsites.bind(scraperController));
RouterScraping.post('/smart', smartScraperController.smartScrape.bind(smartScraperController));
RouterScraping.get('/status', scraperController.getScrapingStatus.bind(scraperController));

export default RouterScraping;