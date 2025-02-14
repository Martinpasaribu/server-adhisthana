import express, { Request, Response, NextFunction } from "express";
import { AdminUserController } from "../controller/Admin/AdminUser/controller_UserAdmin";


const AdminRouter: express.Router = express.Router();




// semantic meaning

AdminRouter.get("/cek-user/:email", AdminUserController.getAdmin)
AdminRouter.post("/register-admin", AdminUserController.RegisterAdmin)


export default AdminRouter;
