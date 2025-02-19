import express, { Request, Response, NextFunction } from "express";
import { AdminCustomerController } from "../../controller/Admin/Costumer/controller_customer";

const AdminCustomerRouter: express.Router = express.Router();




// semantic meaning

AdminCustomerRouter.get("/get-message", AdminCustomerController.GetMessage)
AdminCustomerRouter.put("/set-verified/:TransactionId", AdminCustomerController.SetVerified)
AdminCustomerRouter.put("/deleted-message/:MessageId", AdminCustomerController.DeletedMessage)


export default AdminCustomerRouter;
