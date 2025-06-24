import express, { Request, Response, NextFunction } from "express";
import { ReservationController } from "../../controller/Admin/Reservation/controller_reservation";
import { verifyAdmin } from "../../middleware/VerifyAdminId";
import { logActivity } from "../../middleware/LogAdmin";


const ReservationRouter: express.Router = express.Router();




// semantic meaning

ReservationRouter.post("/add-reservation",  verifyAdmin, logActivity("Create Reservation"), ReservationController.AddTransaction);
ReservationRouter.post("/create-schedule",  verifyAdmin, logActivity("Create Reservation Reschedule"), ReservationController.AddTransactionToReschedule);
ReservationRouter.get("/get-reservation",verifyAdmin , ReservationController.GetAllTransactionReservation); 
ReservationRouter.get("/count-reservation", ReservationController.CountReservation); 
ReservationRouter.put("/pay-transaction/:TransactionId/:code", verifyAdmin , logActivity("Transaction PAID"), ReservationController.SetPayment); 




export default ReservationRouter;
