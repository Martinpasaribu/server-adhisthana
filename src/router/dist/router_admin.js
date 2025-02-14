"use strict";
exports.__esModule = true;
var express_1 = require("express");
var controller_UserAdmin_1 = require("../controller/Admin/AdminUser/controller_UserAdmin");
var AdminRouter = express_1["default"].Router();
// semantic meaning
AdminRouter.get("/cek-user/:email", controller_UserAdmin_1.AdminUserController.getAdmin);
AdminRouter.post("/register-admin", controller_UserAdmin_1.AdminUserController.RegisterAdmin);
exports["default"] = AdminRouter;
