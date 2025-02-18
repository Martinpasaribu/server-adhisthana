"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_reservation_1 = require("../../controller/Admin/Reservation/controller_reservation");
const VerifyAdminId_1 = require("../../middleware/VerifyAdminId");
const ReservationRouter = express_1.default.Router();
// semantic meaning
ReservationRouter.post("/add-transaction", VerifyAdminId_1.verifyAdmin, controller_reservation_1.ReservationController.AddTransaction);
ReservationRouter.get("/get-transaction", VerifyAdminId_1.verifyAdmin, controller_reservation_1.ReservationController.GetAllTransactionReservation);
ReservationRouter.put("/pay-transaction/:TransactionId", VerifyAdminId_1.verifyAdmin, controller_reservation_1.ReservationController.SetPayment);
exports.default = ReservationRouter;
