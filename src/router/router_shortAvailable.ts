import express, { Request, Response, NextFunction } from "express";
import { ShortAvailableController } from "../controller/ShortAvailable/controller_short";

const ShortAvailableRouter: express.Router = express.Router();




// semantic meaning

ShortAvailableRouter.get("/getShortVila", ShortAvailableController.getShortVila)
ShortAvailableRouter.post("/get-short-available", ShortAvailableController.getAvailableRooms)
ShortAvailableRouter.get("/get-short-available", ShortAvailableController.getAvailableRooms)
ShortAvailableRouter.post("/get-available-set-minder", ShortAvailableController.getAvailableRoomsWithSiteMinder)



export default ShortAvailableRouter;
