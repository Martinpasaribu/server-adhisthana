"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_Booking_1 = require("../../controller/Admin/Booking/controller_Booking");
const LogAdmin_1 = require("../../middleware/LogAdmin");
const AdminBookingRouter = express_1.default.Router();
// semantic meaning
AdminBookingRouter.get("/get-all-booking", controller_Booking_1.AdminBookingController.GetAllBooking);
AdminBookingRouter.put("/set-verified/:TransactionId", (0, LogAdmin_1.logActivity)("Set Verified chckin"), controller_Booking_1.AdminBookingController.SetVerified);
AdminBookingRouter.get("/get-transaction/:TransactionId", controller_Booking_1.AdminBookingController.GetTransactionById);
exports.default = AdminBookingRouter;
