import express, { Request, Response, NextFunction } from "express";
import { AdminBookingController } from "../../controller/Admin/Booking/controller_Booking";

const AdminBookingRouter: express.Router = express.Router();




// semantic meaning

AdminBookingRouter.get("/get-all-booking", AdminBookingController.GetAllBooking)
AdminBookingRouter.put("/set-verified/:TransactionId", AdminBookingController.SetVerified)
AdminBookingRouter.get("/get-transaction/:TransactionId", AdminBookingController.GetTransactionById)


export default AdminBookingRouter;
