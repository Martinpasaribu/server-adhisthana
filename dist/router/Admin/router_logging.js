"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const VerifyAdminId_1 = require("../../middleware/VerifyAdminId");
const controller_Logging_1 = require("../../controller/Admin/Logging/controller_Logging");
const LoggingRouter = express_1.default.Router();
// semantic meaning
LoggingRouter.get("/get-logging", VerifyAdminId_1.verifyAdmin, controller_Logging_1.LoggingController.GetAllLogging);
LoggingRouter.get("/get-pagination", VerifyAdminId_1.verifyAdmin, controller_Logging_1.LoggingController.GetLogsPagination);
exports.default = LoggingRouter;
