import mongoose, { Document, Schema } from 'mongoose';

interface Room {
    roomId: string;
    quantity: number;
    price: number;
    priceTotal: number;
    name: string;
}

interface VaNumber {
    va_number : string;
    bank : string;
}

interface ITran extends Document {
    _id: string;
    name: string;
    email: string;
    phone: number,
    bookingId: string;
    booking_keyId: string;
    status: string;
    reservation: boolean;
    payment_type: string;
    grossAmount: number;
    userId: string;
    checkIn: string;
    checkOut: string;
    products: Room[];
    snap_token: string;
    paymentUrl: string;
    va_numbers: VaNumber;
    bank: string;
    card_type: string;
    createdAt: Date; 
    
}

const TransactionSchema: Schema = new Schema(
    {
        bookingId: {
            type: String,
            trim: true,
        },
        userId: {
            type: String,
            // required: [true, "userId cannot be empty"],
            trim: true,
        },
        name: {
            type: String,
            // required: [true, "userId cannot be empty"],
            trim: true,
        },
        email: {
            type: String,
            // required: [true, "userId cannot be empty"],
            trim: true,
        },
        phone: {
            type: Number, // Tidak perlu trim di tipe Number
        },
        status: {
            type: String,
            trim: true,
        },
        
        booking_keyId: {
            type: String,
            ref:'Booking',
            required: [true, "booking_key cannot be empty"],
            trim: true
        },
        reservation: {
            type: Boolean,
            trim: true,
        },
        payment_type: {
            type: String,
            trim: true,
        },
        va_numbers : [{

            va_number :{ type : String },
            bank : { type: String }

        }],

        bank: { type : String , trim: true},
        
        card_type:{ type : String , trim: true},

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
                priceTotal: { type: Number }, // Tidak perlu trim di tipe Number
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
