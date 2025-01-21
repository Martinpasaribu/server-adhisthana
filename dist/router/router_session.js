"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_session_1 = require("../controller/SessionManage/controller_session");
const SessionRouter = express_1.default.Router();
// semantic meaning
SessionRouter.get("/get-total-price", controller_session_1.SessionController.GetTotalPrice);
SessionRouter.get("/debug-session", controller_session_1.SessionController.CekSessions);
SessionRouter.get("/get-chart", controller_session_1.SessionController.GetChartRoom);
SessionRouter.post("/remove-cart", controller_session_1.SessionController.RemoveCart);
SessionRouter.post("/remove-cart-in-session", controller_session_1.SessionController.DelChartInSession);
SessionRouter.post("/add-to-cart", controller_session_1.SessionController.PostChartRoom);
SessionRouter.post("/del-to-cart", controller_session_1.SessionController.DelChartRoom);
SessionRouter.post("/add-to-night", controller_session_1.SessionController.SetNight);
SessionRouter.post("/add-to-date", controller_session_1.SessionController.setDate);
exports.default = SessionRouter;
