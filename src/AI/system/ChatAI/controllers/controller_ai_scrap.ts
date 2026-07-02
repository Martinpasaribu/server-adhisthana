// controllers/chatController.ts
import { Request, Response } from "express";
import { getAIResponse } from "../services/main_scarp"; // Pastikan path ini benar
import { comprehensiveScrape } from "../../Scraping/web-adhisthana/advancedScrapingService"; // Fungsi scraping comprehensive
import { startBackgroundDataRefresh } from "../../Scraping/web-adhisthana/backgroundService"; // Background refresh
import { Message } from "../../../types";

// Fungsi utama chat handler (sudah ada)
export const chatHandler = async (req: Request, res: Response) => {
  let question: string;
  let history: Message[] = [];

  console.log("Received request body:", req.body);
  console.log("Content-Type:", req.headers['content-type']);

  try {
    if (typeof req.body === "string") {
      question = req.body.trim();
    } else {
      const body = req.body as { question?: string; history?: Message[] };
      question = body.question?.trim() || "";
      history = body.history || [];
    }

    console.log("Processed question:", question);
    console.log("History length:", history.length);

    if (!question) {
      return res.status(400).json({ error: "Pertanyaan tidak boleh kosong" });
    }

    // ✅ INI YANG UTAMA: Panggil getAIResponse yang sudah include scraping
    const answer = await getAIResponse(question, history);
    
    console.log("Successfully generated answer");

    res.json({
      answer,
      newHistory: [
        ...history, 
        { role: "user", content: question }, 
        { role: "assistant", content: answer }
      ]
    });
    
  } catch (error: any) {
    console.error("Controller Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    // Berikan error message yang lebih spesifik
    if (error.response?.status === 400) {
      return res.status(400).json({ 
        error: "Permintaan tidak valid ke AI API. Periksa parameter request." 
      });
    }
    
    if (error.response?.status === 429) {
      return res.status(429).json({ 
        error: "Rate limit exceeded. Coba lagi nanti." 
      });
    }
    
    if (error.response?.status === 401) {
      return res.status(401).json({ 
        error: "API key tidak valid" 
      });
    }

    res.status(500).json({ 
      error: "Maaf, Mbok Siti sedang istirahat sejenak. Monggo coba lagi ya." 
    });
  }
};

// ✅ FUNGSI BARU 1: Manual Data Refresh
export const refreshDataHandler = async (req: Request, res: Response) => {
  try {
    console.log('Manual data refresh requested');
    
    // Lakukan scraping comprehensive
    const scrapedData = await comprehensiveScrape();
    
    res.json({
      success: true,
      message: 'Data berhasil diperbarui',
      data: {
        villasCount: scrapedData.villas.length,
        promosCount: scrapedData.promos.length,
        eventsCount: scrapedData.events.length,
        facilitiesCount: scrapedData.facilities.length,
        testimonialsCount: scrapedData.testimonials.length,
        lastUpdated: scrapedData.lastUpdated
      }
    });
  } catch (error: any) {
    console.error('Manual refresh failed:', error);
    res.status(500).json({
      success: false,
      message: `Gagal memperbarui data: ${error.message}`
    });
  }
};

// ✅ FUNGSI BARU 2: Get Current Data Status
export const getDataStatusHandler = async (req: Request, res: Response) => {
  try {
    // Anda bisa mengembalikan status cache atau data terakhir
    // Ini contoh sederhana, sesuaikan dengan cache service Anda
    
    res.json({
      success: true,
      message: 'Service AI berjalan dengan baik',
      features: [
        'Web scraping otomatis untuk data terbaru',
        'Cache data 30 menit untuk performa',
        'Fallback system jika scraping gagal',
        'Multi-provider AI (OpenAI/Gemini/Groq)'
      ],
      lastChecked: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Data status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking data status'
    });
  }
};

// ✅ FUNGSI BARU 3: Health Check
export const healthCheckHandler = async (req: Request, res: Response) => {
  try {
    // Test basic AI response
    const testQuestion = "Halo";
    const testAnswer = await getAIResponse(testQuestion, []);
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      aiService: 'operational',
      scrapingService: 'enabled',
      message: 'Mbok Siti siap melayani!'
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      message: 'Service sedang mengalami gangguan'
    });
  }
};