"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_short_1 = require("../controller/ShortAvailable/controller_short");
const ContactRouter = express_1.default.Router();
// semantic meaning
ContactRouter.get("/getShortVila", controller_short_1.ShortAvailableController.getShortVila);
exports.default = ContactRouter;
