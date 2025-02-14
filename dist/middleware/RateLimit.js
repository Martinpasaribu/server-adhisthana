"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 5, // Maksimum 5 percobaan dalam 15 menit
    message: { message: "Too many login attempts. Try again later." },
    standardHeaders: true, // Mengembalikan informasi limit di header
    legacyHeaders: false, // Nonaktifkan header `X-RateLimit-*`
});
// express-rate-limit digunakan untuk membatasi jumlah permintaan (request) yang dapat dilakukan oleh satu IP dalam jangka waktu tertentu. Ini berguna untuk mencegah brute-force attack, spam, atau penyalahgunaan API.
// Bagaimana Ini Melindungi dari Hacker?
// Mencegah brute-force attack:
// Jika hacker mencoba menebak password dengan banyak request, maka setelah 5 percobaan dalam 15 menit, mereka akan diblokir.
// Mengurangi spam & abuse:
// Membatasi jumlah request mencegah penyalahgunaan API.
// Mengurangi beban server:
// Server tidak akan kewalahan menerima banyak request dari bot atau user yang mencoba login terus-menerus.
