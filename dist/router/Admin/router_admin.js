"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_UserAdmin_1 = require("../../controller/Admin/AdminUser/controller_UserAdmin");
const AdminRouter = express_1.default.Router();
// semantic meaning
AdminRouter.get("/cek-user/:email", controller_UserAdmin_1.AdminUserController.getAdmin);
AdminRouter.post("/register-admin", controller_UserAdmin_1.AdminUserController.RegisterAdmin);
exports.default = AdminRouter;
