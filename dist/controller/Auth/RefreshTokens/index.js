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
exports.refreshTokenAdmin = exports.refreshToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const models_user_1 = __importDefault(require("../../../models/User/models_user"));
const models_admin_1 = __importDefault(require("../../../models/Admin/models_admin"));
dotenv_1.default.config();
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Cookies:", req.cookies);
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: "Session cookies empty" });
        }
        // Cari user berdasarkan refresh token
        const user = yield models_user_1.default.findOne({ refresh_token: refreshToken });
        if (!user) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }
        // Verifikasi refresh token
        jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                return res.status(403).json({ message: "Refresh token not verified" });
            }
            // Buat access token baru
            const userId = user._id;
            const name = user.name;
            const email = user.email;
            const accessToken = jsonwebtoken_1.default.sign({ userId, name, email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "5m" } // **Diperpanjang menjadi 5 menit**
            );
            return res.json({ accessToken });
        }));
    }
    catch (error) {
        console.error("Refresh Token Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.refreshToken = refreshToken;
const refreshTokenAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Cookies:", req.cookies);
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: "Session cookies empty" });
        }
        // Cari user berdasarkan refresh token
        const admin = yield models_admin_1.default.findOne({ refresh_token: refreshToken });
        if (!admin) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }
        // Verifikasi refresh token
        jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                return res.status(403).json({ message: "Refresh token not verified" });
            }
            // Buat access token baru
            const userId = admin._id;
            const username = admin.username;
            const role = admin.role;
            const accessToken = jsonwebtoken_1.default.sign({ userId, username, role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "25s" } // **Diperpanjang menjadi 15 menit**
            );
            return res.json({ accessToken });
        }));
    }
    catch (error) {
        console.error("Refresh Token Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.refreshTokenAdmin = refreshTokenAdmin;
// export  const refreshTokenAdmin = async (req : any, res : any) => {
//     try {
//         console.log("Cookies:", req.cookies);
//         const refreshToken = req.cookies.refreshToken;
//         if (!refreshToken) {
//             return res.status(401).json({ message: "Session cookies empty" });
//         }
//         // Cari user berdasarkan refresh token
//         const admin = await AdminModel.findOne({ refresh_token: refreshToken });
//         if (!admin) {
//             return res.status(403).json({ message: "Invalid refresh token" });
//         }
//         // Verifikasi refresh token
//         jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string, async (err: any) => {
//             if (err) {
//                 return res.status(403).json({ message: "Refresh token not verified" });
//             }
//             // Buat access token baru
//             const userId = admin._id;
//             const username = admin.username;
//             const role = admin.role;
//             const accessToken = jwt.sign(
//                 { userId, username, role },
//                 process.env.ACCESS_TOKEN_SECRET as string,
//                 { expiresIn: "25s" } // **Diperpanjang menjadi 15 menit**
//             );
//             // // **Ganti Refresh Token Lama**
//             // const newRefreshToken = jwt.sign(
//             //     { userId },
//             //     process.env.REFRESH_TOKEN_SECRET as string,
//             //     { expiresIn: "1d" } // **Berlaku 7 hari**
//             // );
//             // // Simpan refresh token baru di database
//             // await AdminModel.updateOne(
//             //     { _id: userId },
//             //     { refresh_token: newRefreshToken }
//             // );
//             // // Set refresh token di cookies (lebih aman)
//             // res.cookie("refreshToken", newRefreshToken, {
//             //     httpOnly: true,
//             //     secure: process.env.NODE_ENV === "production", // Hanya aktif di HTTPS
//             //     sameSite: 'None', 
//             //     // sameSite: "strict",
//             //     maxAge:  24 * 60 * 60 * 1000, // 7 hari
//             // });
//             return res.json({ accessToken, role });
//         });
//     } catch (error) {
//         console.error("Refresh Token Error:", error);
//         return res.status(500).json({ message: "Internal Server Error" });
//     }
// }
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
