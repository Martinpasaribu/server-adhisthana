"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_booking_1 = require("../controller/Booking/controller_booking");
const BookingRouter = express_1.default.Router();
// semantic meaning
BookingRouter.get("/getOffers", controller_booking_1.BookingController.getOffers);
BookingRouter.get("/get", controller_booking_1.BookingController.getOffers);
BookingRouter.get("/get-total-price", controller_booking_1.BookingController.GetTotalPrice);
BookingRouter.get("/debug-session", controller_booking_1.BookingController.CekSessions);
BookingRouter.get("/get-chart", controller_booking_1.BookingController.GetChartRoom);
BookingRouter.post("/remove-cart", controller_booking_1.BookingController.RemoveCart);
BookingRouter.post("/addBooking", controller_booking_1.BookingController.addBooking);
BookingRouter.post("/add-to-cart", controller_booking_1.BookingController.PostChartRoom);
BookingRouter.post("/del-to-cart", controller_booking_1.BookingController.DelChartRoom);
BookingRouter.post("/notification", controller_booking_1.BookingController.TrxNotif);
// BookingRouter.get("/get-transaction/:transaction_id", BookingController.getTransactionsById);
// BookingRouter.get("/getContact", BookingController.getContact)
// BookingRouter.post("/addSubscribe", BookingController.addSubscribe);
exports.default = BookingRouter;
