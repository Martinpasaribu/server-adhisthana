import express, { Request, Response, NextFunction } from "express";
import { logActivity } from "../../middleware/LogAdmin";
import { verifyAdmin } from "../../middleware/VerifyAdminId";
import { AdminDishController } from "../../controller/Admin/Dish/controller_Dish";

const AdminDishRouter: express.Router = express.Router();


// semantic meaning

AdminDishRouter.post("/add-dish", AdminDishController.AddMenu)
AdminDishRouter.get("/get-dish", verifyAdmin,  AdminDishController.GetDish)
AdminDishRouter.delete("/del-dish-booking/:id_booking/:id_dish", verifyAdmin,  AdminDishController.DeletedDishBooking)


export default AdminDishRouter;
