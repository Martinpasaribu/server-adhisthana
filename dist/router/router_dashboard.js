"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_reservation_1 = require("../controller/Admin/Reservation/controller_reservation");
const VerifyAdminId_1 = require("../middleware/VerifyAdminId");
const controllDashboard_1 = require("../controller/Admin/Dashboard/controllDashboard");
const DashboardRouter = express_1.default.Router();
// semantic meaning
DashboardRouter.get("/get-total-room", VerifyAdminId_1.verifyAdmin, controllDashboard_1.DashboardController.TotalProduct);
DashboardRouter.get("/get-total-user", VerifyAdminId_1.verifyAdmin, controllDashboard_1.DashboardController.TotalUser);
DashboardRouter.get("/get-cart-transaction", VerifyAdminId_1.verifyAdmin, controllDashboard_1.DashboardController.ChartTransaction);
DashboardRouter.get("/get-most-purchased", controllDashboard_1.DashboardController.MostPurchased);
DashboardRouter.put("/pay-transaction/:TransactionId", VerifyAdminId_1.verifyAdmin, controller_reservation_1.ReservationController.SetPayment);
exports.default = DashboardRouter;
