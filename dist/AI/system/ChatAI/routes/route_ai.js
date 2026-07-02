"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_ai_1 = require("../controllers/controller_ai");
const controller_ai_scrap_1 = require("../controllers/controller_ai_scrap");
// import { chatHandler, getDataStatusHandler, healthCheckHandler, refreshDataHandler } from "../controllers/controller_ai_scrap";
const RouterAI_Chat = (0, express_1.Router)();
RouterAI_Chat.post("/", controller_ai_1.chatHandler);
// ✅ ROUTE BARU: Manual refresh data scraping
RouterAI_Chat.post('/refresh-data', controller_ai_scrap_1.refreshDataHandler);
// ✅ ROUTE BARU: Cek status data
RouterAI_Chat.get('/data-status', controller_ai_scrap_1.getDataStatusHandler);
// ✅ ROUTE BARU: Health check
RouterAI_Chat.get('/health', controller_ai_scrap_1.healthCheckHandler);
exports.default = RouterAI_Chat;
