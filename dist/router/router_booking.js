"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_booking_1 = require("../controller/Booking/controller_booking");
const VerifyId_1 = require("../middleware/VerifyId");
const VerifyToken_1 = require("../middleware/VerifyToken");
const LogAdmin_1 = require("../middleware/LogAdmin");
const BookingRouter = express_1.default.Router();
// semantic meaning
BookingRouter.post("/addBooking", VerifyId_1.verifyID, VerifyToken_1.verifyToken, controller_booking_1.BookingController.addBooking);
BookingRouter.post("/change-room/:id_transaction", (0, LogAdmin_1.logActivity)("Change Room"), controller_booking_1.BookingController.ChangeRoom);
BookingRouter.post("/get-room-available", controller_booking_1.BookingController.GetDataRoomAvailable);
BookingRouter.get("/get-info/:start/:end", controller_booking_1.BookingController.GetInfoBookingByDate);
// BookingRouter.post("/notification", BookingController.TrxNotif);
// BookingRouter.get("/getOffers", BookingController.getOffers);
// BookingRouter.get("/get", BookingController.getOffers);
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
