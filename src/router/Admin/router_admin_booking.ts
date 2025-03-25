import express, { Request, Response, NextFunction } from "express";
import { AdminBookingController } from "../../controller/Admin/Booking/controller_Booking";
import { logActivity } from "../../middleware/LogAdmin";


const AdminBookingRouter: express.Router = express.Router();




// semantic meaning

AdminBookingRouter.get("/get-all-booking", AdminBookingController.GetAllBooking)
AdminBookingRouter.put("/set-verified/:TransactionId", logActivity("Set Verified CheckIn") , AdminBookingController.SetVerified)  
AdminBookingRouter.put("/set-checkout/:TransactionId", logActivity("Set Verified CheckOut") , AdminBookingController.SetCheckOut)  

AdminBookingRouter.get("/get-transaction/:TransactionId", AdminBookingController.GetTransactionById)





export default AdminBookingRouter;
