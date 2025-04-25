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
exports.DeletePendingRoomPermanently = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const models_PendingRoom_1 = require("../../models/PendingRoom/models_PendingRoom");
const models_ShortAvailable_1 = require("../../models/ShortAvailable/models_ShortAvailable");
const models_transaksi_1 = require("../../models/Transaction/models_transaksi");
const models_booking_1 = require("../../models/Booking/models_booking");
node_cron_1.default.schedule('*/5 * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const nowUTC = new Date(); // Waktu sekarang UTC server
        // Konversi UTC ke WIB (UTC + 7 jam)
        const wibOffset = 7 * 60 * 60 * 1000; // Offset WIB dalam milidetik (7 jam)
        const wibTime = new Date(nowUTC.getTime() + wibOffset);
        // Format WIB untuk disimpan (contoh: '2025-01-27 15:00:00')
        const now = wibTime.toISOString().replace("T", " ").split(".")[0] + " GMT+0700 (WIB)";
        // Ambil semua data yang lockedUntil <= sekarang
        const expiredRooms = yield models_PendingRoom_1.PendingRoomModel.find({
            lockedUntil: { $lte: now },
            isDeleted: false,
        }).select('bookingId'); // Hanya ambil bookingId
        // Ambil hanya ID unik dari expiredRooms
        const uniqueBookingIds = [...new Set(expiredRooms.map((item) => item.bookingId.toString()))];
        console.log('Booking ID yang expired:', uniqueBookingIds);
        // Cari ID yang masih aktif di ShortAvailableModel
        // cari cara yang lebih effesian
        const existingShorts = yield models_ShortAvailable_1.ShortAvailableModel.find({ transactionId: { $in: uniqueBookingIds }, isDeleted: false }, 'transactionId' // hanya ambil id-nya
        );
        // Ambil hanya ID dari hasil query ShortAvailable
        const blockedIds = existingShorts.map((item) => item.transactionId.toString());
        // Filter ID yang tidak muncul di blockedIds
        const deletableIds = uniqueBookingIds.filter((id) => !blockedIds.includes(id));
        console.log('Booking ID yang BOLEH dihapus:', deletableIds);
        // await PendingRoomModel.updateMany(
        //   { lockedUntil: { $lte: now.toString() } },
        //   { isDeleted: true }
        // );
        // Jalankan proses penghapusan data lain berdasarkan bookingId
        // for (const id of uniqueBookingIds) {
        //   try {
        //     await DeletedBookingTransaction(id);
        //     console.log(`Sukses hapus transaksi terkait BookingID: ${id}`);
        //   } catch (err) {
        //     console.error(`Gagal hapus transaksi BookingID ${id}:`, (err as Error).message);
        //   }
        // }
        if (uniqueBookingIds.length > 0) {
            yield Promise.all(uniqueBookingIds.map((id) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    yield DeletedBookingTransaction(id);
                    yield (0, exports.DeletePendingRoomPermanently)(id);
                    console.log(`Sukses hapus transaksi terkait BookingID: ${id}`);
                }
                catch (err) {
                    console.error(`Gagal hapus transaksi BookingID ${id}:`, err.message);
                }
            })));
        }
        console.log("Proses pembersihan stok dan data selesai.");
    }
    catch (error) {
        console.error("Error saat menjalankan cron job PendingRoom:", error);
    }
}));
const DeletedBookingTransaction = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let ShortAvailable;
        let Transaction;
        let Booking;
        Transaction = yield models_transaksi_1.TransactionModel.findOneAndUpdate({ bookingId: id }, { isDeleted: false }, { new: true, runValidators: true });
        if (!Transaction) {
            throw new Error('Transaction not found.');
        }
        yield models_transaksi_1.TransactionModel.updateMany({ bookingId: id }, { isDeleted: true });
        Booking = yield models_booking_1.BookingModel.findOneAndUpdate({ orderId: id }, { isDeleted: false }, { new: true, runValidators: true });
        if (!Booking) {
            throw new Error('Booking not found.');
        }
        yield models_booking_1.BookingModel.updateMany({ orderId: id }, { isDeleted: true });
        console.log(`Successfully Deleted Transaction : ${Transaction.name} `);
    }
    catch (error) {
        const message = error.message;
        throw new Error(`Error : ${message} `);
    }
});
const DeletePendingRoomPermanently = (bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Cari dulu apakah ada datanya
        const pendingData = yield models_PendingRoom_1.PendingRoomModel.findOne({ bookingId });
        if (!pendingData) {
            throw new Error('PendingRoom data not found.');
        }
        // Hapus semua data berdasarkan bookingId
        yield models_PendingRoom_1.PendingRoomModel.deleteMany({ bookingId });
        console.log(`✅ Data PendingRoom dengan bookingId ${bookingId} berhasil dihapus secara permanen.`);
        return { message: 'Success delete permanently', bookingId };
    }
    catch (error) {
        const message = error.message;
        console.error(`❌ Error saat menghapus PendingRoom: ${message}`);
        throw new Error(`Error deleting PendingRoom: ${message}`);
    }
});
exports.DeletePendingRoomPermanently = DeletePendingRoomPermanently;
