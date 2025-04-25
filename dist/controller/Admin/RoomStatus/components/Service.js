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
exports.RoomStatusService = void 0;
const models_RoomStatus_1 = require("../../../../models/RoomStatus/models_RoomStatus");
class RoomStatusService {
    static SetRoomStatus(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_Trx, status, bookingKey, checkIn, checkOut, roomType = [], } = data;
                // Buat array data yang akan disimpan, gabungkan properties-nya
                const statusRooms = roomType.map((room) => (Object.assign({ bookingKey,
                    id_Trx,
                    status,
                    checkIn,
                    checkOut }, room // spread semua properti dari setiap item roomType
                )));
                // Simpan semua data yang sudah digabung
                const newRoomStatus = yield models_RoomStatus_1.RoomStatusModel.insertMany(statusRooms);
                // Ambil semua _id ke dalam array
                const insertedIds = newRoomStatus.map(item => item._id);
                return {
                    message: "Successfully created room statuses",
                    status: true,
                    data: newRoomStatus,
                    roomStatusKey: insertedIds, // ✅ array berisi semua _id
                };
            }
            catch (error) {
                console.error("Error creating Room status:", error);
                return {
                    status: false,
                    message: error instanceof Error ? error.message : "Internal Server Error"
                };
            }
        });
    }
}
exports.RoomStatusService = RoomStatusService;
