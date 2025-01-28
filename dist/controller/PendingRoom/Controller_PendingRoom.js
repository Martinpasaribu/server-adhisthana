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
exports.PendingRoomController = void 0;
const models_PendingRoom_1 = require("../../models/PendingRoom/models_PendingRoom");
class PendingRoomController {
    static SetPending(room, bookingId, userId, dateIn, dateOut, req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validasi input
                if (!userId || !room || !dateIn || !dateOut) {
                    return res.status(400).json({ message: 'Room, date, or userId is not available' });
                }
                const nowUTC = new Date(); // Waktu sekarang UTC server
                // Konversi UTC ke WIB (UTC + 7 jam)
                const wibOffset = 7 * 60 * 60 * 1000; // Offset WIB dalam milidetik (7 jam)
                const wibTime = new Date(nowUTC.getTime() + wibOffset);
                // Menambahkan 5 menit ke waktu WIB
                wibTime.setMinutes(wibTime.getMinutes() + 5);
                // Format WIB untuk disimpan (contoh: '2025-01-27 15:00:00')
                const wibFormatted = wibTime.toISOString().replace("T", " ").split(".")[0] + " GMT+0700 (WIB)";
                const lockedUntil = wibFormatted;
                // console.log(` Data SetPending room Date lockedUntil ${lockedUntil}: `)
                // Iterasi melalui setiap room
                for (const r of room) {
                    // Pastikan room memiliki properti yang diperlukan
                    if (!r.roomId || !r.quantity) {
                        return res.status(400).json({ message: `Room data is invalid for roomId: ${r.roomId}` });
                    }
                    // Buat entri baru di PendingRoomModel
                    yield models_PendingRoom_1.PendingRoomModel.create({
                        bookingId,
                        userId,
                        roomId: r.roomId,
                        start: dateIn,
                        end: dateOut,
                        stock: r.quantity,
                        lockedUntil
                    });
                }
            }
            catch (error) {
                console.error(error);
                throw new Error('Function SetPending not implemented.');
            }
        });
    }
    static FilterForUpdateBookingWithPending(rooms, dateIn, dateOut, req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const start = new Date(dateIn);
            const end = new Date(dateOut);
            try {
                const nowUTC = new Date(); // Waktu sekarang UTC server
                // Konversi UTC ke WIB (UTC + 7 jam)
                const wibOffset = 7 * 60 * 60 * 1000; // Offset WIB dalam milidetik (7 jam)
                const wibTime = new Date(nowUTC.getTime() + wibOffset);
                // Format WIB untuk disimpan (contoh: '2025-01-27 15:00:00')
                const wibFormatted = wibTime.toISOString().replace("T", " ").split(".")[0] + " GMT+0700 (WIB)";
                const now = wibFormatted;
                const DataPendingRoom = yield models_PendingRoom_1.PendingRoomModel.find({
                    $or: [
                        {
                            start: { $lte: end.toISOString() },
                            end: { $gte: start.toISOString() },
                            lockedUntil: { $gte: now }
                        },
                    ],
                    isDeleted: false
                });
                // console.log(` Data Pending room start ${dateIn}, end ${dateOut} : `, DataPendingRoom)
                // console.log(` Data Pending room Now ${now}: `, DataPendingRoom)
                console.log(` Data Filter Pending room Date Now ${now}: `);
                // console.log(` Data room Now : `, rooms)
                const PendingRoom = rooms.filter((room) => {
                    var _a;
                    const roomId = room._id ? room._id.toString() : room.roomId;
                    // Hitung total stock untuk roomId yang sama di DataPendingRoom
                    const totalStock = DataPendingRoom
                        .filter((data) => data.roomId === roomId) // Ambil data dengan roomId yang sama
                        .reduce((sum, data) => sum + data.stock, 0); // Jumlahkan stock
                    // Periksa apakah totalStock lebih besar atau sama dengan availableCount
                    return totalStock >= ((_a = room.availableCount) !== null && _a !== void 0 ? _a : room.quantity);
                });
                // console.log(" result filter Pending room : ", availableRoomsWithoutPending)
                // console.log(" result filter PendingRoom : ", PendingRoom)
                const result = {
                    PendingRoom
                };
                return result;
            }
            catch (error) {
                console.error(error);
                throw new Error('Function SetPending not implemented.');
            }
        });
    }
    ;
    static FilterForUpdateVilaWithPending(rooms, dateIn, dateOut, req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const start = new Date(dateIn);
            const end = new Date(dateOut);
            try {
                const nowUTC = new Date(); // Waktu sekarang UTC server
                // Konversi UTC ke WIB (UTC + 7 jam)
                const wibOffset = 7 * 60 * 60 * 1000; // Offset WIB dalam milidetik (7 jam)
                const wibTime = new Date(nowUTC.getTime() + wibOffset);
                // Format WIB untuk disimpan (contoh: '2025-01-27 15:00:00')
                const wibFormatted = wibTime.toISOString().replace("T", " ").split(".")[0] + " GMT+0700 (WIB)";
                const now = wibFormatted;
                const DataPendingRoom = yield models_PendingRoom_1.PendingRoomModel.find({
                    $or: [
                        {
                            start: { $lte: end.toISOString() },
                            end: { $gte: start.toISOString() },
                            lockedUntil: { $gte: now }
                        },
                    ],
                    isDeleted: false
                });
                // console.log(` Data Pending room start ${dateIn}, end ${dateOut} : `, DataPendingRoom)
                // console.log(` Data Pending room Now ${now}: `, DataPendingRoom)
                // console.log(` Data Filter Pending room Date Now ${now}: `)
                // console.log(` Data room Now : `, rooms)
                const UpdatedRooms = rooms.filter((room) => {
                    var _a;
                    const roomId = room._id ? room._id.toString() : room.roomId;
                    // Hitung total stock untuk roomId yang sama di DataPendingRoom
                    const totalStock = DataPendingRoom
                        .filter((data) => data.roomId === roomId) // Ambil data dengan roomId yang sama
                        .reduce((sum, data) => sum + data.stock, 0); // Jumlahkan stock
                    // Periksa apakah availableCount lebih besar dari totalStock
                    return ((_a = room.availableCount) !== null && _a !== void 0 ? _a : room.quantity) > totalStock;
                });
                // 1. Kelompokkan DataPendingRoom berdasarkan roomId
                const groupedPendingStock = DataPendingRoom.reduce((acc, data) => {
                    const roomId = data.roomId;
                    if (!acc[roomId]) {
                        acc[roomId] = 0;
                    }
                    acc[roomId] += data.stock; // Jumlahkan stock untuk setiap roomId
                    return acc;
                }, {});
                //   console.log(" result filter groupedPendingStock : ", groupedPendingStock)
                // 2. Filter dan perbarui rooms
                const WithoutPending = UpdatedRooms.filter((room) => {
                    var _a;
                    const roomId = room._id ? room._id.toString() : room.roomId;
                    return !groupedPendingStock[roomId] || groupedPendingStock[roomId] < ((_a = room.availableCount) !== null && _a !== void 0 ? _a : room.quantity);
                }).map((room) => {
                    var _a;
                    const roomId = room._id ? room._id.toString() : room.roomId;
                    const pendingStock = groupedPendingStock[roomId] || 0; // Ambil stock pending jika ada
                    return Object.assign(Object.assign({}, room), { availableCount: ((_a = room.availableCount) !== null && _a !== void 0 ? _a : room.quantity) - pendingStock });
                });
                // console.log(" result filter WithoutPending : ", WithoutPending)
                const PendingRoom = rooms.filter((room) => {
                    var _a;
                    const roomId = room._id ? room._id.toString() : room.roomId;
                    // Hitung total stock untuk roomId yang sama di DataPendingRoom
                    const totalStock = DataPendingRoom
                        .filter((data) => data.roomId === roomId) // Ambil data dengan roomId yang sama
                        .reduce((sum, data) => sum + data.stock, 0); // Jumlahkan stock
                    // Periksa apakah totalStock lebih besar atau sama dengan availableCount
                    return totalStock >= ((_a = room.availableCount) !== null && _a !== void 0 ? _a : room.quantity);
                });
                // console.log(" result filter Pending room : ", availableRoomsWithoutPending)
                // console.log(" result filter PendingRoom : ", PendingRoom)
                const result = {
                    WithoutPending,
                    PendingRoom
                };
                return result;
            }
            catch (error) {
                console.error(error);
                throw new Error('Function SetPending not implemented.');
            }
        });
    }
    ;
    static UpdatePending(TransactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Menunggu hasil pembaruan dengan `await`
                const ResultUpdate = yield models_PendingRoom_1.PendingRoomModel.findOneAndUpdate({ bookingId: TransactionId, isDeleted: false }, { isDeleted: true }, { new: true } // Mengembalikan data yang diperbarui
                );
                // Memeriksa apakah data berhasil diperbarui
                if (ResultUpdate) {
                    // console.log("Data Room Pending has been updated", ResultUpdate);
                    const message = `Transaction: ${TransactionId} set no pending`;
                    return message;
                }
                else {
                    const message = `Transaction: ${TransactionId} not found or already deleted`;
                    console.warn(message);
                    return message;
                }
            }
            catch (error) {
                console.error("Error updating room pending:", error);
                const message = `Transaction: ${TransactionId} error setting no pending: ${error}`;
                return message;
            }
        });
    }
}
exports.PendingRoomController = PendingRoomController;
