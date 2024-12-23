import express, { Request, Response, NextFunction } from "express";
import { BookingController } from "../controller/Booking/controller_booking";

const BookingRouter: express.Router = express.Router();




// semantic meaning

BookingRouter.post("/addBooking", BookingController.addBooking);


BookingRouter.get("/getOffers", BookingController.getOffers);


BookingRouter.get("/get", BookingController.getOffers);


// BookingRouter.get("/getContact", BookingController.getContact)

// BookingRouter.post("/addSubscribe", BookingController.addSubscribe);


export default BookingRouter;
