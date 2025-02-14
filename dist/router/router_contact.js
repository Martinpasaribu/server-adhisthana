"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const conttroler_contact_1 = require("../controller/Contact/conttroler.contact");
const ContactRouter = express_1.default.Router();
// semantic meaning
ContactRouter.post("/addContact", conttroler_contact_1.ContactController.addContact);
ContactRouter.get("/getContact", conttroler_contact_1.ContactController.getContact);
ContactRouter.post("/addSubscribe", conttroler_contact_1.ContactController.addSubscribe);
exports.default = ContactRouter;
