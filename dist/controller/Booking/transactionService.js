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
exports.transactionService = void 0;
const models_booking_1 = require("../../models/Booking/models_booking");
const models_transaksi_1 = require("../../models/Booking/models_transaksi");
class TransactionService {
    // Fungsi untuk membuat Data Transaksi 
    createTransaction(_a) {
        return __awaiter(this, arguments, void 0, function* ({ bookingId, status, grossAmount, userId, checkIn, checkOut, products, snap_token, paymentUrl, payment_type, bank, card_type, va_numbers }) {
            const transaction = {
                bookingId,
                status,
                grossAmount,
                userId,
                checkIn,
                checkOut,
                products: products.map(products => ({
                    roomId: products.roomId,
                    price: products.price,
                    quantity: products.quantity,
                    name: products.name
                })),
                snap_token,
                payment_type,
                card_type,
                paymentUrl,
                va_numbers,
                bank,
                createdAt: new Date(),
            };
            // Save to database (example using MongoDB)
            return models_transaksi_1.TransactionModel.create(transaction);
        });
    }
    // Fungsi untuk membuat data booking
    createBooking(_a) {
        return __awaiter(this, arguments, void 0, function* ({ orderId, checkIn, checkOut, adult, children, amountTotal, amountBefDisc, couponId, idUser, creatorId, rooms, }) {
            try {
                // Format data sesuai dengan IBooking
                const bookingData = {
                    oderId: orderId,
                    checkIn,
                    checkOut,
                    adult,
                    children,
                    amountTotal,
                    amountBefDisc,
                    couponId,
                    idUser,
                    room: rooms.map(room => ({
                        roomId: room.roomId,
                        quantity: room.quantity,
                    })),
                    creatorId,
                    createAt: Date.now(),
                };
                // Simpan data booking ke database
                const createdBooking = yield models_booking_1.BookingModel.create(bookingData);
                return createdBooking;
            }
            catch (error) {
                console.error('Error creating booking:', error);
                throw new Error('Failed to create booking');
            }
        });
    }
    updateTransactionStatus(_a) {
        return __awaiter(this, arguments, void 0, function* ({ transactionId, status }) {
            return models_booking_1.BookingModel.findByIdAndUpdate(transactionId, { status }, { new: true });
        });
    }
    getTransactions(_a) {
        return __awaiter(this, arguments, void 0, function* ({ status }) {
            const query = status ? { status } : {};
            return models_booking_1.BookingModel.find(query);
        });
    }
}
exports.transactionService = new TransactionService();
