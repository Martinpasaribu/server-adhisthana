import express, { Request, Response, NextFunction } from "express";
import { AdminUserController } from "../../controller/Admin/AdminUser/controller_UserAdmin";


const AdminRouter: express.Router = express.Router();




// semantic meaning

AdminRouter.get("/cek-user/:email", AdminUserController.getAdmin)
AdminRouter.get("/cek-me", AdminUserController.CheckMeAdmin)
AdminRouter.post("/register", AdminUserController.RegisterAdmin)


export default AdminRouter;
