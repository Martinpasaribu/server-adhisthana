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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyID = void 0;
const models_user_1 = __importDefault(require("../models/User/models_user"));
const verifyID = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // kalo server direset sessionn akan hilang
    console.log("hasil Session coockies :", req.session);
    if (!req.session.userId) {
        return res.status(401).json({ message: "Session empty, Login again " });
    }
    const user = yield models_user_1.default.findOne({ _id: req.session.userId });
    if (!user)
        return res.status(404).json({ message: "User sessionID tidak ditemukan" });
    req.userId = user._id.toString();
    next();
});
exports.verifyID = verifyID;
