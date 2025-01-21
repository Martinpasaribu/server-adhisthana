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
BookingRouter.post("/addBooking", controller_booking_1.BookingController.addBooking);
BookingRouter.post("/notification", controller_booking_1.BookingController.TrxNotif);
// BookingRouter.get("/get-chart", BookingController.GetChartRoom);
// BookingRouter.get("/get-total-price", BookingController.GetTotalPrice);
// BookingRouter.get("/debug-session", BookingController.CekSessions);
// BookingRouter.post("/remove-cart",  BookingController.RemoveCart);
// BookingRouter.post("/remove-cart-in-session",  BookingController.DelChartInSession);
// BookingRouter.post("/add-to-cart", BookingController.PostChartRoom);
// BookingRouter.post("/del-to-cart", BookingController.DelChartRoom);
// BookingRouter.post("/add-to-night", BookingController.SetNight);
// BookingRouter.get("/get-transaction/:transaction_id", BookingController.getTransactionsById);
// BookingRouter.get("/getContact", BookingController.getContact)
// BookingRouter.post("/addSubscribe", BookingController.addSubscribe);
exports.default = BookingRouter;
