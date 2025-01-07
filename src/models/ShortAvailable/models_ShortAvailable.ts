import mongoose, { Document, Schema } from 'mongoose';

interface Room {
    roomId: string;
    quantity: number;
    price: number;
    name: string;
}

interface IShort extends Document {
    _id: string;
    transactionId: string;
    userId: string;  
    roomId:string;
    status: string;
    checkIn: string;
    checkOut: string;
    products: Room[];
    
}

const ShortAvailableSchema: Schema = new Schema(
    {
        bookingId: {
            type: String,
            trim: true,
        },
        transactionId: {
            type: String,
            required: [true, "userId cannot be empty"],
            trim: true,
        },
        userId: {
            type: String,
            required: [true, "userId cannot be empty"],
            trim: true,
        },
        roomId: {
            type: String,
            required: [true, "userId cannot be empty"],
            trim: true,
        },
        status: {
            type: String,
            trim: true,
        },

        payment_type: {
            type: String,
            trim: true,
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
                price: { type: Number },
                quantity: { type: Number }, 
            },
        ],
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

export const ShortAvailableModel = mongoose.model<IShort>('ShortAvailable', ShortAvailableSchema, 'ShortAvailable');
