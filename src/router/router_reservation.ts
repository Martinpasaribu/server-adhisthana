import express, { Request, Response, NextFunction } from "express";
import activityLogger from "../middleware/logActivity";
import { ReservationController } from "../controller/Admin/Reservation/controller_reservation";
import { verifyAdmin } from "../middleware/VerifyAdmin";

const ReservationRouter: express.Router = express.Router();




// semantic meaning

ReservationRouter.post("/add-transaction", verifyAdmin, ReservationController.AddTransaction);




export default ReservationRouter;
