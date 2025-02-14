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
exports.AdminCustomerController = void 0;
const uuid_1 = require("uuid");
const models_booking_1 = require("../../../models/Booking/models_booking");
const models_contact_1 = require("../../../models/Contact/models_contact");
class AdminCustomerController {
    static GetMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const filterQuery = {
                    isDeleted: false,
                };
                // Query untuk TransactionModel (ambil semua data)
                const Message = yield models_contact_1.ContactModel.find(filterQuery);
                // console.log('data availble transactions :', transactions);
                // Kirim hasil response
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: Message,
                    success: true
                });
            }
            catch (error) {
                res.status(500).json({ message: "Failed to fetch Message", error });
            }
        });
    }
    static SetVerified(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { TransactionId } = req.params;
                // ✅ Validasi jika TransactionId tidak ada
                if (!TransactionId) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "TransactionId is required!",
                        success: false
                    });
                }
                // ✅ Cari booking berdasarkan TransactionId
                const BookingReservation = yield models_booking_1.BookingModel.findOne({
                    oderId: TransactionId,
                    isDeleted: false
                });
                if (!BookingReservation) {
                    return res.status(404).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "Booking not found!",
                        success: false
                    });
                }
                // ✅ Update status verified
                const updatedBooking = yield models_booking_1.BookingModel.findOneAndUpdate({ oderId: TransactionId, isDeleted: false }, {
                    verified: { status: true, time: Date.now() }
                }, { new: true } // Mengembalikan data yang sudah diperbarui
                );
                if (!updatedBooking) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "Failed to update booking verification status!",
                        success: false
                    });
                }
                console.log(`Booking ${updatedBooking.name} has been verified`);
                return res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: { acknowledged: true },
                    message: `Successfully verified Booking: ${TransactionId}`,
                    success: true
                });
            }
            catch (error) {
                console.error("Error verifying Booking:", error);
                return res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message || "Internal Server Error",
                    success: false
                });
            }
        });
    }
}
exports.AdminCustomerController = AdminCustomerController;
