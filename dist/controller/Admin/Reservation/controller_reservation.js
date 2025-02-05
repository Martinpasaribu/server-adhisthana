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
const models_ShortAvailable_1 = require("../../../models/ShortAvailable/models_ShortAvailable");
const crypto_1 = __importDefault(require("crypto"));
const models_transaksi_1 = require("../../../models/Transaction/models_transaksi");
const Index_1 = require("./components/Index");
class ReservationController {
    static GetAllTransactionReservation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const AvailableRoom = yield models_ShortAvailable_1.ShortAvailableModel.find({
                    status: "PAID", isDeleted: false
                }, { transactionId: 1, _id: 0 });
                // Ambil hanya transactionId dari AvailableRoom
                const transactionIds = AvailableRoom.map(room => room.transactionId);
                const filterQuery = {
                    status: "PAID",
                    isDeleted: false,
                    bookingId: { $in: transactionIds } // Mencocokkan bookingId dengan transactionId
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
                // Set Up Data Lain
                const bookingId = 'TRX-' + crypto_1.default.randomBytes(5).toString('hex');
                const status = "PAYMENT_PENDING";
                // Daftarkan terlebih dahulu usernya
                const IsHaveAccount = yield (0, Index_1.CekUser)(email);
                let userId;
                if (!IsHaveAccount) {
                    userId = yield (0, Index_1.Register)(title, name, email, phone);
                }
                // ✅ Buat objek baru berdasarkan schema
                const newTransaction = new models_transaksi_1.TransactionModel({
                    bookingId,
                    userId: IsHaveAccount !== null && IsHaveAccount !== void 0 ? IsHaveAccount : userId,
                    status,
                    title,
                    name,
                    email,
                    phone,
                    grossAmount,
                    reservation,
                    products,
                    night,
                    checkIn,
                    checkOut
                });
                // ✅ Simpan ke database
                const savedTransaction = yield newTransaction.save();
                // ✅ Berikan respon sukses
                return res.status(201).json({
                    requestId: (0, uuid_1.v4)(),
                    data: {
                        acknowledged: true,
                        insertedId: savedTransaction._id
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
}
exports.ReservationController = ReservationController;
