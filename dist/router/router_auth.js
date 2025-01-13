"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ControllerAuth_1 = require("../controller/Auth/ControllerAuth");
const RefreshToken_1 = require("../controller/Auth/RefreshToken");
const AuthRouter = express_1.default.Router();
// semantic meaning
// Auth
AuthRouter.get("/token", RefreshToken_1.refreshToken);
AuthRouter.get("/me", ControllerAuth_1.AuthController.Me);
AuthRouter.post("/login", ControllerAuth_1.AuthController.Login);
AuthRouter.post("/login-checkout", ControllerAuth_1.AuthController.LoginCheckout);
AuthRouter.delete("/logout", ControllerAuth_1.AuthController.Logout);
exports.default = AuthRouter;
