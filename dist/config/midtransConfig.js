"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.snap = void 0;
// @ts-ignore
const midtrans_client_1 = __importDefault(require("midtrans-client"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.snap = new midtrans_client_1.default.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
});
