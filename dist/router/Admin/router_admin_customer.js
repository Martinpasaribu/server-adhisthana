"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_customer_1 = require("../../controller/Admin/Costumer/controller_customer");
const AdminCustomerRouter = express_1.default.Router();
// semantic meaning
AdminCustomerRouter.get("/get-message", controller_customer_1.AdminCustomerController.GetMessage);
AdminCustomerRouter.put("/set-verified/:TransactionId", controller_customer_1.AdminCustomerController.SetVerified);
AdminCustomerRouter.put("/deleted-message/:MessageId", controller_customer_1.AdminCustomerController.DeletedMessage);
exports.default = AdminCustomerRouter;
