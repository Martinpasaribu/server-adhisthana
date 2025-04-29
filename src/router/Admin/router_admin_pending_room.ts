import express, { Request, Response, NextFunction } from "express";
import { logActivity } from "../../middleware/LogAdmin";
import { verifyAdmin } from "../../middleware/VerifyAdminId";
import { AdminDishController } from "../../controller/Admin/Dish/controller_Dish";
import { PendingRoomController } from "../../controller/PendingRoom/Controller_PendingRoom";

const AdminRoomPending: express.Router = express.Router();


// semantic meaning

AdminRoomPending.get("/get-data", verifyAdmin,  PendingRoomController.GetData)


export default AdminRoomPending;
