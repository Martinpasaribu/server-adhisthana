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
exports.refreshTokenAdmin = exports.refreshToken = void 0;
var jsonwebtoken_1 = require("jsonwebtoken");
var dotenv_1 = require("dotenv");
var models_user_1 = require("../../../models/User/models_user");
var models_admin_1 = require("../../../models/Admin/models_admin");
dotenv_1["default"].config();
exports.refreshToken = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var refreshToken_1, user_1, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log("Cookies:", req.cookies);
                refreshToken_1 = req.cookies.refreshToken;
                if (!refreshToken_1) {
                    return [2 /*return*/, res.status(401).json({ message: "Session cookies empty" })];
                }
                return [4 /*yield*/, models_user_1["default"].findOne({ refresh_token: refreshToken_1 })];
            case 1:
                user_1 = _a.sent();
                if (!user_1) {
                    return [2 /*return*/, res.status(403).json({ message: "Invalid refresh token" })];
                }
                // Verifikasi refresh token
                jsonwebtoken_1["default"].verify(refreshToken_1, process.env.REFRESH_TOKEN_SECRET, function (err) { return __awaiter(void 0, void 0, void 0, function () {
                    var userId, name, email, accessToken, newRefreshToken;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (err) {
                                    return [2 /*return*/, res.status(403).json({ message: "Refresh token not verified" })];
                                }
                                userId = user_1._id;
                                name = user_1.name;
                                email = user_1.email;
                                accessToken = jsonwebtoken_1["default"].sign({ userId: userId, name: name, email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" } // **Diperpanjang menjadi 15 menit**
                                );
                                newRefreshToken = jsonwebtoken_1["default"].sign({ userId: userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" } // **Berlaku 7 hari**
                                );
                                // Simpan refresh token baru di database
                                return [4 /*yield*/, models_user_1["default"].updateOne({ _id: userId }, { refresh_token: newRefreshToken })];
                            case 1:
                                // Simpan refresh token baru di database
                                _a.sent();
                                // Set refresh token di cookies (lebih aman)
                                res.cookie("refreshToken", newRefreshToken, {
                                    httpOnly: true,
                                    secure: process.env.NODE_ENV === "production",
                                    sameSite: "strict",
                                    maxAge: 7 * 24 * 60 * 60 * 1000
                                });
                                return [2 /*return*/, res.json({ accessToken: accessToken })];
                        }
                    });
                }); });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error("Refresh Token Error:", error_1);
                return [2 /*return*/, res.status(500).json({ message: "Internal Server Error" })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.refreshTokenAdmin = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var refreshToken_2, admin_1, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log("Cookies:", req.cookies);
                refreshToken_2 = req.cookies.refreshToken;
                if (!refreshToken_2) {
                    return [2 /*return*/, res.status(401).json({ message: "Session cookies empty" })];
                }
                return [4 /*yield*/, models_admin_1["default"].findOne({ refresh_token: refreshToken_2 })];
            case 1:
                admin_1 = _a.sent();
                if (!admin_1) {
                    return [2 /*return*/, res.status(403).json({ message: "Invalid refresh token" })];
                }
                // Verifikasi refresh token
                jsonwebtoken_1["default"].verify(refreshToken_2, process.env.REFRESH_TOKEN_SECRET, function (err) { return __awaiter(void 0, void 0, void 0, function () {
                    var userId, username, role, accessToken, newRefreshToken;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (err) {
                                    return [2 /*return*/, res.status(403).json({ message: "Refresh token not verified" })];
                                }
                                userId = admin_1._id;
                                username = admin_1.username;
                                role = admin_1.role;
                                accessToken = jsonwebtoken_1["default"].sign({ userId: userId, username: username, role: role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "25s" } // **Diperpanjang menjadi 15 menit**
                                );
                                newRefreshToken = jsonwebtoken_1["default"].sign({ userId: userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" } // **Berlaku 7 hari**
                                );
                                // Simpan refresh token baru di database
                                return [4 /*yield*/, models_admin_1["default"].updateOne({ _id: userId }, { refresh_token: newRefreshToken })];
                            case 1:
                                // Simpan refresh token baru di database
                                _a.sent();
                                // Set refresh token di cookies (lebih aman)
                                res.cookie("refreshToken", newRefreshToken, {
                                    httpOnly: true,
                                    secure: process.env.NODE_ENV === "production",
                                    sameSite: "strict",
                                    maxAge: 7 * 24 * 60 * 60 * 1000
                                });
                                return [2 /*return*/, res.json({ accessToken: accessToken })];
                        }
                    });
                }); });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error("Refresh Token Error:", error_2);
                return [2 /*return*/, res.status(500).json({ message: "Internal Server Error" })];
            case 3: return [2 /*return*/];
        }
    });
}); };
// export  const refreshToken = async (req : any, res : any) => {
//     try {
//         console.log("hasil token coockies :",req.cookies);
//         const refreshToken = req.cookies.refreshToken;
//         console.log("hasil refreshToken :", refreshToken);
//         if(!refreshToken) return res.status(401).json({ message: 'Session cookies empty' });
//         const user = await UserModel.findOne( { refresh_token: refreshToken });
//         if(!user) return res.status(403).json({ message: 'User empty' });
//         // Casting process.env
//         jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string, (err : any ) => 
//         {
//             if(err) return res.status(401).json({ message: 'refreshToken not verify' });
//             const userId = user._id;
//             const name = user.name;
//             const email = user.email; 
//             const accessToken = jwt.sign({ userId, name, email}, process.env.ACCESS_TOKEN_SECRET as string,{
//                 expiresIn : '25s'
//             });
//             res.json({ accessToken})
//         });
//     } catch (error) {
//         console.error("Refresh Token Error:", error);
//         return res.status(500).json({ message: "Internal Server Error" });
//     }
// }
