// controllers/chatController.ts
import { Request, Response } from "express";
import { getGrokResponse } from "../services/service_grok";
import { Message } from "../../../types";
import { getAIResponse } from "../services/main";

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