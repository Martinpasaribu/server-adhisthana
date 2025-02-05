"use strict";
exports.__esModule = true;
var express_1 = require("express");
var controller_reservation_1 = require("../controller/Admin/Reservation/controller_reservation");
var VerifyAdmin_1 = require("../middleware/VerifyAdmin");
var ReservationRouter = express_1["default"].Router();
// semantic meaning
ReservationRouter.post("/add-transaction", VerifyAdmin_1.verifyAdmin, controller_reservation_1.ReservationController.AddTransaction);
exports["default"] = ReservationRouter;
