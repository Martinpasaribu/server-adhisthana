"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactController = void 0;
const uuid_1 = require("uuid");
const models_contact_1 = require("../../models/Contact/models_contact");
class ContactController {
    static addContact(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const ContactReq = req.body;
            try {
                const newContact = new models_contact_1.ContactModel(ContactReq);
                const savedContact = yield newContact.save();
                res.status(201).json({
                    requestId: (0, uuid_1.v4)(),
                    data: {
                        acknowledged: true,
                        insertedId: savedContact._id
                    },
                    message: "Successfully Add Contact.",
                    success: true
                });
            }
            catch (error) {
                res.status(400).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message,
                    success: false
                });
            }
        });
    }
    static addSubscribe(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const SubsReq = req.body;
            try {
                const newSubs = new models_contact_1.SubsModel(SubsReq);
                const savedContact = yield newSubs.save();
                res.status(201).json({
                    requestId: (0, uuid_1.v4)(),
                    data: {
                        acknowledged: true,
                        insertedId: savedContact._id
                    },
                    message: "Successfully Add Member.",
                    success: true
                });
            }
            catch (error) {
                res.status(400).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message,
                    success: false
                });
            }
        });
    }
    static getContact(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let data;
                data = yield models_contact_1.ContactModel.find({ isDeleted: false });
                res.status(201).json({
                    requestId: (0, uuid_1.v4)(),
                    data: data,
                    message: "Successfully Fetch Data Room.",
                    success: true
                });
            }
            catch (error) {
                res.status(400).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message,
                    success: false
                });
            }
        });
    }
}
exports.ContactController = ContactController;
