import express, { Request, Response, NextFunction } from "express";
import activityLogger from "../middleware/logActivity";
import { SetMinderController } from "../controller/SiteMinder/controller_minder";

const SiteMinderRouter: express.Router = express.Router();




// semantic meaning

SiteMinderRouter.post("/set-minder", SetMinderController.SetUpPrice);
SiteMinderRouter.get("/get-minder", SetMinderController.GetAllPrice);
SiteMinderRouter.get("/get-minder-year", SetMinderController.GetAllPriceByYear);
SiteMinderRouter.get("/get-room", SetMinderController.GetAllRoom);




export default SiteMinderRouter;
