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
const node_cron_1 = __importDefault(require("node-cron"));
const models_PendingRoom_1 = require("../../models/PendingRoom/models_PendingRoom");
node_cron_1.default.schedule('*/10 * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    const nowUTC = new Date(); // Waktu sekarang UTC server
    // Konversi UTC ke WIB (UTC + 7 jam)
    const wibOffset = 7 * 60 * 60 * 1000; // Offset WIB dalam milidetik (7 jam)
    const wibTime = new Date(nowUTC.getTime() + wibOffset);
    // Format WIB untuk disimpan (contoh: '2025-01-27 15:00:00')
    const wibFormatted = wibTime.toISOString().replace("T", " ").split(".")[0] + " GMT+0700 (WIB)";
    const now = wibFormatted;
    yield models_PendingRoom_1.PendingRoomModel.updateMany({ lockedUntil: { $lte: now.toString() } }, { isDeleted: true });
    console.log("Kunci stok yang sudah habis waktu berhasil dibersihkan");
}));
