"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const VerifyAdminId_1 = require("../../middleware/VerifyAdminId");
const controller_invoice_1 = require("../../controller/Admin/Invoice/controller_invoice");
const AdminInvoiceRouter = express_1.default.Router();
// semantic meaning
AdminInvoiceRouter.post("/create/booking", controller_invoice_1.InvoiceController.CreateInvoiceBooking);
AdminInvoiceRouter.put("/pay-invoice/:id_Booking/:code", VerifyAdminId_1.verifyAdmin, controller_invoice_1.InvoiceController.PayInvoice);
exports.default = AdminInvoiceRouter;
