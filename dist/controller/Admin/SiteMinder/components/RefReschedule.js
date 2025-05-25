"use strict";
// Helper function untuk generate date range
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
exports.DeletedDataALL = exports.RefReschedule = void 0;
const models_booking_1 = require("../../../../models/Booking/models_booking");
const models_RoomStatus_1 = require("../../../../models/RoomStatus/models_RoomStatus");
const models_ShortAvailable_1 = require("../../../../models/ShortAvailable/models_ShortAvailable");
const models_transaksi_1 = require("../../../../models/Transaction/models_transaksi");
const RefReschedule = (id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let Booking;
    let BookingMain = false;
    let BookingReschedule = false;
    Booking = yield models_booking_1.BookingModel.findOne({ orderId: id, isDeleted: false });
    if (!Booking) {
        throw new Error(`Booking not found in Ref Reschedule :${id}`);
    }
    if ((_a = Booking.reschedule) === null || _a === void 0 ? void 0 : _a.status) {
        // Jika key sama berarti ini main booking-nya
        if (Booking.reschedule.key_reschedule === id) {
            // Menghapus data Booking Reschedule
            const BookingRes = yield models_booking_1.BookingModel.find({
                isDeleted: false,
                "reschedule.key_reschedule": id
            }, {
                _id: 1,
                reschedule: 1
            });
            if (!BookingRes || BookingRes.length !== 2) {
                throw new Error(`Expected 2 bookings with key_reschedule: ${id}, got ${BookingRes.length}`);
            }
            // Pisahkan menjadi main dan reschedule
            const mainBooking = BookingRes.find(item => item._id.toString() === id);
            const rescheduleBooking = BookingRes.find(item => item._id.toString() !== id);
            // Validasi hasil
            if (!mainBooking || !rescheduleBooking) {
                throw new Error("Could not separate bookings correctly");
            }
            // Output hasil
            console.log("Main Booking:", mainBooking);
            console.log("Reschedule Booking:", rescheduleBooking);
            // Panggil fungsi untuk menghapus seluruh data rescheduleBooking terkait
            yield (0, exports.DeletedDataALL)(rescheduleBooking);
            BookingMain = true;
        }
        // Jika key tidak sama berarti ini booking reschedulenya 
        else if (Booking.reschedule.key_reschedule != id) {
            // Hapus data booking reschedulenya 
            yield (0, exports.DeletedDataALL)(Booking.reschedule.key_reschedule);
            // await DeletedDataALL(Booking.resc || "");
            BookingReschedule = true;
        }
        else {
            console.log('Hasil deleted reschedule tidak diketahui');
        }
    }
    else {
        console.log(" Tidak ada informasi reschedule");
        BookingMain = true;
    }
    const response = {
        BookingMain, BookingReschedule
    };
    return response;
});
exports.RefReschedule = RefReschedule;
const DeletedDataALL = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield models_transaksi_1.TransactionModel.updateMany({ bookingId: id }, { isDeleted: true });
    yield models_ShortAvailable_1.ShortAvailableModel.updateMany({ transactionId: id }, { isDeleted: true });
    yield models_booking_1.BookingModel.updateMany({ orderId: id }, { isDeleted: true });
    yield models_RoomStatus_1.RoomStatusModel.updateMany({ id_Trx: id }, { isDeleted: true });
});
exports.DeletedDataALL = DeletedDataALL;
