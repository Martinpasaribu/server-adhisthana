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
exports.refreshToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const models_user_1 = __importDefault(require("../../models/User/models_user"));
dotenv_1.default.config();
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("hasil token coockies :", req.cookies);
        const refreshToken = req.cookies.refreshToken;
        console.log("hasil refreshToken :", refreshToken);
        if (!refreshToken)
            return res.status(401).json({ message: 'Session cookies empty' });
        const user = yield models_user_1.default.findOne({ refresh_token: refreshToken });
        if (!user)
            return res.status(404).json({ message: 'User empty' });
        // Casting process.env
        jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err) => {
            if (err)
                return res.status(401).json({ message: 'refreshToken not verify' });
            const userId = user._id;
            const name = user.name;
            const email = user.email;
            const accessToken = jsonwebtoken_1.default.sign({ userId, name, email }, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '25s'
            });
            res.json({ accessToken });
        });
    }
    catch (error) {
        console.log(error);
    }
});
exports.refreshToken = refreshToken;
