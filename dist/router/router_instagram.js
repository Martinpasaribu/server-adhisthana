"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_instagram_1 = require("../controller/Instagram/controller_instagram");
const InstagramRouter = express_1.default.Router();
// semantic meaning
// Add Room
InstagramRouter.get("/getdata", controller_instagram_1.InstagramController.getData);
InstagramRouter.get("/update", controller_instagram_1.InstagramController.update);
exports.default = InstagramRouter;
