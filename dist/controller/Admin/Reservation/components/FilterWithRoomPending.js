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
exports.ReservationService = void 0;
const SetAvailableCounts_1 = require("../../../Booking/SetAvailableCounts");
const Controller_PendingRoom_1 = require("../../../PendingRoom/Controller_PendingRoom");
const FilterAvailableRoom_1 = require("../../../ShortAvailable/FilterAvailableRoom");
class reservationService {
    // Fungsi untuk membuat Data Transaksi 
    createReservation(_a) {
        return __awaiter(this, arguments, void 0, function* ({ products, checkIn, checkOut }) {
            const RoomCanUse = yield (0, FilterAvailableRoom_1.FilterAvailable)(checkIn, checkOut);
            // Ambil hanya data room yang sesuai dari RoomCanUse berdasarkan roomId di BookingReq
            const roomDetails = RoomCanUse.filter((room) => products.some((r) => r.roomId.toString() === room._id.toString()));
            if (!roomDetails) {
                // return res.status(400).json({ status: 'error', message: `Filter Room Available not found` });
                throw new Error('Filter Room Available not found');
            }
            // Validate again room availability
            for (const roomBooking of products) {
                const room = roomDetails.find(r => r._id.toString() === roomBooking.roomId.toString());
                if (!room) {
                    // return res.status(400).json({ status: 'error', message: `Room with ID ${roomBooking.roomId} not found` });
                    throw new Error(`Room with ID ${roomBooking.roomId} not found`);
                }
                // Check if the room is sold out or requested quantity exceeds availability
                if (room.available <= 0) {
                    // return res.status(400).json({ status: 'error', message: `Room with ID ${roomBooking.roomId} is sold out` });
                    throw new Error(`Room with ID ${roomBooking.roomId} is sold out`);
                }
                if (roomBooking.quantity > room.available) {
                    // return res.status(400).json({ 
                    //     status: 'error', 
                    //     message: `Room with ID ${roomBooking.roomId} has only ${room.available} available, but you requested ${roomBooking.quantity}` 
                    // });
                    throw new Error(`Room with ID ${roomBooking.roomId} has only ${room.available} available, but you requested ${roomBooking.quantity}`);
                }
            }
            // Filter Room dari req Booking dari ketersedia room dan menambahkan poerpty stock ketersedian room dengan range tanggal tersebut
            const RoomsAvailableCount = yield (0, SetAvailableCounts_1.SetAvailableCount)(products, checkIn, checkOut);
            // Filter Is there a pending room?
            const availableRoomsWithoutPending = yield Controller_PendingRoom_1.PendingRoomController.FilterForUpdateVilaWithPending(RoomsAvailableCount, checkIn, checkOut);
            if ((availableRoomsWithoutPending === null || availableRoomsWithoutPending === void 0 ? void 0 : availableRoomsWithoutPending.PendingRoom.length) > 0) {
                // return res.status(400).json({ status: 'error', message: `Some of the rooms you select have already been purchased`, data :availableRoomsWithoutPending?.PendingRoom });
                throw new Error(`Some of the rooms you select have already been purchased`);
            }
            console.log(` hasil filter reservation dengan room pending : ${availableRoomsWithoutPending.PendingRoom}`);
            return availableRoomsWithoutPending;
        });
    }
}
exports.ReservationService = new reservationService();
