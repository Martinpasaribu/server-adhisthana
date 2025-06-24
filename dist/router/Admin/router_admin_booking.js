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
AdminBookingRouter.put("/set-verified/:TransactionId", (0, LogAdmin_1.logActivity)("Set Verified CheckIn"), controller_Booking_1.AdminBookingController.SetVerified);
AdminBookingRouter.put("/set-checkout/:TransactionId", (0, LogAdmin_1.logActivity)("Set Verified CheckOut"), controller_Booking_1.AdminBookingController.SetCheckOut);
AdminBookingRouter.patch("/set-oder-dish/:id", (0, LogAdmin_1.logActivity)("Set Oder Dish"), controller_Booking_1.AdminBookingController.SetOrderDish);
AdminBookingRouter.delete("/delete/invoice/:id_Booking/:id_Invoice", (0, LogAdmin_1.logActivity)("Set Oder Dish"), controller_Booking_1.AdminBookingController.DeletedInvoiceBooking);
AdminBookingRouter.get("/get-transaction/:TransactionId", controller_Booking_1.AdminBookingController.GetTransactionById);
AdminBookingRouter.get("/get-booking/:id", controller_Booking_1.AdminBookingController.GetBookingById);
AdminBookingRouter.get("/count-booking", controller_Booking_1.AdminBookingController.CountBooking);
exports.default = AdminBookingRouter;
