import express, { Request, Response, NextFunction } from "express";
import { AuthController } from "../controller/Auth/Auth";
import { refreshToken } from "../controller/Auth/RefreshToken";

const AuthRouter: express.Router = express.Router();




// semantic meaning


// Auth

AuthRouter.get("/token", refreshToken)
AuthRouter.post("/login", AuthController.Login);
AuthRouter.delete("/logout", AuthController.Logout);



export default AuthRouter;
