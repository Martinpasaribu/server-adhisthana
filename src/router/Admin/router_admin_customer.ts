import express, { Request, Response, NextFunction } from "express";
import { AdminCustomerController } from "../../controller/Admin/Costumer/controller_customer";
import { logActivity } from "../../middleware/LogAdmin";
import { verifyAdmin } from "../../middleware/VerifyAdminId";

const AdminCustomerRouter: express.Router = express.Router();




// semantic meaning

AdminCustomerRouter.get("/get-message", AdminCustomerController.GetMessage)
AdminCustomerRouter.get("/get-user", AdminCustomerController.GetUser)
AdminCustomerRouter.put("/set-verified/:TransactionId", AdminCustomerController.SetVerified)
AdminCustomerRouter.put("/deleted/:UserId", verifyAdmin , logActivity("Deleted User"), AdminCustomerController.DeletedUser)
AdminCustomerRouter.put("/set-block/:id", verifyAdmin , logActivity("Block Account User"), AdminCustomerController.SetBlock)
AdminCustomerRouter.put("/set-active/:id", verifyAdmin , logActivity("Active Account User"), AdminCustomerController.SetActive)
AdminCustomerRouter.put("/deleted-message/:MessageId", verifyAdmin , logActivity("Deleted Message") , AdminCustomerController.DeletedMessage)
AdminCustomerRouter.patch("/update/:id", verifyAdmin , logActivity("Update Customer") , AdminCustomerController.UpdateCustomer)
AdminCustomerRouter.get("/get/:id", AdminCustomerController.GetCustomerByParams)


export default AdminCustomerRouter;
