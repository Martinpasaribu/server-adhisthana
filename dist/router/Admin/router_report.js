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
ReportRouter.get("/get-report-today", controller_Report_1.ReportController.GetTodayReport);
ReportRouter.get("/get/booking", controller_Report_1.ReportController.GetReportBooking);
ReportRouter.get("/get/booking/date/:code/:start/:end", controller_Report_1.ReportController.GetReportBookingByDate);
ReportRouter.get("/get-reportby-day/:date", controller_Report_1.ReportController.GetReportByDate);
exports.default = ReportRouter;
