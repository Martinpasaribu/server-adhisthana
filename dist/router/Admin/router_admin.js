"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_UserAdmin_1 = require("../../controller/Admin/AdminUser/controller_UserAdmin");
const VerifyAdminId_1 = require("../../middleware/VerifyAdminId");
const LogAdmin_1 = require("../../middleware/LogAdmin");
const AdminRouter = express_1.default.Router();
// semantic meaning
AdminRouter.get("/cek-user/:email", controller_UserAdmin_1.AdminUserController.getAdmin);
AdminRouter.get("/get-admin-user", VerifyAdminId_1.verifyAdmin, (0, LogAdmin_1.logActivity)("Block Account User Admin"), controller_UserAdmin_1.AdminUserController.GetAdminUser);
AdminRouter.put("/set-block/:id", controller_UserAdmin_1.AdminUserController.SetBlock);
AdminRouter.put("/set-active/:id", controller_UserAdmin_1.AdminUserController.SetActive);
AdminRouter.put("/deleted/:UserId", VerifyAdminId_1.verifyAdmin, (0, LogAdmin_1.logActivity)("Deleted User Admin"), controller_UserAdmin_1.AdminUserController.DeletedUser);
AdminRouter.get("/cek-me", controller_UserAdmin_1.AdminUserController.CheckMeAdmin);
AdminRouter.post("/register", controller_UserAdmin_1.AdminUserController.RegisterAdmin);
exports.default = AdminRouter;
