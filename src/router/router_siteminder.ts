import express, { Request, Response, NextFunction } from "express";
import activityLogger from "../middleware/logActivity";
import { SetMinderController } from "../controller/SiteMinder/controller_minder";

const SiteMinderRouter: express.Router = express.Router();




// semantic meaning

SiteMinderRouter.post("/set-minder", SetMinderController.SetUpPrice);
SiteMinderRouter.get("/get-minder", SetMinderController.GetAllPrice);
SiteMinderRouter.get("/get-minder-year", SetMinderController.GetAllPriceByYear);
SiteMinderRouter.get("/get-available", SetMinderController.GetAllRoomWithAvailable);
SiteMinderRouter.get("/get-unavailable", SetMinderController.GetAllRoomWithUnAvailable);
SiteMinderRouter.get("/get-transaction", SetMinderController.GetAllTransactionFromYearAndMonth);




export default SiteMinderRouter;
