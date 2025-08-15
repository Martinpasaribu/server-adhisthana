import express, { Request, Response, NextFunction } from "express";
import { BookingController } from "../controller/Booking/controller_booking";
import activityLogger from "../middleware/LogAPI";
import { verifyID } from "../middleware/VerifyId";
import { verifyToken } from "../middleware/VerifyToken";
import { logActivity } from "../middleware/LogAdmin";

const BookingRouter: express.Router = express.Router();


// semantic meaning

    BookingRouter.post("/addBooking",verifyID, verifyToken, BookingController.addBooking);
    BookingRouter.post("/change-room/:id_transaction",logActivity("Change Room"), BookingController.ChangeRoom);
    BookingRouter.post("/get-room-available", BookingController.GetDataRoomAvailable);
    BookingRouter.get("/get-info/:start/:end", BookingController.GetInfoBookingByDate);

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


export default BookingRouter;
