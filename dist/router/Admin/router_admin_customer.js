"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_customer_1 = require("../../controller/Admin/Costumer/controller_customer");
const LogAdmin_1 = require("../../middleware/LogAdmin");
const VerifyAdminId_1 = require("../../middleware/VerifyAdminId");
const AdminCustomerRouter = express_1.default.Router();
// semantic meaning
AdminCustomerRouter.get("/get-message", controller_customer_1.AdminCustomerController.GetMessage);
AdminCustomerRouter.get("/get-user", controller_customer_1.AdminCustomerController.GetUser);
AdminCustomerRouter.put("/set-verified/:TransactionId", controller_customer_1.AdminCustomerController.SetVerified);
AdminCustomerRouter.put("/deleted-message/:MessageId", VerifyAdminId_1.verifyAdmin, (0, LogAdmin_1.logActivity)("Deleted Message"), controller_customer_1.AdminCustomerController.DeletedMessage);
AdminCustomerRouter.patch("/update/:id", VerifyAdminId_1.verifyAdmin, (0, LogAdmin_1.logActivity)("Update Customer"), controller_customer_1.AdminCustomerController.UpdateCustomer);
AdminCustomerRouter.get("/get/:id", controller_customer_1.AdminCustomerController.GetCustomerByParams);
exports.default = AdminCustomerRouter;
