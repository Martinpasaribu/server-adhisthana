import mongoose, { Document, Schema } from 'mongoose';


interface IPending extends Document {
    bookingId: string;
    roomId: string;
    userId: string;
    start: string;
    end: string;
    stock: number;
    lockedUntil: string;
    
}

const PendingRoomSchema: Schema = new Schema(
    {
        bookingId: {
            type: String,
            trim: true,
        },
        roomId: {
            type: String,
            trim: true,
        },
        userId: {
            type: String,
            trim: true,
        },
        start: {
            type: String,
            trim: true,
        },
        end: {
            type: String,
            trim: true,
        },
        stock: {
            type: Number
        },
        lockedUntil: {
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

export const PendingRoomModel = mongoose.model<IPending>('PendingRoom', PendingRoomSchema, 'PendingRoom');


