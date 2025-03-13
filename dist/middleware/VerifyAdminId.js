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
exports.verifyAdmin = void 0;
const models_admin_1 = __importDefault(require("../models/Admin/models_admin"));
const verifyAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("hasil Session from db :", req.session.userId);
    if (!req.session.userId) {
        return res.status(401).json({ message: "Session empty, Login again" });
    }
    const admin = yield models_admin_1.default.findOne({ _id: req.session.userId, active: true });
    if (!admin) {
        return res.status(404).json({ message: "User sessionID not found" });
    }
    // Perbaikan logika role
    if (admin.role !== "admin" && admin.role !== "superAdmin" && admin.role !== "coSuperAdmin") {
        return res.status(403).json({ msg: "Access Prohibited!! " });
    }
    req.role = admin.role;
    req.userAdmin = admin.username;
    next();
});
exports.verifyAdmin = verifyAdmin;
