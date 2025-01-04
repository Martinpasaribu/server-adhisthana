import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

interface Room {
    roomId: string;
    quantity: number;
    price: number;
}

interface ITran extends Document {
    _id: string;
    bookingId: string;
    status: string;
    payment_methode: string;
    grossAmount: number;
    userId: string;
    products: Room[];
}

const TransactionSchema: Schema = new Schema(
    {
        _id: {
            type: String,
            default: () => uuidv4(), // Inisialisasi dengan UUID
        },
        bookingId: {
            type: String,
            trim: true,
        },
        userId: {
            type: String,
            required: [true, "userId cannot be empty"],
            trim: true,
        },
        status: {
            type: String,
            trim: true,
        },
        payment_methode: {
            type: String,
            trim: true,
        },
        grossAmount: {
            type: Number,
            trim: true,
        },
        createAt: {
            type: Number,
            default: Date.now,
        },
        creatorId: {
            type: String,
            required: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export const TransactionModel = mongoose.model<ITran>('Transaction', TransactionSchema, 'Transaction');
