"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const VerifyAdminId_1 = require("../../middleware/VerifyAdminId");
const controller_Dish_1 = require("../../controller/Admin/Dish/controller_Dish");
const AdminDishRouter = express_1.default.Router();
// semantic meaning
AdminDishRouter.post("/add-dish", controller_Dish_1.AdminDishController.AddMenu);
AdminDishRouter.get("/get-dish", VerifyAdminId_1.verifyAdmin, controller_Dish_1.AdminDishController.GetDish);
AdminDishRouter.delete("/del-dish-booking/:id_booking/:id_dish", VerifyAdminId_1.verifyAdmin, controller_Dish_1.AdminDishController.DeletedDishBooking);
exports.default = AdminDishRouter;
