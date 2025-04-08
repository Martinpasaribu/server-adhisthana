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
const validator_1 = __importDefault(require("validator")); // Install dengan: npm install validator
const axios_1 = __importDefault(require("axios")); // Pastikan axios sudah terinstal
const ValidationEmail_1 = require("./Component/ValidationEmail");
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
    static cekUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.params;
                const users = yield models_user_1.default.findOne({ email: email });
                if (users) {
                    res.status(200).json({
                        requestId: (0, uuid_1.v4)(),
                        message: "User Available.",
                        success: true,
                        data: users
                    });
                }
                else {
                    res.status(200).json({
                        requestId: (0, uuid_1.v4)(),
                        message: "User Unavailable.",
                        success: false,
                        data: users
                    });
                }
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
    // static async  Register  (req : any , res:any)  {
    //     const { title , name, email, password, phone } = req.body;
    //     // if (password !== confPassword) {
    //     //     return res.status(400).json({ msg: "Passwords are not the same" });
    //     // }
    //     let user
    //     // 2. Validasi Apakah Email Benar-benar Ada dengan hunter.io
    //     const isEmailValid = await verifyEmail(email);
    //     if (!isEmailValid) {
    //         return res.status(400).json({ message: `Email : ${email} does not exist or is invalid.` });
    //     }
    //     if( password && password ){
    //         const salt = await bcrypt.genSalt();
    //         const hashPassword = await bcrypt.hash(password, salt);
    //         user = await UserModel.create({
    //             title: title,
    //             name: name,
    //             email: email,
    //             password: hashPassword,
    //             phone: phone
    //         });
    //     } else {
    //         user = await UserModel.create({
    //             title: title,
    //             name: name,
    //             email: email,
    //             phone: phone
    //         });
    //     }
    //     try {
    //         res.status(201).json(
    //             {
    //                 requestId: uuidv4(), 
    //                 data: user,
    //                 message: "Successfully register user.",
    //                 success: true
    //             }
    //         );
    //     } catch (error) {
    //         res.status(400).json(
    //             {
    //                 requestId: uuidv4(), 
    //                 data: null,
    //                 message:  (error as Error).message,
    //                 success: false
    //             }
    //         );
    //     }
    // }
    static Register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { title, name, email, password, phone } = req.body;
            try {
                // 1. Cek apakah email sudah terdaftar
                const existingUser = yield models_user_1.default.findOne({ email });
                if (existingUser) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: `Email ${email} sudah terdaftar.`,
                        success: false
                    });
                }
                // 2. Validasi Email melalui hunter.io (atau layanan lain)
                const isEmailValid = yield (0, ValidationEmail_1.verifyEmail)(email);
                if (!isEmailValid) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: `Email ${email} tidak valid atau tidak aktif.`,
                        success: false
                    });
                }
                let hashPassword = "";
                // 3. Hash password jika ada
                if (password) {
                    const salt = yield bcrypt_1.default.genSalt();
                    hashPassword = yield bcrypt_1.default.hash(password, salt);
                }
                // 4. Simpan user ke DB
                const user = yield models_user_1.default.create({
                    title,
                    name,
                    email,
                    password: hashPassword || undefined,
                    phone
                });
                // 5. Respon sukses
                return res.status(201).json({
                    requestId: (0, uuid_1.v4)(),
                    data: user,
                    message: "User berhasil didaftarkan.",
                    success: true
                });
            }
            catch (error) {
                console.error("Register Error:", error);
                return res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message || "Terjadi kesalahan pada server.",
                    success: false
                });
            }
        });
    }
    static ConfirmReset(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, recaptchaToken } = req.body;
            try {
                // 1. Validasi Format Email
                if (!validator_1.default.isEmail(email)) {
                    return res.status(400).json({ message: "Invalid email format." });
                }
                // 2. Validasi Apakah Email Benar-benar Ada
                const isEmailValid = yield (0, ValidationEmail_1.verifyEmail)(email);
                if (!isEmailValid) {
                    return res.status(400).json({ message: `Email : ${email} does not exist or is invalid.` });
                }
                // 3. Verifikasi reCAPTCHA
                const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
                const recaptchaResponse = yield axios_1.default.get(`https://www.google.com/recaptcha/api/siteverify`, {
                    params: {
                        secret: recaptchaSecret,
                        response: recaptchaToken,
                    },
                });
                const recaptchaData = recaptchaResponse.data;
                if (!recaptchaData.success || recaptchaData.score < 0.5) {
                    return res.status(400).json({ message: "reCAPTCHA verification failed." });
                }
                // 4. Cari user berdasarkan email
                const user = yield models_user_1.default.findOne({ email: email });
                if (!user) {
                    return res.status(404).json({ message: `User with Email ${email} is not registered` });
                }
                // 5. Generate reset token
                const resetToken = jsonwebtoken_1.default.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });
                const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
                // 6. Kirim email
                const transporter = nodemailer_1.default.createTransport({
                    service: "gmail",
                    auth: {
                        user: process.env.APP_EMAIL,
                        pass: process.env.APP_PASS,
                    },
                });
                yield transporter.sendMail({
                    from: `"Adhisthana Vila" <${process.env.APP_EMAIL}>`,
                    to: email,
                    subject: "Password Reset Request",
                    html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background-color: #f9f9f9;">
                    <div style="text-align: center;">
                        <img src="https://adhistahan.vercel.app/_next/image?url=%2Fassets%2FLogo%2Fadhisthana.png&w=640&q=75" alt="Adhisthana Vila" style="max-width: 150px; margin-bottom: 20px;">
                    </div>
                    <div style="background: white; padding: 20px; border-radius: 8px;">
                        <h2 style="color: #333;">Hello, ${user.title} ${user.name}</h2>
                        <p style="font-size: 16px; color: #555;">
                            You have requested to reset your password. Please click the button below to reset it:
                        </p>
                        <div style="text-align: center; margin: 20px 0;">
                            <a href="${resetLink}" style="
                                display: inline-block;
                                background-color: #F76A0CFF;
                                color: black;
                                border-color: black;
                                padding: 12px 24px;
                                font-size: 16px;
                                text-decoration: none;
                                border-radius: 5px;
                                font-weight: bold;
                            ">Reset Password</a>
                        </div>
                        <p style="font-size: 14px; color: #888;">
                            If you did not request this, please ignore this email.
                        </p>
                    </div>
                        <div style="text-align: center; font-size: 12px; color: #999; margin-top: 55px;">
                            <p>&copy; 2024 Adhisthana Villas. All rights reserved.</p>
                            <p>Susukan, Tegalarum, Kec. Borobudur, Kabupaten Magelang, Jawa Tengah 56413</p>
                        </div>
                </div>
                `,
                });
                res.status(200).json({ message: "Password reset link has been sent to your email." });
            }
            catch (error) {
                res.status(500).json({ message: "Error when resetting password.", error: error.message });
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
                res.status(500).json({ message: "error when resetting password.", error: axiosError.message });
            }
        });
    }
}
exports.UserController = UserController;
