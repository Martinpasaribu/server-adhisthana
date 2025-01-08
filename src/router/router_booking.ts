import express, { Request, Response, NextFunction } from "express";
import { BookingController } from "../controller/Booking/controller_booking";
import activityLogger from "../middleware/logActivity";

const BookingRouter: express.Router = express.Router();




// semantic meaning

BookingRouter.get("/getOffers", BookingController.getOffers);
BookingRouter.get("/get", BookingController.getOffers);
BookingRouter.get("/get-total-price", BookingController.GetTotalPrice);
BookingRouter.get("/debug-session", BookingController.CekSessions);
BookingRouter.get("/get-chart", BookingController.GetChartRoom);

BookingRouter.post("/remove-cart",  BookingController.RemoveCart);
BookingRouter.post("/addBooking", BookingController.addBooking);
BookingRouter.post("/add-to-cart", BookingController.PostChartRoom);
BookingRouter.post("/del-to-cart", BookingController.DelChartRoom);
BookingRouter.post("/notification", BookingController.TrxNotif);
BookingRouter.get("/get-transaction/:transaction_id", BookingController.getTransactionsById);






// BookingRouter.get("/getContact", BookingController.getContact)

// BookingRouter.post("/addSubscribe", BookingController.addSubscribe);


export default BookingRouter;
