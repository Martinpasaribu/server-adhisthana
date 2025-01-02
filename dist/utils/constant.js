"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CANCELED = exports.PAID = exports.PENDING_PAYMENT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.PENDING_PAYMENT = 'PENDING_PAYMENT';
exports.PAID = 'PAID';
exports.CANCELED = 'CANCELED';
// export const MIDTRANS_SEVER_KEY = process.env.MID
// export const MIDTRANS_APP_URL = process.env.MID
// export const FRONT_END_URL = process.env.MID
