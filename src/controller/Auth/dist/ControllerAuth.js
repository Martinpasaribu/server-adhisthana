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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.AuthController = void 0;
var bcrypt_1 = require("bcrypt");
var jsonwebtoken_1 = require("jsonwebtoken");
var dotenv_1 = require("dotenv");
var jwt_decode_1 = require("jwt-decode");
var argon2_1 = require("argon2");
var axios_1 = require("axios");
var uuid_1 = require("uuid");
var models_user_1 = require("../../models/User/models_user");
var models_admin_1 = require("../../models/Admin/models_admin");
dotenv_1["default"].config();
var AuthController = /** @class */ (function () {
    function AuthController() {
    }
    AuthController.Login = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var recaptchaSecret, recaptchaResponse, recaptchaData, user, match, userId, name, email, accessToken, refreshToken, decodedRefreshToken, expiresIn, error_1, axiosError, errorResponseData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
                        return [4 /*yield*/, axios_1["default"].get("https://www.google.com/recaptcha/api/siteverify", {
                                params: {
                                    secret: recaptchaSecret,
                                    response: req.body.recaptchaToken
                                }
                            })];
                    case 1:
                        recaptchaResponse = _a.sent();
                        recaptchaData = recaptchaResponse.data;
                        // Periksa status reCAPTCHA
                        if (!recaptchaData.success || recaptchaData.score < 0.5) {
                            return [2 /*return*/, res.status(400).json({ message: "reCAPTCHA verification failed. Please try again." })];
                        }
                        return [4 /*yield*/, models_user_1["default"].findOne({ email: req.body.email })];
                    case 2:
                        user = _a.sent();
                        if (!user) {
                            return [2 /*return*/, res.status(404).json({ message: "User not found" })];
                        }
                        if (!user.password) {
                            return [2 /*return*/, res.status(500).json({ message: "Set Password New", status: false })];
                        }
                        return [4 /*yield*/, bcrypt_1["default"].compare(req.body.password, user.password)];
                    case 3:
                        match = _a.sent();
                        if (!match) {
                            return [2 /*return*/, res.status(400).json({ message: "Wrong password" })];
                        }
                        if (req.body.password !== req.body.password) {
                            return [2 /*return*/, res.status(400).json({ message: "Passwords are not the same" })];
                        }
                        userId = user._id;
                        name = user.name;
                        email = user.email;
                        req.session.userId = userId;
                        accessToken = jsonwebtoken_1["default"].sign({ userId: userId, name: name, email: email }, process.env.ACCESS_TOKEN_SECRET, {
                            expiresIn: '20s'
                        });
                        refreshToken = jsonwebtoken_1["default"].sign({ userId: userId, name: name, email: email }, process.env.REFRESH_TOKEN_SECRET, {
                            expiresIn: '1d'
                        });
                        return [4 /*yield*/, models_user_1["default"].findOneAndUpdate({ _id: userId }, // Cari berdasarkan userId saja
                            { refresh_token: refreshToken }, // Update refresh_token
                            { "new": true, runValidators: true } // Opsional: agar dokumen yang diperbarui dikembalikan
                            )];
                    case 4:
                        _a.sent();
                        // res.cookie('refreshToken', refreshToken, {
                        //     httpOnly: true,
                        //     secure: true,
                        //     maxAge: 24 * 60 * 60 * 1000, 
                        // });
                        res.cookie('refreshToken', refreshToken, {
                            secure: true,
                            sameSite: 'none',
                            httpOnly: false,
                            maxAge: 24 * 60 * 60 * 1000
                        });
                        decodedRefreshToken = jwt_decode_1.jwtDecode(refreshToken);
                        expiresIn = decodedRefreshToken.exp;
                        console.log(decodedRefreshToken);
                        res.json({
                            requestId: uuid_1.v4(),
                            data: {
                                accessToken: accessToken,
                                refreshToken: refreshToken,
                                expiresIn: expiresIn,
                                user: user
                            },
                            message: "Successfully Login",
                            success: true
                        });
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        axiosError = error_1;
                        errorResponseData = axiosError.response ? axiosError.response.status : null;
                        console.error('Error during login:', error_1);
                        res.status(500).json({
                            message: "An error occurred during login",
                            error: axiosError.message,
                            error2: errorResponseData,
                            stack: axiosError.stack
                        });
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ;
    AuthController.Logout = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var refreshToken, user, userId, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        refreshToken = req.cookies.refreshToken;
                        // Jika tidak ada refresh token di cookie, langsung kirim status 204 (No Content)
                        if (!refreshToken) {
                            return [2 /*return*/, res.status(404).json({
                                    message: "RefreshToken not found",
                                    success: false
                                })];
                        }
                        return [4 /*yield*/, models_user_1["default"].findOne({ refresh_token: refreshToken })];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            return [2 /*return*/, res.status(404).json({
                                    message: "User not found",
                                    success: false
                                })];
                        }
                        userId = user._id;
                        // Update refresh token menjadi null untuk user tersebut
                        return [4 /*yield*/, models_user_1["default"].findOneAndUpdate({ _id: userId }, { refresh_token: null })];
                    case 2:
                        // Update refresh token menjadi null untuk user tersebut
                        _a.sent();
                        // Hapus cookie refreshToken
                        res.clearCookie('refreshToken');
                        // Hancurkan sesi
                        req.session.destroy(function (err) {
                            if (err) {
                                // Jika terjadi error saat menghancurkan sesi
                                return res.status(500).json({
                                    message: "Could not log out",
                                    success: false
                                });
                            }
                            // Kirim respons logout berhasil
                            res.status(200).json({
                                message: "Success logout",
                                data: {
                                    pesan: "Logout berhasil"
                                },
                                success: true
                            });
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        // Tangani error lainnya
                        res.status(500).json({
                            message: "An error occurred during logout",
                            success: false,
                            error: error_2.message
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AuthController.Me = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var user, error_3, axiosError, errorResponseData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!req.session.userId) {
                            return [2 /*return*/, res.status(401).json({ message: "Your session-Id no exists", success: false })];
                        }
                        return [4 /*yield*/, models_user_1["default"].findOne({ _id: req.session.userId }, {
                                uuid: true,
                                name: true,
                                phone: true,
                                email: true
                            })];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            return [2 /*return*/, res.status(404).json({ message: "Your session-Id no register", success: false })];
                        res.status(200).json({
                            requestId: uuid_1.v4(),
                            data: user,
                            message: "Your session-Id exists",
                            success: true
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        axiosError = error_3;
                        errorResponseData = axiosError.response ? axiosError.response.status : null;
                        console.error('Error during Session-Id:', error_3);
                        res.status(500).json({
                            message: "An error occurred during Session-Id:",
                            error: axiosError.message,
                            error2: errorResponseData,
                            stack: axiosError.stack,
                            success: false
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AuthController.LoginCheckout = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var user, userId, name, email, accessToken, refreshToken, decodedRefreshToken, expiresIn, error_4, axiosError, errorResponseData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, models_user_1["default"].findOne({ email: req.body.email })];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            return [2 /*return*/, res.status(404).json({ message: "User not found" })];
                        }
                        userId = user._id;
                        name = user.name;
                        email = user.email;
                        req.session.userId = userId;
                        accessToken = jsonwebtoken_1["default"].sign({ userId: userId, name: name, email: email }, process.env.ACCESS_TOKEN_SECRET, {
                            expiresIn: '20s'
                        });
                        refreshToken = jsonwebtoken_1["default"].sign({ userId: userId, name: name, email: email }, process.env.REFRESH_TOKEN_SECRET, {
                            expiresIn: '1d'
                        });
                        return [4 /*yield*/, models_user_1["default"].findOneAndUpdate({ _id: userId }, // Cari berdasarkan userId saja
                            { refresh_token: refreshToken }, // Update refresh_token
                            { "new": true, runValidators: true } // Opsional: agar dokumen yang diperbarui dikembalikan
                            )];
                    case 2:
                        _a.sent();
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
                        decodedRefreshToken = jwt_decode_1.jwtDecode(refreshToken);
                        expiresIn = decodedRefreshToken.exp;
                        console.log(decodedRefreshToken);
                        res.json({
                            requestId: uuid_1.v4(),
                            // data: {
                            //     accessToken: accessToken,
                            //     refreshToken: refreshToken,
                            //     expiresIn: expiresIn, 
                            //     user: user 
                            // },
                            message: "Successfully Login",
                            success: true
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        axiosError = error_4;
                        errorResponseData = axiosError.response ? axiosError.response.status : null;
                        console.error('Error during login:', error_4);
                        res.status(500).json({
                            message: "An error occurred during login",
                            error: axiosError.message,
                            error2: errorResponseData,
                            stack: axiosError.stack
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ;
    AuthController.LoginAdmin = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, username, password, ConfirmPassword, recaptchaToken, recaptchaSecret, recaptchaResponse, recaptchaData, admin, statusMessages, match, userId, userRole, usernameAdmin, accessToken, refreshToken, decodedRefreshToken, expiresIn, error_5, axiosError, errorResponseData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        _a = req.body, username = _a.username, password = _a.password, ConfirmPassword = _a.ConfirmPassword, recaptchaToken = _a.recaptchaToken;
                        recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
                        return [4 /*yield*/, axios_1["default"].get('https://www.google.com/recaptcha/api/siteverify', {
                                params: { secret: recaptchaSecret, response: recaptchaToken }
                            })];
                    case 1:
                        recaptchaResponse = _b.sent();
                        recaptchaData = recaptchaResponse.data;
                        if (!recaptchaData.success || recaptchaData.score < 0.7) {
                            return [2 /*return*/, res.status(400).json({ message: 'reCAPTCHA verification failed. Please try again.' })];
                        }
                        return [4 /*yield*/, models_admin_1["default"].findOne({ username: username })];
                    case 2:
                        admin = _b.sent();
                        if (!admin)
                            return [2 /*return*/, res.status(404).json({ message: 'User not found' })];
                        statusMessages = {
                            block: 'User InActive',
                            Pending: 'User Is Pending'
                        };
                        if (admin.status in statusMessages) {
                            return [2 /*return*/, res.status(403).json({ message: statusMessages[admin.status] })];
                        }
                        // 4. Cek password harus ada
                        if (!admin.password) {
                            return [2 /*return*/, res.status(500).json({ message: 'Set Password New', status: false })];
                        }
                        // 5. Bandingkan password sebelum hashing
                        if (password !== ConfirmPassword) {
                            return [2 /*return*/, res.status(400).json({ message: 'Password and Confirm Password do not match', status: false })];
                        }
                        return [4 /*yield*/, argon2_1["default"].verify(admin.password, req.body.password)];
                    case 3:
                        match = _b.sent();
                        if (!match) {
                            return [2 /*return*/, res.status(400).json({ message: 'Wrong password' })];
                        }
                        userId = admin._id;
                        userRole = admin.role;
                        usernameAdmin = admin.username;
                        req.session.userId = userId;
                        accessToken = jsonwebtoken_1["default"].sign({ userId: userId, usernameAdmin: usernameAdmin, role: userRole }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' } // Ubah menjadi 15 menit
                        );
                        refreshToken = jsonwebtoken_1["default"].sign({ userId: userId, usernameAdmin: usernameAdmin, role: userRole }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' } // Refresh token berlaku selama 7 hari
                        );
                        // 8. Simpan Refresh Token di Database
                        return [4 /*yield*/, models_admin_1["default"].findOneAndUpdate({ _id: userId }, { refresh_token: refreshToken }, { "new": true, runValidators: true })];
                    case 4:
                        // 8. Simpan Refresh Token di Database
                        _b.sent();
                        // 9. Simpan refreshToken di Cookie dengan Keamanan Tinggi
                        res.cookie('refreshToken', refreshToken, {
                            httpOnly: true,
                            secure: process.env.NODE_ENV === 'production',
                            sameSite: 'strict',
                            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 hari
                        });
                        decodedRefreshToken = jwt_decode_1.jwtDecode(refreshToken);
                        expiresIn = decodedRefreshToken.exp;
                        // 10. Response ke Client
                        res.json({
                            requestId: uuid_1.v4(),
                            data: {
                                accessToken: accessToken,
                                expiresIn: expiresIn
                            },
                            message: 'Successfully Logged In',
                            success: true
                        });
                        return [3 /*break*/, 6];
                    case 5:
                        error_5 = _b.sent();
                        axiosError = error_5;
                        errorResponseData = axiosError.response ? axiosError.response.status : null;
                        console.error('Error during login:', error_5);
                        res.status(500).json({
                            requestId: uuid_1.v4(),
                            message: "An error occurred during login",
                            error: axiosError.message,
                            error2: errorResponseData,
                            stack: axiosError.stack,
                            success: false
                        });
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    AuthController.LogoutAdmin = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var refreshToken, user, userId, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        refreshToken = req.cookies.refreshToken;
                        // Jika tidak ada refresh token di cookie, langsung kirim status 204 (No Content)
                        if (!refreshToken) {
                            return [2 /*return*/, res.status(404).json({
                                    message: "RefreshToken not found",
                                    success: false
                                })];
                        }
                        return [4 /*yield*/, models_admin_1["default"].findOne({ refresh_token: refreshToken })];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            return [2 /*return*/, res.status(404).json({
                                    message: "User not found",
                                    success: false
                                })];
                        }
                        userId = user._id;
                        // Update refresh token menjadi null untuk user tersebut
                        return [4 /*yield*/, models_admin_1["default"].findOneAndUpdate({ _id: userId }, { refresh_token: null })];
                    case 2:
                        // Update refresh token menjadi null untuk user tersebut
                        _a.sent();
                        // Hapus cookie refreshToken
                        res.clearCookie('refreshToken');
                        // Hancurkan sesi
                        req.session.destroy(function (err) {
                            if (err) {
                                // Jika terjadi error saat menghancurkan sesi
                                return res.status(500).json({
                                    message: "Could not log out",
                                    success: false
                                });
                            }
                            // Kirim respons logout berhasil
                            res.status(200).json({
                                message: "Success logout",
                                data: {
                                    pesan: "Logout berhasil"
                                },
                                success: true
                            });
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _a.sent();
                        // Tangani error lainnya
                        res.status(500).json({
                            message: "An error occurred during logout",
                            success: false,
                            error: error_6.message
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return AuthController;
}());
exports.AuthController = AuthController;
