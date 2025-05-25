import express, { Request, Response, NextFunction } from "express";
import { SetMinderController } from "../../controller/Admin/SiteMinder/controller_minder";
import { logActivity } from "../../middleware/LogAdmin";
import { verifyAdmin } from "../../middleware/VerifyAdminId";

const SiteMinderRouter: express.Router = express.Router();




// semantic meaning

SiteMinderRouter.post("/set-minder", verifyAdmin,logActivity("Set-Up Price"), SetMinderController.SetUpPrice);
SiteMinderRouter.get("/get-minder", SetMinderController.GetAllPrice);
SiteMinderRouter.get("/get-minder-year", SetMinderController.GetAllPriceByYear);
SiteMinderRouter.get("/get-available", SetMinderController.GetAllRoomWithAvailable);
SiteMinderRouter.get("/get-unavailable", SetMinderController.GetAllRoomWithUnAvailable);
SiteMinderRouter.get("/get-transaction-year-month", SetMinderController.GetAllTransactionFromYearAndMonth);
SiteMinderRouter.get("/get-all-transaction", SetMinderController.GetAllTransaction);
SiteMinderRouter.get("/del-transaction", verifyAdmin, logActivity("Refund Booking"), SetMinderController.DeletedTransaction);
SiteMinderRouter.get("/del-booking", verifyAdmin, logActivity("Deleted Booking"), SetMinderController.DeletedBooking);
SiteMinderRouter.get("/set-price-weekday", verifyAdmin, SetMinderController.SetPriceWeekDay);
SiteMinderRouter.get("/set-price-weekend", verifyAdmin, SetMinderController.SetPriceWeekend);
SiteMinderRouter.get("/set-price-holiday", verifyAdmin, SetMinderController.SetPriceForHolidays);
SiteMinderRouter.put("/edit-date-transaction", verifyAdmin, logActivity("Refund Date Booking"), SetMinderController.UpdateTransactionDate);
SiteMinderRouter.put("/update-stock-room", verifyAdmin, logActivity("Update Stock Romm"), SetMinderController.UpdateStockRooms);
SiteMinderRouter.put("/chancel-reschedule", verifyAdmin, logActivity("Chancel reschedule "), SetMinderController.ChancelReschedule);
SiteMinderRouter.get("/del-reschedule/:IdBooking", verifyAdmin, logActivity("Chancel Reschedule"), SetMinderController.ChancelReschedule);
SiteMinderRouter.get("/get-list-reschedule", verifyAdmin, SetMinderController.GetListReschedule);
SiteMinderRouter.put("/set-price-custom", verifyAdmin, logActivity("Set-Up Price Custom Date"), SetMinderController.SetPriceForCustomDate);




export default SiteMinderRouter;
