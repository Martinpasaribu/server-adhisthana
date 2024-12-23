
import { BookingModel } from '../../models/Booking/models_booking.js';

interface createTransaction {
    bookingId:string;
    status:string;
    grossAmount:number
    userId:string;
}

interface updateTransactionStatus {
    transactionId:string;
    status:string;
}

interface updateTransactionStatus {
    transactionId:string;
    status:string;
}

class TransactionService {
    async createTransaction({ bookingId, status, grossAmount, userId } : createTransaction) {
        const transaction = {
            bookingId,
            status,
            grossAmount,
            userId,
            createdAt: new Date(),
        };
        // Save to database (example using MongoDB)
        return BookingModel.create(transaction);
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
