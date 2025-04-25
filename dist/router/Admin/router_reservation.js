"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_reservation_1 = require("../../controller/Admin/Reservation/controller_reservation");
const VerifyAdminId_1 = require("../../middleware/VerifyAdminId");
const LogAdmin_1 = require("../../middleware/LogAdmin");
const ReservationRouter = express_1.default.Router();
// semantic meaning
ReservationRouter.post("/add-reservation", VerifyAdminId_1.verifyAdmin, (0, LogAdmin_1.logActivity)("Create Reservation"), controller_reservation_1.ReservationController.AddTransaction);
ReservationRouter.get("/get-reservation", VerifyAdminId_1.verifyAdmin, controller_reservation_1.ReservationController.GetAllTransactionReservation);
ReservationRouter.put("/pay-transaction/:TransactionId/:code", VerifyAdminId_1.verifyAdmin, (0, LogAdmin_1.logActivity)("Transaction PAID"), controller_reservation_1.ReservationController.SetPayment);
exports.default = ReservationRouter;
