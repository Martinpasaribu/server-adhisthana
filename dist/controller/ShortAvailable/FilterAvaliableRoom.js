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
exports.FilterAvailable = void 0;
const models_room_1 = __importDefault(require("../../models/Room/models_room"));
const models_ShortAvailable_1 = require("../../models/ShortAvailable/models_ShortAvailable");
const FilterAvailable = (checkInDate, checkOutDate) => __awaiter(void 0, void 0, void 0, function* () {
    // Query untuk mencari unavailable rooms
    const unavailableRooms = yield models_ShortAvailable_1.ShortAvailableModel.find({
        status: "PAID",
        $or: [
            {
                checkIn: { $lte: checkOutDate.toISOString() },
                checkOut: { $gte: checkInDate.toISOString() },
            },
        ],
    });
    // console.log("Room yang sudah dibooking :" , unavailableRooms)
    // console.log("format checkin:" , checkInDate.toISOString() )
    // console.log("format checkout :" , checkOutDate.toISOString() )
    const roomUsageCount = {};
    unavailableRooms.forEach((transaction) => {
        transaction.products.forEach((product) => {
            const roomId = product.roomId.toString();
            roomUsageCount[roomId] = (roomUsageCount[roomId] || 0) + product.quantity;
        });
    });
    // Ambil semua room dari database
    const allRooms = yield models_room_1.default.find({ isDeleted: false });
    // Filter room yang tersedia
    const availableRooms = allRooms.map((room) => {
        const usedCount = roomUsageCount[room._id.toString()] || 0;
        const availableCount = room.available - usedCount;
        return Object.assign(Object.assign({}, room.toObject()), { availableCount: availableCount > 0 ? availableCount : 0 });
    }).filter((room) => room.availableCount > 0);
    return availableRooms;
});
exports.FilterAvailable = FilterAvailable;
