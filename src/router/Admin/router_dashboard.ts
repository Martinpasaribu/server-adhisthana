import express, { Request, Response, NextFunction } from "express";
import { DashboardController } from "../../controller/Admin/Dashboard/controller_Dashboard";
import { verifyAdmin } from "../../middleware/VerifyAdminId";
import { ReservationController } from "../../controller/Admin/Reservation/controller_reservation";

const DashboardRouter: express.Router = express.Router();




// semantic meaning

DashboardRouter.get("/get-total-room", verifyAdmin , DashboardController.TotalProduct);
DashboardRouter.get("/get-total-user", verifyAdmin , DashboardController.TotalUser);
DashboardRouter.get("/get-total-user-admin", verifyAdmin , DashboardController.TotalUserAdmin);
DashboardRouter.get("/get-cart-transaction", verifyAdmin, DashboardController.ChartTransaction); 
DashboardRouter.get("/get-most-purchased", DashboardController.MostPurchased); 
DashboardRouter.get("/get-modal-room-available", DashboardController.ModalRoomAvailable); 
DashboardRouter.post("/room-condition", DashboardController.SaveRoomCondition); 
DashboardRouter.get("/room-condition", DashboardController.GetRoomConditions); 
DashboardRouter.get("/info-dashboard-one", DashboardController.InfoDashboardOne); 

DashboardRouter.put("/pay-transaction/:TransactionId", verifyAdmin , ReservationController.SetPayment); 




export default DashboardRouter;
