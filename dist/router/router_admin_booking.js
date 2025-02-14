"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_Booking_1 = require("../controller/Admin/Booking/controller_Booking");
const AdminBookingRouter = express_1.default.Router();
// semantic meaning
AdminBookingRouter.get("/get-all-booking", controller_Booking_1.AdminBookingController.GetAllBooking);
AdminBookingRouter.put("/set-verified/:TransactionId", controller_Booking_1.AdminBookingController.SetVerified);
exports.default = AdminBookingRouter;
