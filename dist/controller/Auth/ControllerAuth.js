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
exports.AuthController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const jwt_decode_1 = require("jwt-decode");
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
const models_user_1 = __importDefault(require("../../models/User/models_user"));
const models_booking_1 = require("../../models/Booking/models_booking");
const models_transaksi_1 = require("../../models/Transaction/models_transaksi");
dotenv_1.default.config();
class AuthController {
    static Login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // console.log('Login attempt:', req.body); 
                // // 1. Verifikasi reCAPTCHA
                const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
                const recaptchaResponse = yield axios_1.default.get(`https://www.google.com/recaptcha/api/siteverify`, {
                    params: {
                        secret: recaptchaSecret,
                        response: req.body.recaptchaToken,
                    },
                });
                const recaptchaData = recaptchaResponse.data;
                // Periksa status reCAPTCHA
                if (!recaptchaData.success || recaptchaData.score < 0.5) {
                    return res.status(400).json({ message: "reCAPTCHA verification failed. Please try again." });
                }
                const user = yield models_user_1.default.findOne({ email: req.body.email });
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }
                const match = yield bcrypt_1.default.compare(req.body.password, user.password);
                if (!match) {
                    return res.status(400).json({ message: "Wrong password" });
                }
                if (req.body.password !== req.body.password) {
                    return res.status(400).json({ message: "Passwords are not the same" });
                }
                const userId = user._id;
                const name = user.name;
                const email = user.email;
                req.session.userId = userId;
                const accessToken = jsonwebtoken_1.default.sign({ userId, name, email }, process.env.ACCESS_TOKEN_SECRET, {
                    expiresIn: '20s'
                });
                const refreshToken = jsonwebtoken_1.default.sign({ userId, name, email }, process.env.REFRESH_TOKEN_SECRET, {
                    expiresIn: '1d'
                });
                yield models_user_1.default.findOneAndUpdate({ _id: userId }, // Cari berdasarkan userId saja
                { refresh_token: refreshToken }, // Update refresh_token
                { new: true, runValidators: true } // Opsional: agar dokumen yang diperbarui dikembalikan
                );
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: true,
                    maxAge: 24 * 60 * 60 * 1000,
                });
                // res.cookie('refreshToken', refreshToken, { 
                //     httpOnly: true, 
                //     secure: true, 
                //     sameSite: 'None', 
                //     maxAge: 24 * 60 * 60 * 1000 
                // });
                const decodedRefreshToken = (0, jwt_decode_1.jwtDecode)(refreshToken);
                const expiresIn = decodedRefreshToken.exp;
                console.log(decodedRefreshToken);
                res.json({
                    requestId: (0, uuid_1.v4)(),
                    data: {
                        accessToken: accessToken,
                        refreshToken: refreshToken,
                        expiresIn: expiresIn,
                        user: user
                    },
                    message: "Successfully Login",
                    success: true
                });
            }
            catch (error) {
                const axiosError = error;
                const errorResponseData = axiosError.response ? axiosError.response.status : null;
                console.error('Error during login:', error);
                res.status(500).json({
                    message: "An error occurred during login",
                    error: axiosError.message,
                    error2: errorResponseData,
                    stack: axiosError.stack
                });
            }
        });
    }
    ;
    static Logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken)
                return res.sendStatus(204);
            const user = yield models_user_1.default.findOne({ refresh_token: refreshToken });
            if (!user)
                return res.sendStatus(204);
            const userId = user._id;
            yield models_user_1.default.findOneAndUpdate({ refresh_token: null }, { uuid: userId });
            res.clearCookie('refreshToken');
            req.session.destroy((err) => {
                if (err) {
                    return res.status(500).json({
                        message: "Could not log out",
                        success: false
                    });
                }
                // Hanya kirim respons ini
                res.status(200).json({
                    message: "Anda berhasil Logout",
                    data: {
                        pesan: " haloo"
                    },
                    success: true
                });
            });
        });
    }
    ;
    static Me(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.session.userId) {
                    return res.status(401).json({ message: "Please Login, session empty" });
                }
                const user = yield models_user_1.default.findOne({ _id: req.session.userId }, {
                    uuid: true,
                    name: true,
                    phone: true,
                    email: true,
                });
                if (!user)
                    return res.status(404).json({ message: "User not found!" });
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: user,
                    message: "Successfully cek Me",
                    success: true
                });
            }
            catch (error) {
                const axiosError = error;
                const errorResponseData = axiosError.response ? axiosError.response.status : null;
                console.error('Error during Check Me:', error);
                res.status(500).json({
                    message: "An error occurred during Check Me:",
                    error: axiosError.message,
                    error2: errorResponseData,
                    stack: axiosError.stack,
                    success: false
                });
            }
        });
    }
    static LoginCheckout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield models_user_1.default.findOne({ email: req.body.email, });
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }
                const userId = user._id;
                const name = user.name;
                const email = user.email;
                req.session.userId = userId;
                // $ne adalah operator MongoDB yang berarti "not equal" (tidak sama).
                // Update pada BookingModel
                const bookingUpdate = yield models_booking_1.BookingModel.updateMany({ email, userId: { $ne: userId } }, { userId });
                if (bookingUpdate.matchedCount === 0) {
                    return res.status(200).json({ message: "No bookings updated. All matching records already have the same userId." });
                }
                // Update pada TransactionModel
                const transactionUpdate = yield models_transaksi_1.TransactionModel.updateMany({ email, userId: { $ne: userId } }, { userId });
                if (transactionUpdate.matchedCount === 0) {
                    return res.status(200).json({ message: "No transactions updated. All matching records already have the same userId." });
                }
                // await ShortAvailableModel.findOneAndUpdate({ email: req.body.email, },{userId:req.userId});            
                // if (!ShortAvailableModel) {
                //     return res.status(404).json({ message: "ShortAvailable not update" });
                // }
                const accessToken = jsonwebtoken_1.default.sign({ userId, name, email }, process.env.ACCESS_TOKEN_SECRET, {
                    expiresIn: '20s'
                });
                const refreshToken = jsonwebtoken_1.default.sign({ userId, name, email }, process.env.REFRESH_TOKEN_SECRET, {
                    expiresIn: '1d'
                });
                yield models_user_1.default.findOneAndUpdate({ _id: userId }, // Cari berdasarkan userId saja
                { refresh_token: refreshToken }, // Update refresh_token
                { new: true, runValidators: true } // Opsional: agar dokumen yang diperbarui dikembalikan
                );
                // res.cookie('refreshToken', refreshToken, {
                //     httpOnly: true,
                //     secure: true,
                //     maxAge: 24 * 60 * 60 * 1000, 
                // });
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: false,
                    secure: true,
                    sameSite: 'None',
                    maxAge: 24 * 60 * 60 * 1000
                });
                const decodedRefreshToken = (0, jwt_decode_1.jwtDecode)(refreshToken);
                const expiresIn = decodedRefreshToken.exp;
                console.log(decodedRefreshToken);
                res.json({
                    requestId: (0, uuid_1.v4)(),
                    // data: {
                    //     accessToken: accessToken,
                    //     refreshToken: refreshToken,
                    //     expiresIn: expiresIn, 
                    //     user: user 
                    // },
                    message: "Successfully Login",
                    success: true
                });
            }
            catch (error) {
                const axiosError = error;
                const errorResponseData = axiosError.response ? axiosError.response.status : null;
                console.error('Error during login:', error);
                res.status(500).json({
                    message: "An error occurred during login",
                    error: axiosError.message,
                    error2: errorResponseData,
                    stack: axiosError.stack
                });
            }
        });
    }
    ;
}
exports.AuthController = AuthController;
