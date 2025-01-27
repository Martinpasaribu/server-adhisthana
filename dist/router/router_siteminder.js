"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_minder_1 = require("../controller/Admin/SiteMinder/controller_minder");
const SiteMinderRouter = express_1.default.Router();
// semantic meaning
SiteMinderRouter.post("/set-minder", controller_minder_1.SetMinderController.SetUpPrice);
SiteMinderRouter.get("/get-minder", controller_minder_1.SetMinderController.GetAllPrice);
SiteMinderRouter.get("/get-minder-year", controller_minder_1.SetMinderController.GetAllPriceByYear);
SiteMinderRouter.get("/get-available", controller_minder_1.SetMinderController.GetAllRoomWithAvailable);
SiteMinderRouter.get("/get-unavailable", controller_minder_1.SetMinderController.GetAllRoomWithUnAvailable);
SiteMinderRouter.get("/get-transaction", controller_minder_1.SetMinderController.GetAllTransactionFromYearAndMonth);
SiteMinderRouter.get("/del-transaction", controller_minder_1.SetMinderController.DeletedTransaction);
SiteMinderRouter.get("/set-price-weekday", controller_minder_1.SetMinderController.SetPriceWeekDay);
SiteMinderRouter.get("/set-price-weekend", controller_minder_1.SetMinderController.SetPriceWeekend);
SiteMinderRouter.get("/set-price-holiday", controller_minder_1.SetMinderController.SetPriceForHolidays);
exports.default = SiteMinderRouter;
