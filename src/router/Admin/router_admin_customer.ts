import express, { Request, Response, NextFunction } from "express";
import { AdminCustomerController } from "../../controller/Admin/Costumer/controller_customer";
import { logActivity } from "../../middleware/LogAdmin";
import { verifyAdmin } from "../../middleware/VerifyAdminId";

const AdminCustomerRouter: express.Router = express.Router();




// semantic meaning

AdminCustomerRouter.get("/get-message", AdminCustomerController.GetMessage)
AdminCustomerRouter.get("/get-user", AdminCustomerController.GetUser)
AdminCustomerRouter.put("/set-verified/:TransactionId", AdminCustomerController.SetVerified)
AdminCustomerRouter.put("/deleted-message/:MessageId", verifyAdmin , logActivity("Deleted Message") , AdminCustomerController.DeletedMessage)
AdminCustomerRouter.patch("/update/:id", verifyAdmin , logActivity("Update Customer") , AdminCustomerController.UpdateCustomer)
AdminCustomerRouter.get("/get/:id", logActivity("Get Customer") , AdminCustomerController.GetCustomerByParams)


export default AdminCustomerRouter;
