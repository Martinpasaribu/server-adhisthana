import { BookingModel } from "../../models/Booking/models_booking";
import { createTransaction } from "../../models/transaction";
import { createTransactionBooking } from "../../models/transaction";
import createTransactionItem from "../../models/transaction";
import updateTransactionStatus from "../../models/transaction";

import { TransactionModel } from '../../models/Booking/models_transaksi';


class TransactionService {

    // Fungsi untuk membuat Data Transaksi 
    async createTransaction({ bookingId, status, grossAmount, userId, checkIn, checkOut, products, snap_token, paymentUrl, payment_type, bank, card_type, va_numbers } : createTransaction) {
        const transaction = {
            bookingId,
            status,
            grossAmount,
            userId,
            checkIn,
            checkOut,
            products:   products.map(products => ({
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
        return TransactionModel.create(transaction);
    }


    // Fungsi untuk membuat data booking
    async createBooking(
        {
            orderId,
            checkIn,
            checkOut,
            adult,
            children,
            amountTotal,
            amountBefDisc,
            couponId,
            idUser,
            creatorId,
            rooms,
        }: createTransactionBooking ) {
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
            const createdBooking = await BookingModel.create(bookingData);

            return createdBooking;
        } catch (error) {
            console.error('Error creating booking:', error);
            throw new Error('Failed to create booking');
        }
    }


    
    async updateTransactionStatus({transactionId, status}: updateTransactionStatus) {
        return BookingModel.findByIdAndUpdate(
            transactionId,
            { status },
            { new: true }
        );
    }

    async getTransactions({ status }  : { status :string}) {
        const query = status ? { status } : {};
        return BookingModel.find(query);
    }
}

export const transactionService = new TransactionService();
