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
exports.UserController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const models_user_1 = __importDefault(require("../../models/User/models_user"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios")); // Pastikan axios sudah terinstal
dotenv_1.default.config();
class UserController {
    static getUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield models_user_1.default.find();
                res.status(200).json(users);
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    static Register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, password, confPassword, phoneNumber } = req.body;
            // if (password !== confPassword) {
            //     return res.status(400).json({ msg: "Passwords are not the same" });
            // }
            let user;
            if (password && confPassword) {
                const salt = yield bcrypt_1.default.genSalt();
                const hashPassword = yield bcrypt_1.default.hash(password, salt);
                user = yield models_user_1.default.create({
                    name: name,
                    email: email,
                    password: hashPassword,
                    phoneNumber: phoneNumber
                });
            }
            else {
                user = yield models_user_1.default.create({
                    name: name,
                    email: email,
                    phoneNumber: phoneNumber
                });
            }
            try {
                res.status(201).json({
                    requestId: (0, uuid_1.v4)(),
                    data: user,
                    message: "Successfully register user.",
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
    static ConfirmReset(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, recaptchaToken } = req.body; // Tambahkan `recaptchaToken` dari klien
            try {
                // 1. Verifikasi reCAPTCHA
                const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
                const recaptchaResponse = yield axios_1.default.get(`https://www.google.com/recaptcha/api/siteverify`, {
                    params: {
                        secret: recaptchaSecret,
                        response: recaptchaToken,
                    },
                });
                const recaptchaData = recaptchaResponse.data;
                // Periksa status reCAPTCHA
                if (!recaptchaData.success || recaptchaData.score < 0.5) {
                    return res.status(400).json({ message: "reCAPTCHA verification failed. Please try again." });
                }
                // 2. Cari user berdasarkan email
                const user = yield models_user_1.default.findOne({ email: email });
                if (!user) {
                    return res.status(404).json({ message: `User with Email ${email} is not registered` });
                }
                // 3. Generate reset token
                const resetToken = jsonwebtoken_1.default.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });
                const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
                // 4. Kirim email
                const transporter = nodemailer_1.default.createTransport({
                    service: "gmail",
                    auth: {
                        user: process.env.APP_EMAIL,
                        pass: process.env.APP_PASS,
                    },
                });
                yield transporter.sendMail({
                    from: `"Adhisthana Vila" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: "Password Reset Request",
                    html: `
                    <p>Hello,</p>
                    <p>You have requested to reset your password. Please click the link below to reset your password:</p>
                    <a href="${resetLink}">${resetLink}</a>
                    <p>If you did not request this, please ignore this email.</p>
                `,
                });
                // 5. Respon sukses
                res.status(200).json({ message: "Password reset link has been sent to your email." });
            }
            catch (error) {
                res.status(500).json({ message: "An error occurred.", error: error.message });
            }
        });
    }
    static ResetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { token, password, confirmPassword } = req.body;
            try {
                if (!token) {
                    return res.status(400).json({ message: "Invalid or missing token." });
                }
                // Verify token
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                const email = decoded.email;
                const user = yield models_user_1.default.findOne({ email });
                if (!user) {
                    return res.status(404).json({ message: `User with Email ${email} is not registered` });
                }
                if (password !== confirmPassword) {
                    return res.status(400).json({ message: "Passwords do not match." });
                }
                // Hash new password
                const salt = yield bcrypt_1.default.genSalt();
                const hashPassword = yield bcrypt_1.default.hash(password, salt);
                // Update password
                yield models_user_1.default.findOneAndUpdate({ email }, { password: hashPassword });
                res.status(200).json({ message: "Password has been successfully updated." });
            }
            catch (error) {
                const axiosError = error;
                if (axiosError.name === "JsonWebTokenError" || axiosError.name === "TokenExpiredError") {
                    return res.status(400).json({ message: "Invalid or expired token." });
                }
                res.status(500).json({ message: "An error occurred.", error: axiosError.message });
            }
        });
    }
}
exports.UserController = UserController;
