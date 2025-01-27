"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_transaction_1 = require("../controller/Transaction/controller_transaction");
const VerifyId_1 = require("../middleware/VerifyId");
const VerifyToken_1 = require("../middleware/VerifyToken");
const TransactionRouter = express_1.default.Router();
// semantic meaning
TransactionRouter.get("/get-transaction/:transaction_id", controller_transaction_1.TransactionController.getTransactionsById);
TransactionRouter.get("/get-transaction-user/:user", VerifyId_1.verifyID, VerifyToken_1.verifyToken, controller_transaction_1.TransactionController.getTransactionsByUser);
TransactionRouter.get("/get-transaction-user", VerifyId_1.verifyID, VerifyToken_1.verifyToken, controller_transaction_1.TransactionController.getTransactionsByMember);
TransactionRouter.get("/update-status-failed/:order_id", controller_transaction_1.TransactionController.updateTransactionFailed);
TransactionRouter.post("/notification", controller_transaction_1.TransactionController.TrxNotif);
// TransactionRouter.get("/getContact", BookingController.getContact)
// TransactionRouter.post("/addSubscribe", BookingController.addSubscribe);
exports.default = TransactionRouter;
