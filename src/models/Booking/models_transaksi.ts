
import mongoose, { Document, Schema } from 'mongoose';


interface ITran extends Document {
    _id: string;
    bookingId : string;
    status : string;
    grossAmount: number;
    userId: string;
    
}


const TransactionSchema: Schema = new Schema(
    {

        bookingId: {
            type: String,
            required: [true, "bookingId cannot be empty"],
            trim: true
        },
        userId: {
            type: String,
            required: [true, "userId cannot be empty"],
            trim: true
        },
        status: {
            type: String,
            // required: [true, "status cannot be empty"],
            trim: true
        },
        grossAmount: {
            type: Number,
            // required: [true, "bookingId cannot be empty"],
            trim: true
        },
       
        createAt: {
            type: Number,
            default: Date.now
        },
        creatorId: {
            type: String,
            required: false
        },
        isDeleted: {
            type: Boolean,
            default: false  
        },


    },

    {
        timestamps: true,
    }

);


export const  TransactionModel = mongoose.model<ITran>('Transaction', TransactionSchema,'Transaction');


