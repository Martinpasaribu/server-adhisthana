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
const argon2_1 = __importDefault(require("argon2"));
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
const models_user_1 = __importDefault(require("../../models/User/models_user"));
const models_admin_1 = __importDefault(require("../../models/Admin/models_admin"));
dotenv_1.default.config();
class AuthController {
    static Login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
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
                if (!user.password) {
                    return res.status(500).json({ message: "Set Password New", status: false });
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
                //  Simpan refreshToken di Cookie dengan Keamanan Tinggi
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true, // Amankan dari JavaScript
                    secure: process.env.NODE_ENV === 'production', // Hanya bisa digunakan di HTTPS
                    sameSite: 'None',
                    // sameSite: 'strict', // Cegah CSRF Attack
                    maxAge: 24 * 60 * 60 * 1000 // 7 hari
                });
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
            try {
                const refreshToken = req.cookies.refreshToken;
                // Jika tidak ada refresh token di cookie, langsung kirim status 204 (No Content)
                if (!refreshToken) {
                    return res.status(404).json({
                        message: "RefreshToken not found",
                        success: false,
                    });
                }
                // Cari user berdasarkan refresh token
                const user = yield models_user_1.default.findOne({ refresh_token: refreshToken });
                if (!user) {
                    return res.status(404).json({
                        message: "User not found",
                        success: false,
                    });
                }
                const userId = user._id;
                // Update refresh token menjadi null untuk user tersebut
                yield models_user_1.default.findOneAndUpdate({ _id: userId }, { refresh_token: null });
                // Hapus cookie refreshToken
                res.clearCookie('refreshToken');
                // Hancurkan sesi
                req.session.destroy((err) => {
                    if (err) {
                        // Jika terjadi error saat menghancurkan sesi
                        return res.status(500).json({
                            message: "Could not log out",
                            success: false,
                        });
                    }
                    // Kirim respons logout berhasil
                    res.status(200).json({
                        message: "Success logout",
                        data: {
                            pesan: "Logout berhasil",
                        },
                        success: true,
                    });
                });
            }
            catch (error) {
                // Tangani error lainnya
                res.status(500).json({
                    message: "An error occurred during logout",
                    success: false,
                    error: error.message,
                });
            }
        });
    }
    static Me(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.session.userId) {
                    return res.status(401).json({ message: "Your session-Id no exists", success: false });
                }
                const user = yield models_user_1.default.findOne({ _id: req.session.userId }, {
                    uuid: true,
                    name: true,
                    phone: true,
                    email: true,
                });
                if (!user)
                    return res.status(404).json({ message: "Your session-Id no register", success: false });
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: user,
                    message: "Your session-Id exists",
                    success: true
                });
            }
            catch (error) {
                const axiosError = error;
                const errorResponseData = axiosError.response ? axiosError.response.status : null;
                console.error('Error during Session-Id:', error);
                res.status(500).json({
                    message: "An error occurred during Session-Id:",
                    error: axiosError.message,
                    error2: errorResponseData,
                    stack: axiosError.stack,
                    success: false
                });
            }
        });
    }
    static CheckRefreshToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Cookies:", req.cookies);
                const refreshToken = req.cookies.refreshToken;
                if (!refreshToken) {
                    return res.status(403).json({
                        data: false,
                        message: "Session cookies empty"
                    });
                }
                // Cari user berdasarkan refresh token
                const user = yield models_user_1.default.findOne({ refresh_token: refreshToken });
                if (!user) {
                    return res.status(403).json({
                        data: false,
                        message: "Invalid refresh token"
                    });
                }
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: true,
                    message: "Your session-Id exists",
                    success: true
                });
            }
            catch (error) {
                const axiosError = error;
                const errorResponseData = axiosError.response ? axiosError.response.status : null;
                console.error('Refresh Token Error:', error);
                res.status(500).json({
                    message: "An error occurred during Refresh Token :",
                    error: axiosError.message,
                    error2: errorResponseData,
                    stack: axiosError.stack,
                    success: false
                });
            }
        });
    }
    static DeletedSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const refreshToken = req.cookies.refreshToken;
                // Jika tidak ada refresh token di cookie, langsung kirim status 204 (No Content)
                if (!refreshToken) {
                    return res.status(404).json({
                        message: "RefreshToken not found",
                        success: false,
                    });
                }
                // Cari user berdasarkan refresh token
                const user = yield models_user_1.default.findOne({ refresh_token: refreshToken });
                if (!user) {
                    // Hapus cookie refreshToken
                    res.clearCookie('refreshToken');
                }
                // Hancurkan sesi
                req.session.destroy((err) => {
                    if (err) {
                        // Jika terjadi error saat menghancurkan sesi
                        return res.status(500).json({
                            message: "Could not deleted session ",
                            success: false,
                        });
                    }
                    // Kirim respons logout berhasil
                    res.status(200).json({
                        message: "Success Deleted Session and cookies",
                        data: {
                            pesan: "Deleted Session berhasil",
                        },
                        success: true,
                    });
                });
            }
            catch (error) {
                // Tangani error lainnya
                res.status(500).json({
                    message: "An error occurred during Deleted Session",
                    success: false,
                    error: error.message,
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
                // // Update pada BookingModel
                // const bookingUpdate = await BookingModel.updateMany(
                //     { email, userId: { $ne: userId } }, 
                //     { userId } 
                // );
                // if (bookingUpdate.matchedCount === 0) {
                //     return res.status(200).json({ message: "No bookings updated. All matching records already have the same userId." });
                // }
                // // Update pada TransactionModel
                // const transactionUpdate = await TransactionModel.updateMany(
                //     { email, userId: { $ne: userId } }, 
                //     { userId } 
                // );
                // if (transactionUpdate.matchedCount === 0) {
                //     return res.status(200).json({ message: "No transactions updated. All matching records already have the same userId." });
                // }
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
    static LoginAdmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, password, ConfirmPassword, recaptchaToken } = req.body;
                // 1. Verifikasi reCAPTCHA dengan score yang lebih tinggi
                const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
                const recaptchaResponse = yield axios_1.default.get('https://www.google.com/recaptcha/api/siteverify', {
                    params: { secret: recaptchaSecret, response: recaptchaToken },
                });
                const recaptchaData = recaptchaResponse.data;
                if (!recaptchaData.success || recaptchaData.score < 0.7) {
                    return res.status(400).json({ message: 'reCAPTCHA verification failed. Please try again.' });
                }
                // 2. Cari Admin berdasarkan email atau username
                const admin = yield models_admin_1.default.findOne({ username: username });
                if (!admin)
                    return res.status(404).json({ message: 'User not found' });
                // 3. Periksa status akun admin
                const statusMessages = {
                    block: 'User InActive',
                    Pending: 'User Is Pending',
                };
                if (admin.status in statusMessages) {
                    return res.status(403).json({ message: statusMessages[admin.status] });
                }
                // 4. Cek password harus ada
                if (!admin.password) {
                    return res.status(500).json({ message: 'Set Password New', status: false });
                }
                // 5. Bandingkan password sebelum hashing
                if (password !== ConfirmPassword) {
                    return res.status(400).json({ message: 'Password and Confirm Password do not match', status: false });
                }
                // 6. Verifikasi password dengan hashing
                //   const match = await bcrypt.compare(password, admin.password);
                ///argon2 lebih tahan terhadap serangan GPU brute-force.
                const match = yield argon2_1.default.verify(admin.password, req.body.password);
                if (!match) {
                    return res.status(400).json({ message: 'Wrong password' });
                }
                // 7. Buat JWT Token
                const userId = admin._id;
                const userRole = admin.role; // Tambahkan role untuk keamanan tambahan
                const usernameAdmin = admin.username;
                req.session.userId = userId;
                const accessToken = jsonwebtoken_1.default.sign({ userId, usernameAdmin, role: userRole }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5m' } // Ubah menjadi 15 menit
                );
                const refreshToken = jsonwebtoken_1.default.sign({ userId, usernameAdmin, role: userRole }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' } // Refresh token berlaku selama 7 hari
                );
                // // Simpan log aktivitas login
                // await ActivityLogModel.create({
                //   adminId: admin._id,
                //   action: "Login",
                //   ipAddress: req.ip || req.socket.remoteAddress,
                // });
                // 8. Simpan Refresh Token di Database
                yield models_admin_1.default.findOneAndUpdate({ _id: userId }, { refresh_token: refreshToken }, { new: true, runValidators: true });
                // 9. Simpan refreshToken di Cookie dengan Keamanan Tinggi
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true, // Amankan dari JavaScript
                    secure: process.env.NODE_ENV === 'production', // Hanya bisa digunakan di HTTPS
                    sameSite: 'None',
                    // sameSite: 'strict', // Cegah CSRF Attack
                    maxAge: 24 * 60 * 60 * 1000 // 7 hari
                });
                const decodedRefreshToken = (0, jwt_decode_1.jwtDecode)(refreshToken);
                const expiresIn = decodedRefreshToken.exp;
                // 10. Response ke Client
                res.json({
                    requestId: (0, uuid_1.v4)(),
                    data: {
                        accessToken,
                        expiresIn,
                    },
                    message: 'Successfully Logged In',
                    success: true
                });
            }
            catch (error) {
                const axiosError = error;
                const errorResponseData = axiosError.response ? axiosError.response.status : null;
                console.error('Error during login:', error);
                res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    message: "An error occurred during login",
                    error: axiosError.message,
                    error2: errorResponseData,
                    stack: axiosError.stack,
                    success: false
                });
            }
        });
    }
    static LogoutAdmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const refreshToken = req.cookies.refreshToken;
                // Jika tidak ada refresh token di cookie, langsung kirim status 204 (No Content)
                if (!refreshToken) {
                    return res.status(404).json({
                        message: "RefreshToken not found",
                        success: false,
                    });
                }
                // Cari user berdasarkan refresh token
                const user = yield models_admin_1.default.findOne({ refresh_token: refreshToken });
                if (!user) {
                    return res.status(404).json({
                        message: "User not found",
                        success: false,
                    });
                }
                const userId = user._id;
                // Update refresh token menjadi null untuk user tersebut
                yield models_admin_1.default.findOneAndUpdate({ _id: userId }, { refresh_token: null });
                // Hapus cookie refreshToken
                res.clearCookie('refreshToken');
                // Hancurkan sesi
                req.session.destroy((err) => {
                    if (err) {
                        // Jika terjadi error saat menghancurkan sesi
                        return res.status(500).json({
                            message: "Could not log out",
                            success: false,
                        });
                    }
                    // Kirim respons logout berhasil
                    res.status(200).json({
                        message: "Success logout",
                        data: {
                            pesan: "Logout berhasil",
                        },
                        success: true,
                    });
                });
                // await ActivityLogModel.create({
                //   adminId: user._id,
                //   action: "Logout",
                //   ipAddress: req.ip || req.socket.remoteAddress,
                // });
            }
            catch (error) {
                // Tangani error lainnya
                res.status(500).json({
                    message: "An error occurred during logout",
                    success: false,
                    error: error.message,
                });
            }
        });
    }
}
exports.AuthController = AuthController;
