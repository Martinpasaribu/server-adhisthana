import express, { Request, Response, NextFunction } from "express";
import { AuthController } from "../controller/Auth/ControllerAuth";
import { refreshToken, refreshTokenAdmin } from "../controller/Auth/RefreshTokens";
import { loginLimiter } from "../middleware/RateLimit";
import { logActivity } from "../middleware/LogAdmin";

const AuthRouter: express.Router = express.Router();


// semantic meaning


// Auth

AuthRouter.get("/token", refreshToken)
AuthRouter.get("/token-admin", refreshTokenAdmin)
AuthRouter.get("/me", AuthController.Me)
AuthRouter.get("/cek-refresh-token", AuthController.CheckRefreshToken)
AuthRouter.post("/login", loginLimiter, AuthController.Login);
// AuthRouter.post("/login-admin", loginLimiter, logActivity("Log-In Admin"), AuthController.LoginAdmin);
AuthRouter.post("/login-admin", logActivity("Log-In Admin"), AuthController.LoginAdmin);
AuthRouter.post("/login-checkout", AuthController.LoginCheckout);
AuthRouter.delete("/logout", AuthController.Logout);
AuthRouter.delete("/logout-admin",logActivity("Log-Out Admin"), AuthController.LogoutAdmin);



export default AuthRouter;
