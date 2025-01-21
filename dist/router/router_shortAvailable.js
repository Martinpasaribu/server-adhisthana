"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_short_1 = require("../controller/ShortAvailable/controller_short");
const ShortAvailableRouter = express_1.default.Router();
// semantic meaning
ShortAvailableRouter.get("/getShortVila", controller_short_1.ShortAvailableController.getShortVila);
ShortAvailableRouter.post("/get-short-available", controller_short_1.ShortAvailableController.getAvailableRooms);
ShortAvailableRouter.get("/get-short-available", controller_short_1.ShortAvailableController.getAvailableRooms);
ShortAvailableRouter.post("/get-available-set-minder", controller_short_1.ShortAvailableController.getAvailableRoomsWithSiteMinder);
exports.default = ShortAvailableRouter;
