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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRefund = void 0;
const UpdateRefund = (DataRoom, DataByDate, night, checkin) => __awaiter(void 0, void 0, void 0, function* () {
    if (!DataRoom.length) {
        throw new Error("Data booking tidak ditemukan");
    }
    // Menghitung total harga berdasarkan roomId dan tanggal check-in
    return DataRoom.reduce((total, room) => {
        var _a;
        let totalHargaRoom = 0;
        // Menghitung harga per malam
        for (let i = 0; i < night; i++) {
            // Mendapatkan tanggal untuk malam ke-i (misalnya, jika check-in 1 Maret dan malam ke-0 adalah 1 Maret, malam ke-1 adalah 2 Maret, dll)
            const currentDate = new Date(checkin);
            currentDate.setDate(currentDate.getDate() + i); // Menambahkan i hari ke tanggal check-in
            // Cari harga berdasarkan roomId dan tanggal yang sesuai
            const harga = ((_a = DataByDate.find((data) => data.roomId === room.roomId && new Date(data.date).toDateString() === currentDate.toDateString())) === null || _a === void 0 ? void 0 : _a.price) || 0;
            totalHargaRoom += harga; // Menambahkan harga per malam
        }
        // Menghitung total harga dengan mempertimbangkan jumlah kamar
        return total + totalHargaRoom * room.quantity;
    }, 0);
});
exports.UpdateRefund = UpdateRefund;
