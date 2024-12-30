import express, { Request, Response, NextFunction } from "express";

import { UserController } from "../controller/User/controller_user";

const UserRouter: express.Router = express.Router();




// semantic meaning

// User

UserRouter.get("/getUser", UserController.getUser)
UserRouter.post("/register", UserController.Register)
UserRouter.post("/resetPassword", UserController.ResetPassword)
UserRouter.post("/confirmReset", UserController.ConfirmReset)




export default UserRouter;
