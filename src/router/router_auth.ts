import express, { Request, Response, NextFunction } from "express";
import { AuthController } from "../controller/Auth/ControllerAuth";
import { refreshToken } from "../controller/Auth/RefreshToken";

const AuthRouter: express.Router = express.Router();


// semantic meaning


// Auth

AuthRouter.get("/token", refreshToken)
AuthRouter.get("/me", AuthController.Me)
AuthRouter.post("/login", AuthController.Login);
AuthRouter.post("/login-checkout", AuthController.LoginCheckout);
AuthRouter.delete("/logout", AuthController.Logout);



export default AuthRouter;
