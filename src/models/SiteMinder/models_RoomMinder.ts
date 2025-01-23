import mongoose, { Document, Schema } from 'mongoose';


interface IMinder extends Document {
    roomId: string;
    date: string;
    price: number;
    
}

const SiteMinderSchema: Schema = new Schema(
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

export const SiteMinderModel = mongoose.model<IMinder>('SiteMinder', SiteMinderSchema, 'SiteMinder');


