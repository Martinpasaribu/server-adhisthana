import express, { Request, Response, NextFunction } from "express";
import activityLogger from "../middleware/logActivity";
import { SessionController } from "../controller/SessionManage/controller_session";


const SessionRouter: express.Router = express.Router();




// semantic meaning

SessionRouter.get("/get-total-price", SessionController.GetTotalPrice);
SessionRouter.get("/debug-session", SessionController.CekSessions);
SessionRouter.get("/get-chart", SessionController.GetChartRoom);
SessionRouter.post("/remove-session",  SessionController.RemoveSession);
SessionRouter.post("/remove-cart-in-session",  SessionController.DelChartInSession);
SessionRouter.post("/add-to-cart", SessionController.PostChartRoom);
SessionRouter.post("/del-to-cart", SessionController.DelChartRoom);
SessionRouter.post("/add-to-night", SessionController.SetNight);
SessionRouter.post("/add-to-date", SessionController.setDate);



export default SessionRouter;
