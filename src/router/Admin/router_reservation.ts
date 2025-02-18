import express, { Request, Response, NextFunction } from "express";
import { ReservationController } from "../../controller/Admin/Reservation/controller_reservation";
import { verifyAdmin } from "../../middleware/VerifyAdminId";

const ReservationRouter: express.Router = express.Router();




// semantic meaning

ReservationRouter.post("/add-transaction", verifyAdmin, ReservationController.AddTransaction);
ReservationRouter.get("/get-transaction",verifyAdmin , ReservationController.GetAllTransactionReservation); 
ReservationRouter.put("/pay-transaction/:TransactionId", verifyAdmin , ReservationController.SetPayment); 




export default ReservationRouter;
