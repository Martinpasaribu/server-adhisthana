"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const LogAdmin_1 = require("../../middleware/LogAdmin");
const controller_Report_1 = require("../../controller/Admin/Report/controller_Report");
const ReportRouter = express_1.default.Router();
// semantic meaning
ReportRouter.post("/add-report/:date", (0, LogAdmin_1.logActivity)("Create Report"), controller_Report_1.ReportController.SaveReport);
ReportRouter.get("/room_status/today", controller_Report_1.ReportController.GetRoomStatusToday);
ReportRouter.get("/get/booking", controller_Report_1.ReportController.GetReportBooking);
ReportRouter.get("/get/total_price/saved", controller_Report_1.ReportController.UpdatePriceTotalByDate);
ReportRouter.get("/profit-month", controller_Report_1.ReportController.GetProfitOnMonth);
ReportRouter.get("/get/booking/date/:code/:start/:end/:code2", controller_Report_1.ReportController.GetReportBookingByDate);
ReportRouter.get("/get-reportby-day/:date", controller_Report_1.ReportController.GetReportByDate);
ReportRouter.get("/get/next_prev/:date", controller_Report_1.ReportController.GetReportByPrevNext);
exports.default = ReportRouter;
