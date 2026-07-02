import { Router } from "express";
import { chatHandler } from "../controllers/controller_ai";
import { getDataStatusHandler, healthCheckHandler, refreshDataHandler } from "../controllers/controller_ai_scrap";
// import { chatHandler, getDataStatusHandler, healthCheckHandler, refreshDataHandler } from "../controllers/controller_ai_scrap";

const RouterAI_Chat = Router();

RouterAI_Chat.post("/", chatHandler);

// ✅ ROUTE BARU: Manual refresh data scraping
RouterAI_Chat.post('/refresh-data', refreshDataHandler);

// ✅ ROUTE BARU: Cek status data
RouterAI_Chat.get('/data-status', getDataStatusHandler);

// ✅ ROUTE BARU: Health check
RouterAI_Chat.get('/health', healthCheckHandler);


export default RouterAI_Chat;