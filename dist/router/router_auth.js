"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Auth_1 = require("../controller/Auth/Auth");
const RefreshToken_1 = require("../controller/Auth/RefreshToken");
const AuthRouter = express_1.default.Router();
// semantic meaning
// Auth
AuthRouter.get("/token", RefreshToken_1.refreshToken);
AuthRouter.post("/login", Auth_1.AuthController.Login);
AuthRouter.delete("/logout", Auth_1.AuthController.Logout);
exports.default = AuthRouter;
