import express, { Request, Response, NextFunction } from "express";
import activityLogger from "../middleware/logActivity";
import { ReservationController } from "../controller/Admin/Reservation/controller_reservation";
import { verifyAdmin } from "../middleware/VerifyAdminId";
import { DashboardController } from "../controller/Admin/Dashboard/controllDashboard";

const DashboardRouter: express.Router = express.Router();




// semantic meaning

DashboardRouter.get("/get-total-room", verifyAdmin , DashboardController.TotalProduct);
DashboardRouter.get("/get-total-user", verifyAdmin , DashboardController.TotalUser);
DashboardRouter.get("/get-cart-transaction", verifyAdmin, DashboardController.ChartTransaction); 
DashboardRouter.get("/get-most-purchased", DashboardController.MostPurchased); 

DashboardRouter.put("/pay-transaction/:TransactionId", verifyAdmin , ReservationController.SetPayment); 




export default DashboardRouter;
