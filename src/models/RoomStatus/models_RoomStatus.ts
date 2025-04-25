import mongoose, { Document, Schema } from 'mongoose';


interface IRoomS extends Document {

    _id: string;
    id_Trx: string;
    status: string;
    checkIn: string;
    checkOut: string;
    number: number;
    name: string;
    code: string;
    idVilla: string;
    nameVilla: string;
    
}

const RoomStatusSchema: Schema = new Schema(
    {
        bookingKey: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking'  // mengacu ke nama model
        },
        id_Trx: {
            type: String,
            trim: true,
        },
        status: {
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
        number: {
            type: Number,
            required: false,
        },
        name: {
            type: String,
            required: false,
        },
        code: {
            type: String,
            required: false,
        },
        idVilla: {
            type: String,
            required: false,
        },
        nameVilla: {
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

export const RoomStatusModel = mongoose.model<IRoomS>('RoomStatus', RoomStatusSchema, 'RoomStatus');
