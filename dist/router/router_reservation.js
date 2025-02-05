"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_reservation_1 = require("../controller/Admin/Reservation/controller_reservation");
const VerifyAdmin_1 = require("../middleware/VerifyAdmin");
const ReservationRouter = express_1.default.Router();
// semantic meaning
ReservationRouter.post("/add-transaction", VerifyAdmin_1.verifyAdmin, controller_reservation_1.ReservationController.AddTransaction);
exports.default = ReservationRouter;
