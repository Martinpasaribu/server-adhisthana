import express, { Request, Response, NextFunction } from "express";
import { ContactController } from "../controller/Contact/conttroler.contact";

const ContactRouter: express.Router = express.Router();




// semantic meaning

ContactRouter.post("/addContact", ContactController.addContact);
ContactRouter.get("/getContact", ContactController.getContact)

ContactRouter.post("/addSubscribe", ContactController.addSubscribe);


export default ContactRouter;
