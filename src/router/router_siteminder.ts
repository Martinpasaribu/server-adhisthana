import express, { Request, Response, NextFunction } from "express";
import activityLogger from "../middleware/logActivity";
import { SetMinderController } from "../controller/Admin/SiteMinder/controller_minder";

const SiteMinderRouter: express.Router = express.Router();




// semantic meaning

SiteMinderRouter.post("/set-minder", SetMinderController.SetUpPrice);
SiteMinderRouter.get("/get-minder", SetMinderController.GetAllPrice);
SiteMinderRouter.get("/get-minder-year", SetMinderController.GetAllPriceByYear);
SiteMinderRouter.get("/get-available", SetMinderController.GetAllRoomWithAvailable);
SiteMinderRouter.get("/get-unavailable", SetMinderController.GetAllRoomWithUnAvailable);
SiteMinderRouter.get("/get-transaction", SetMinderController.GetAllTransactionFromYearAndMonth);
SiteMinderRouter.get("/del-transaction", SetMinderController.DeletedTransaction);
SiteMinderRouter.get("/set-price-weekday", SetMinderController.SetPriceWeekDay);
SiteMinderRouter.get("/set-price-weekend", SetMinderController.SetPriceWeekend);
SiteMinderRouter.get("/set-price-holiday", SetMinderController.SetPriceForHolidays);




export default SiteMinderRouter;
