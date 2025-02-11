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
exports.verifyEmail = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const verifyEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(`https://api.hunter.io/v2/email-verifier?email=${email}&api_key=${process.env.HUNTER_API_KEY}`);
        const { status, accept_all, smtp_check, disposable, block } = response.data.data;
        // Email valid jika:
        // - status adalah "valid"
        // - smtp_check true (email benar-benar aktif)
        // - bukan email disposable (sekali pakai)
        // - tidak masuk daftar blocklist
        if (status === "valid" && smtp_check && !disposable && !block) {
            return true;
        }
        // Jika email adalah "accept_all", kita anggap valid tetapi beri peringatan
        if (accept_all) {
            console.warn(`Email ${email} is an "accept_all" address, verification may not be reliable.`);
            return true; // Bisa dikembalikan `false` jika ingin lebih ketat
        }
        return false;
    }
    catch (error) {
        console.error("Error verifying email:", error);
        return false; // Jika ada error, anggap email tidak valid
    }
});
exports.verifyEmail = verifyEmail;
