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
exports.Register = exports.CekUser = void 0;
const models_user_1 = __importDefault(require("../../../../models/User/models_user"));
const CekUser = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield models_user_1.default.findOne({ email: email });
    if (users) {
        return users._id;
    }
    else {
        return null;
    }
});
exports.CekUser = CekUser;
const Register = (title, name, email, phone) => __awaiter(void 0, void 0, void 0, function* () {
    const Regis = yield models_user_1.default.create({
        title: title,
        name: name,
        email: email,
        phone: phone
    });
    if (Regis) {
        return Regis._id;
        // return {
        //     success: true,
        //     userId: Regis._id, // Mengembalikan ID pengguna yang baru dibuat
        //     message: "User registered successfully"
        // };
    }
    else {
        throw new Error(" Cannot register use at user Guest");
    }
});
exports.Register = Register;
