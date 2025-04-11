import express, { Request, Response, NextFunction } from "express";
import { AdminUserController } from "../../controller/Admin/AdminUser/controller_UserAdmin";
import { verifyAdmin } from "../../middleware/VerifyAdminId";
import { logActivity } from "../../middleware/LogAdmin";


const AdminRouter: express.Router = express.Router();




// semantic meaning

AdminRouter.get("/cek-user/:email", AdminUserController.getAdmin)
AdminRouter.get("/get-admin-user", verifyAdmin, logActivity("Block Account User Admin"), AdminUserController.GetAdminUser)

AdminRouter.put("/set-block/:id", AdminUserController.SetBlock)
AdminRouter.put("/set-active/:id", AdminUserController.SetActive)
AdminRouter.put("/deleted/:UserId", verifyAdmin , logActivity("Deleted User Admin"), AdminUserController.DeletedUser)

AdminRouter.get("/cek-me", AdminUserController.CheckMeAdmin)
AdminRouter.post("/register", AdminUserController.RegisterAdmin)

export default AdminRouter;
