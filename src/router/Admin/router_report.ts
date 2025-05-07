import express, { Request, Response, NextFunction } from "express";
import { verifyAdmin } from "../../middleware/VerifyAdminId";
import { logActivity } from "../../middleware/LogAdmin";
import { ReportController } from "../../controller/Admin/Report/controller_Report";


const ReportRouter: express.Router = express.Router();




// semantic meaning

ReportRouter.post("/add-report/:date",  logActivity("Create Report"), ReportController.SaveReport);
ReportRouter.get("/get-report-today", ReportController.GetTodayReport); 
ReportRouter.get("/get/booking", ReportController.GetReportBooking); 
ReportRouter.get("/get/booking/date/:code/:start/:end", ReportController.GetReportBookingByDate); 
ReportRouter.get("/get-reportby-day/:date", ReportController.GetReportByDate); 


export default ReportRouter;
 