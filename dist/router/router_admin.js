"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_userAdmin_1 = require("../controller/Admin/AdminUser/controller_userAdmin");
const AdminRouter = express_1.default.Router();
// semantic meaning
AdminRouter.get("/cek-user/:email", controller_userAdmin_1.AdminUserController.getAdmin);
AdminRouter.post("/register-admin", controller_userAdmin_1.AdminUserController.RegisterAdmin);
exports.default = AdminRouter;
