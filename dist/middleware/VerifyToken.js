"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null)
        return res.status(401).json({ message: 'Your session does not exist' });
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
        return res.status(403).json({ message: "Your cookies are missing" });
    jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err)
            return res.status(401).json({ message: 'Token verification failed' });
        req.email = decoded.email ? decoded.email : 0;
        req.username = decoded.username ? decoded.username : 0;
        next();
    });
};
exports.verifyToken = verifyToken;
