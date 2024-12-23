import express, { Request, Response, NextFunction } from "express";
import { InstagramController } from "../controller/Instagram/controller_instagram";

const InstagramRouter: express.Router = express.Router();




// semantic meaning

// Add Room
InstagramRouter.get("/getdata", InstagramController.getData)
InstagramRouter.get("/update", InstagramController.update)

export default InstagramRouter;
