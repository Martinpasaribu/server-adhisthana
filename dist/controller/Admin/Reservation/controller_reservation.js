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
exports.ReservationController = void 0;
const uuid_1 = require("uuid");
const crypto_1 = __importDefault(require("crypto"));
const models_transaksi_1 = require("../../../models/Transaction/models_transaksi");
const Index_1 = require("./components/Index");
const FilterWithRoomPending_1 = require("./components/FilterWithRoomPending");
const Controller_PendingRoom_1 = require("../../PendingRoom/Controller_PendingRoom");
const controller_short_1 = require("../../ShortAvailable/controller_short");
const constant_1 = require("../../../constant");
const models_booking_1 = require("../../../models/Booking/models_booking");
class ReservationController {
    static GetAllTransactionReservation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const AvailableRoom = await ShortAvailableModel.find(
                //   {
                //     status: { $in: ["PAID", "PAYMENT_ADMIN"] },
                //     isDeleted: false
                //   },
                //   { bookingId: 1, _id: 0 }
                // );
                // // Ambil hanya transactionId dari AvailableRoom
                // const transactionIds = AvailableRoom.map(room => room.bookingId);
                const filterQuery = {
                    status: { $in: [constant_1.PAYMENT_ADMIN, constant_1.PAID_ADMIN] },
                    reservation: true,
                    isDeleted: false,
                    // bookingId: { $in: transactionIds } // Mencocokkan bookingId dengan transactionId
                };
                // Query untuk TransactionModel (ambil semua data)
                const transactions = yield models_transaksi_1.TransactionModel.find(filterQuery);
                // console.log('data availble transactions :', transactions);
                // Kirim hasil response
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: transactions,
                    success: true
                });
            }
            catch (error) {
                res.status(500).json({ message: "Failed to fetch transactions", error });
            }
        });
    }
    static AddTransaction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Destructure req.body
                const { title, name, email, phone, grossAmount, reservation, products, night, checkIn, checkOut } = req.body;
                // ✅ Validasi data sebelum disimpan
                if (!title || !name || !email || !phone || !grossAmount || !checkIn || !checkOut) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "All required fields must be provided!",
                        success: false
                    });
                }
                // Cek Roompending sebelum membuat reservation transaction 
                const ReservationReadyToBeSaved = yield FilterWithRoomPending_1.ReservationService.createReservation({ products, checkIn, checkOut });
                if (ReservationReadyToBeSaved.WithoutPending === 0) {
                }
                // Set Up Data Lain
                const bookingId = 'TRX-' + crypto_1.default.randomBytes(5).toString('hex');
                const status = constant_1.PAYMENT_ADMIN;
                // Daftarkan terlebih dahulu usernya
                const IsHaveAccount = yield (0, Index_1.CekUser)(email);
                let userId;
                if (!IsHaveAccount) {
                    userId = yield (0, Index_1.Register)(title, name, email, phone);
                }
                // ✅ Buat objek baru berdasarkan schema
                const newBooking = new models_booking_1.BookingModel({
                    oderId: bookingId,
                    userId: IsHaveAccount !== null && IsHaveAccount !== void 0 ? IsHaveAccount : userId,
                    status,
                    title,
                    name,
                    email,
                    phone,
                    amountTotal: grossAmount,
                    reservation,
                    room: ReservationReadyToBeSaved.WithoutPending,
                    night,
                    checkIn,
                    checkOut
                });
                // ✅ Simpan ke database Booking
                const savedBooking = yield newBooking.save();
                console.log(" add transaction with reservation : ", savedBooking);
                // ✅ Buat objek baru berdasarkan schema
                const newTransaction = new models_transaksi_1.TransactionModel({
                    booking_keyId: savedBooking._id,
                    bookingId,
                    userId: IsHaveAccount !== null && IsHaveAccount !== void 0 ? IsHaveAccount : userId,
                    status,
                    title,
                    name,
                    email,
                    phone,
                    grossAmount,
                    reservation,
                    products: ReservationReadyToBeSaved.WithoutPending,
                    night,
                    checkIn,
                    checkOut
                });
                // ✅ Simpan ke database Transaction
                const savedTransaction = yield newTransaction.save();
                // SetUp Room yang akan masuk dalam Room Pending
                yield Controller_PendingRoom_1.PendingRoomController.SetPending(ReservationReadyToBeSaved.WithoutPending, bookingId, IsHaveAccount !== null && IsHaveAccount !== void 0 ? IsHaveAccount : userId, checkIn, checkOut, req, res);
                // ✅ Berikan respon sukses
                return res.status(201).json({
                    requestId: (0, uuid_1.v4)(),
                    data: {
                        acknowledged: true,
                        insertedTransactionId: savedTransaction._id,
                        insertedBoopkingId: savedBooking._id
                    },
                    message: "Successfully add transaction to reservation.",
                    success: true
                });
            }
            catch (error) {
                console.error("Error creating transaction:", error);
                return res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message || "Internal Server Error",
                    success: false
                });
            }
        });
    }
    static SetPayment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Destructure req.body
                const { TransactionId } = req.params;
                // ✅ Validasi data sebelum disimpan
                if (!TransactionId) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "required TransactionId!",
                        success: false
                    });
                }
                const BookingReservation = yield models_transaksi_1.TransactionModel.find({ bookingId: TransactionId, isDeleted: false, reservation: true });
                if (!BookingReservation) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "Transaction no found !",
                        success: false
                    });
                }
                const IsTransaction = yield models_transaksi_1.TransactionModel.findOneAndUpdate({ bookingId: TransactionId, isDeleted: false, status: constant_1.PAYMENT_ADMIN, reservation: true }, {
                    status: constant_1.PAID_ADMIN
                });
                if (!IsTransaction) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "Set Transaction no found !",
                        success: false
                    });
                }
                console.log(`Transaction ${IsTransaction.name} has Pay`);
                yield controller_short_1.ShortAvailableController.addBookedRoomForAvailable({
                    transactionId: TransactionId,
                    userId: IsTransaction.userId,
                    status: constant_1.PAID,
                    checkIn: IsTransaction.checkIn,
                    checkOut: IsTransaction.checkOut,
                    products: IsTransaction.products.map((product) => ({
                        roomId: product.roomId,
                        price: product.price,
                        quantity: product.quantity,
                        name: product.name,
                    })),
                }, res);
                // ✅ Berikan respon sukses
                return res.status(201).json({
                    requestId: (0, uuid_1.v4)(),
                    data: {
                        acknowledged: true
                    },
                    message: `Successfully payment transaction : ${TransactionId}`,
                    success: true
                });
            }
            catch (error) {
                console.error("Error creating transaction:", error);
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
exports.ReservationController = ReservationController;
