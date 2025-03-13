"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_minder_1 = require("../../controller/Admin/SiteMinder/controller_minder");
const LogAdmin_1 = require("../../middleware/LogAdmin");
const SiteMinderRouter = express_1.default.Router();
// semantic meaning
SiteMinderRouter.post("/set-minder", (0, LogAdmin_1.logActivity)("Set-Up Price"), controller_minder_1.SetMinderController.SetUpPrice);
SiteMinderRouter.get("/get-minder", controller_minder_1.SetMinderController.GetAllPrice);
SiteMinderRouter.get("/get-minder-year", controller_minder_1.SetMinderController.GetAllPriceByYear);
SiteMinderRouter.get("/get-available", controller_minder_1.SetMinderController.GetAllRoomWithAvailable);
SiteMinderRouter.get("/get-unavailable", controller_minder_1.SetMinderController.GetAllRoomWithUnAvailable);
SiteMinderRouter.get("/get-transaction-year-month", controller_minder_1.SetMinderController.GetAllTransactionFromYearAndMonth);
SiteMinderRouter.get("/get-all-transaction", controller_minder_1.SetMinderController.GetAllTransaction);
SiteMinderRouter.get("/del-transaction", controller_minder_1.SetMinderController.DeletedTransaction);
SiteMinderRouter.get("/set-price-weekday", controller_minder_1.SetMinderController.SetPriceWeekDay);
SiteMinderRouter.get("/set-price-weekend", controller_minder_1.SetMinderController.SetPriceWeekend);
SiteMinderRouter.get("/set-price-holiday", controller_minder_1.SetMinderController.SetPriceForHolidays);
SiteMinderRouter.put("/edit-date-transaction", controller_minder_1.SetMinderController.UpdateTransactionDate);
SiteMinderRouter.put("/update-stock-room", controller_minder_1.SetMinderController.UpdateStockRooms);
SiteMinderRouter.put("/set-price-custom", (0, LogAdmin_1.logActivity)("Set-Up Price Custom Date"), controller_minder_1.SetMinderController.SetPriceForCustomDate);
exports.default = SiteMinderRouter;
