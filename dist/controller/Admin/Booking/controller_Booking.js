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
exports.AdminBookingController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const models_transaksi_1 = require("../../../models/Transaction/models_transaksi");
const models_booking_1 = require("../../../models/Booking/models_booking");
const controller_invoice_1 = require("../Invoice/controller_invoice");
class AdminBookingController {
    static GetAllBooking(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bookings = yield models_booking_1.BookingModel.find({ isDeleted: false });
                const result = yield Promise.all(bookings.map((booking) => __awaiter(this, void 0, void 0, function* () {
                    const transaction = yield models_transaksi_1.TransactionModel.findOne({ booking_keyId: booking._id, isDeleted: false });
                    return Object.assign(Object.assign({}, booking.toObject()), { transactionStatus: transaction ? transaction.status : 'Suspended' });
                })));
                // Kirim hasil response
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: result,
                    success: true
                });
            }
            catch (error) {
                res.status(500).json({ message: "Failed to fetch booking", error });
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
                    orderId: TransactionId,
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
                const updatedBooking = yield models_booking_1.BookingModel.findOneAndUpdate({ orderId: TransactionId, isDeleted: false }, {
                    $set: { "verified.status": true, "verified.timeIn": Date.now() }
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
    static SetCheckOut(req, res) {
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
                    orderId: TransactionId,
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
                const updatedBooking = yield models_booking_1.BookingModel.findOneAndUpdate({ orderId: TransactionId, isDeleted: false }, {
                    $set: { "verified.status": false, "verified.timeOut": Date.now() }
                }, { new: true } // Mengembalikan data yang sudah diperbarui
                );
                if (!updatedBooking) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "Failed to update booking Check-Out status!",
                        success: false
                    });
                }
                console.log(`Booking ${updatedBooking.name} has been Check-Out`);
                return res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: { acknowledged: true },
                    message: `Successfully Check-Out Booking: ${updatedBooking.name}`,
                    success: true
                });
            }
            catch (error) {
                console.error("Error Check-Out Booking:", error);
                return res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message || "Internal Server Error",
                    success: false
                });
            }
        });
    }
    static GetTransactionById(req, res) {
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
                const Transaction = yield models_transaksi_1.TransactionModel.findOne({
                    booking_keyId: TransactionId,
                    isDeleted: false
                });
                if (!Transaction) {
                    return res.status(404).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: `Transaction ${TransactionId} not found!`,
                        success: false
                    });
                }
                console.log(`Transaction ${Transaction.name} has been get`);
                return res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: Transaction,
                    message: `Successfully get transaction detail: ${Transaction.name}`,
                    success: true
                });
            }
            catch (error) {
                console.error("Error get Transaction:", error);
                return res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message || "Internal Server Error",
                    success: false
                });
            }
        });
    }
    static GetBookingById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                // ✅ Validasi jika TransactionId tidak ada
                if (!id) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "TransactionId is required!",
                        success: false
                    });
                }
                // ✅ Cari booking berdasarkan TransactionId
                const Booking = yield models_booking_1.BookingModel.findOne({
                    orderId: id,
                    isDeleted: false
                }).select("title name email orderId");
                ;
                if (!Booking) {
                    return res.status(404).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: `Booking ${id} not found!`,
                        success: false
                    });
                }
                console.log(`Booking ${Booking.name} has been get`);
                return res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: Booking,
                    message: `Successfully get Booking detail: ${Booking.name}`,
                    success: true
                });
            }
            catch (error) {
                console.error("Error get Booking:", error);
                return res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message || "Internal Server Error",
                    success: false
                });
            }
        });
    }
    static SetOrderDish(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { dish, invoice } = req.body;
                console.log("Nanana ", invoice);
                // ✅ Validasi jika TransactionId tidak ada
                if (!id) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "TransactionId is required!",
                        success: false
                    });
                }
                const invoiceResult = yield controller_invoice_1.InvoiceController.SetInvoice(invoice);
                if (!invoiceResult.status) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: invoiceResult.message,
                        success: false
                    });
                }
                const DataDish = Object.assign(Object.assign({}, dish), { id_Invoice: invoiceResult.id_Invoice });
                // Pastikan data yang dikirim tidak kosong
                if (Object.keys(DataDish).length === 0) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        success: false,
                        message: "No data Dish for update",
                    });
                }
                const updatedRoom = yield models_booking_1.BookingModel.findByIdAndUpdate({ _id: new mongoose_1.default.Types.ObjectId(id) }, { $push: { dish: DataDish } }, { new: true, runValidators: true });
                if (!updatedRoom) {
                    return res.status(404).json({
                        requestId: (0, uuid_1.v4)(),
                        success: false,
                        message: "Booking not found",
                    });
                }
                console.log(`Dish Add to  ${updatedRoom.name} `);
                return res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: updatedRoom,
                    edit: DataDish,
                    resultInvoice: invoiceResult,
                    message: `Successfully Add Dish: ${updatedRoom.name}`,
                    success: true
                });
            }
            catch (error) {
                console.error("Error Add Dish:", error);
                return res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message || "Internal Server Error",
                    success: false
                });
            }
        });
    }
    static DeletedInvoiceBooking(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_Booking, id_Invoice } = req.params;
            try {
                const booking = yield models_booking_1.BookingModel.findOne({ _id: id_Booking, isDeleted: false });
                if (!booking) {
                    return res.status(404).json({
                        requestId: (0, uuid_1.v4)(),
                        message: "Booking not found",
                        success: false
                    });
                }
                // Temukan invoice yang akan dihapus
                const deletedInvoice = booking.invoice.find((item) => item.id === id_Invoice);
                if (!deletedInvoice) {
                    return res.status(404).json({
                        requestId: (0, uuid_1.v4)(),
                        message: 'Invoice product not found in booking!',
                        success: false
                    });
                }
                // Hapus invoice dari array dish
                booking.invoice = booking.invoice.filter((item) => item.id !== id_Invoice);
                // Simpan perubahan
                yield booking.save();
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    message: `Successfully deleted invoice: ${id_Invoice}`,
                    id_Invoice: id_Invoice,
                    data: deletedInvoice, // mengembalikan data invoice yang dihapus
                    success: true
                });
            }
            catch (error) {
                console.error(`Error deleting dish ${id_Invoice}:`, error);
                return res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    message: error.message || "Internal Server Error",
                    success: false
                });
            }
        });
    }
}
exports.AdminBookingController = AdminBookingController;
