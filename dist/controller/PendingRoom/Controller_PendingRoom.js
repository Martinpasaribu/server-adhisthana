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
                const now = new Date();
                // const EndLockedUntil = new Date(now.getTime() + 7 * 60 * 1000); // Menambah 7 menit
                // const options = { timeZone: "Asia/Jakarta" };
                // const lockedUntilWIB = new Date(
                //     EndLockedUntil.toLocaleString("en-US", options)
                // );
                const wibOffset = 7 * 60; // Offset dalam menit
                const localOffset = now.getTimezoneOffset(); // Offset sistem lokal dalam menit
                const wibTime = new Date(now.getTime() + (wibOffset - localOffset) * 60 * 1000);
                const lockedUntil = wibTime.toString();
                console.log(` Data Pending room Date lockedUntil ${lockedUntil}: `);
                // Iterasi melalui setiap room
                for (const r of room) {
                    // Pastikan room memiliki properti yang diperlukan
                    if (!r.roomId || !r.quantity) {
                        return res.status(400).json({ message: `Room data is invalid for roomId: ${r.roomId}` });
                    }
                    // Mengatur zona waktu WIB secara manual
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
    static FilterWithPending(rooms, dateIn, dateOut, req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const start = new Date(dateIn);
            const end = new Date(dateOut);
            try {
                const nowWIB = new Date();
                // Pastikan zona waktu sesuai WIB
                // const options = { timeZone: "Asia/Jakarta" };
                // const now = new Date(nowWIB.toLocaleString("en-US", options));
                const options = { timeZone: "Asia/Jakarta" };
                const now = new Intl.DateTimeFormat("en-US", options).format(nowWIB);
                const DataPendingRoom = yield models_PendingRoom_1.PendingRoomModel.find({
                    $or: [
                        {
                            start: { $lte: end.toISOString() },
                            end: { $gte: start.toISOString() },
                            lockedUntil: { $gte: now.toString() }
                        },
                    ],
                    isDeleted: false
                });
                // console.log(` Data Pending room start ${dateIn}, end ${dateOut} : `, DataPendingRoom)
                // console.log(` Data Pending room Now ${now}: `, DataPendingRoom)
                console.log(` Data Filter Pending room Date Now ${now}: `);
                // console.log(` Data room Now : `, rooms)
                const WithoutPending = rooms.filter((room) => {
                    return !DataPendingRoom.some((data) => {
                        var _a;
                        const roomId = room._id ? room._id.toString() : room.roomId; // Jika `_id` tidak ada, gunakan `roomId`
                        return data.roomId === roomId && data.stock >= ((_a = room.availableCount) !== null && _a !== void 0 ? _a : room.quantity);
                    });
                });
                const PendingRoom = rooms.filter((room) => {
                    return DataPendingRoom.some((data) => {
                        var _a;
                        const roomId = room._id ? room._id.toString() : room.roomId; // Sama seperti di atas
                        return data.roomId === roomId && data.stock >= ((_a = room.availableCount) !== null && _a !== void 0 ? _a : room.quantity);
                    });
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
                const ResultUpdate = models_PendingRoom_1.PendingRoomModel.findOneAndUpdate({ roomId: TransactionId, isDeleted: false }, { isDeleted: true });
                console.log(" Data Room Pending has update ", ResultUpdate);
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    ;
}
exports.PendingRoomController = PendingRoomController;
