import mongoose, { Document, Schema } from 'mongoose';


interface IHoliday extends Document {
    roomId: string;
    date: string;
    price: number;
    
}

const NationalHolidaysSchema: Schema = new Schema(
    {
        roomId: {
            type: String,
            trim: true,
        },
        date: {
            type: String,
            trim: true,
        },
        price: {
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

export const NationalHolidaysModel = mongoose.model<IHoliday>('NationalHolidays', NationalHolidaysSchema, 'NationalHolidays');


