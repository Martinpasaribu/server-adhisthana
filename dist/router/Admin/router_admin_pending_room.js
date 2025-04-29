"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const VerifyAdminId_1 = require("../../middleware/VerifyAdminId");
const Controller_PendingRoom_1 = require("../../controller/PendingRoom/Controller_PendingRoom");
const AdminRoomPending = express_1.default.Router();
// semantic meaning
AdminRoomPending.get("/get-data", VerifyAdminId_1.verifyAdmin, Controller_PendingRoom_1.PendingRoomController.GetData);
exports.default = AdminRoomPending;
