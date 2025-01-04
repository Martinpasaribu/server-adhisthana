import mongoose, { Document, Schema } from 'mongoose';

interface Room {
    roomId: string;
    quantity: number;
    price: number;
    name: string;
}

interface ITran extends Document {
    _id: string;
    bookingId: string;
    status: string;
    payment_methode: string;
    grossAmount: number;
    userId: string;
    checkIn: string;
    checkOut: string;
    products: Room[];
    snap_token: string;
    paymentUrl: string;
}

const TransactionSchema: Schema = new Schema(
    {
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
            type: Number, // Tidak perlu trim di tipe Number
        },
        checkIn: {
            type: String,
            trim: true,
        },
        checkOut: {
            type: String,
            trim: true,
        },
        products: [
            {
                roomId: { type: String, trim: true },
                name: { type: String, trim: true },
                price: { type: Number }, // Tidak perlu trim di tipe Number
                quantity: { type: Number }, // Tidak perlu trim di tipe Number
            },
        ],
        snap_token: {
            type: String,
            trim: true,
        },
        paymentUrl: {
            type: String,
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
