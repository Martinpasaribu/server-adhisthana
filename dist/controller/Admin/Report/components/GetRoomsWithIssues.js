"use strict";
// Model: BookingModel
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
exports.getRoomsWithIssues = getRoomsWithIssues;
const models_RoomCondition_1 = require("../../../../models/RoomCondition/models_RoomCondition");
function getRoomsWithIssues() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Ambil semua data yang belum dihapus
            const allData = yield models_RoomCondition_1.RoomConditionModel.find({
                isDeleted: false
            }).lean();
            const result = [];
            for (const item of allData) {
                // Filter hanya rooms dengan status ≠ "bisa"
                const filteredRooms = item.rooms.filter(room => room.status !== 'bisa');
                // Jika ada room yang tidak "bisa", push ke hasil
                if (filteredRooms.length > 0) {
                    result.push({
                        category: item.category,
                        createdAt: item.createdAt, // ✅ tambahkan ini
                        rooms: filteredRooms.map(({ vila, name, status, date }) => ({
                            vila,
                            name,
                            status,
                            date
                        }))
                    });
                }
            }
            return result;
        }
        catch (error) {
            console.error('Gagal mengambil data kamar bermasalah:', error);
            throw error;
        }
    });
}
// ✨ Opsional Versi Aggregation MongoDB (lebih cepat)
// Jika kamu ingin versi performa tinggi langsung di MongoDB:
// ts
// Salin
// Edit
// const result = await BookingModel.aggregate([
//   { $match: { isDeleted: false } },
//   {
//     $project: {
//       category: 1,
//       rooms: {
//         $filter: {
//           input: "$rooms",
//           as: "room",
//           cond: { $ne: ["$$room.status", "bisa"] }
//         }
//       }
//     }
//   },
//   { $match: { "rooms.0": { $exists: true } } } // hanya data yang punya room bermasalah
// ])
