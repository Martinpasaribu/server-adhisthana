import express, { Request, Response, NextFunction } from "express";
import { logActivity } from "../../middleware/LogAdmin";
import { verifyAdmin } from "../../middleware/VerifyAdminId";
import { AdminDishController } from "../../controller/Admin/Dish/controller_Dish";
import { InvoiceController } from "../../controller/Admin/Invoice/controller_invoice";

const AdminInvoiceRouter: express.Router = express.Router();


// semantic meaning

AdminInvoiceRouter.post("/create/booking",  InvoiceController.CreateInvoiceBooking);
AdminInvoiceRouter.put("/pay-invoice/:id_Booking/:code", verifyAdmin,  InvoiceController.PayInvoice);


export default AdminInvoiceRouter;
