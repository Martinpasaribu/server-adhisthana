"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ControllerAuth_1 = require("../controller/Auth/ControllerAuth");
const RefreshTokens_1 = require("../controller/Auth/RefreshTokens");
const RateLimit_1 = require("../middleware/RateLimit");
const AuthRouter = express_1.default.Router();
// semantic meaning
// Auth
AuthRouter.get("/token", RefreshTokens_1.refreshToken);
AuthRouter.get("/token-admin", RefreshTokens_1.refreshTokenAdmin);
AuthRouter.get("/me", ControllerAuth_1.AuthController.Me);
AuthRouter.get("/cek-refresh-token", ControllerAuth_1.AuthController.CheckRefreshToken);
AuthRouter.post("/login", RateLimit_1.loginLimiter, ControllerAuth_1.AuthController.Login);
AuthRouter.post("/login-admin", RateLimit_1.loginLimiter, ControllerAuth_1.AuthController.LoginAdmin);
AuthRouter.post("/login-checkout", ControllerAuth_1.AuthController.LoginCheckout);
AuthRouter.delete("/logout", ControllerAuth_1.AuthController.Logout);
AuthRouter.delete("/logout-admin", ControllerAuth_1.AuthController.LogoutAdmin);
exports.default = AuthRouter;
