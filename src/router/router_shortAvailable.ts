import express, { Request, Response, NextFunction } from "express";
import { ShortAvailableController } from "../controller/ShortAvailable/controller_short";

const ContactRouter: express.Router = express.Router();




// semantic meaning

ContactRouter.get("/getShortVila", ShortAvailableController.getShortVila)



export default ContactRouter;
