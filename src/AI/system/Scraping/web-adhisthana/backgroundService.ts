// services/backgroundService.ts
import { comprehensiveScrape } from './advancedScrapingService';
import { cacheService } from './cacheService';

const CACHE_KEY = 'comprehensive_villa_data';

export function startBackgroundDataRefresh() {
  // Refresh setiap 30 menit
  setInterval(async () => {
    try {
      console.log('Background data refresh started...');
      const freshData = await comprehensiveScrape();
      cacheService.set(CACHE_KEY, freshData, 30 * 60 * 1000);
      console.log('Background data refresh completed');
    } catch (error) {
      console.error('Background data refresh failed:', error);
    }
  }, 30 * 60 * 1000); // 30 menit

  // Juga refresh saat startup
  setTimeout(async () => {
    try {
      const freshData = await comprehensiveScrape();
      cacheService.set(CACHE_KEY, freshData, 30 * 60 * 1000);
      console.log('Initial data load completed');
    } catch (error) {
      console.error('Initial data load failed:', error);
    }
  }, 5000); // 5 detik setelah startup
}