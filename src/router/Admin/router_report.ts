import express, { Request, Response, NextFunction } from "express";
import { verifyAdmin } from "../../middleware/VerifyAdminId";
import { logActivity } from "../../middleware/LogAdmin";
import { ReportController } from "../../controller/Admin/Report/controller_Report";


const ReportRouter: express.Router = express.Router();




// semantic meaning

ReportRouter.post("/add-report/:date",  logActivity("Create Report"), ReportController.SaveReport);
ReportRouter.get("/room_status/today", ReportController.GetRoomStatusToday); 
ReportRouter.get("/get/booking", ReportController.GetReportBooking); 
ReportRouter.get("/get/total_price/saved", ReportController.UpdatePriceTotalByDate); 
ReportRouter.get("/profit-month", ReportController.GetProfitOnMonth); 
ReportRouter.get("/get/booking/date/:code/:start/:end/:code2", ReportController.GetReportBookingByDate); 
ReportRouter.get("/get-reportby-day/:date", ReportController.GetReportByDate); 
ReportRouter.get("/get/next_prev/:date", ReportController.GetReportByPrevNext); 
ReportRouter.get("/daily-report", ReportController.DailyReport); 
ReportRouter.post("/daily-report", ReportController.CreateDailyReportFromAdmin); 
ReportRouter.put("/deleted-daily-report/:id", verifyAdmin , logActivity("Deleted Daily report"), ReportController.DeletedDailyReportFromAdmin)


export default ReportRouter;
 