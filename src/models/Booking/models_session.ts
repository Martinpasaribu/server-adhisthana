

import mongoose, { Document, Schema } from 'mongoose';
import { Additional, Dish, Invoice, IVerified, Ota, Room } from './models_booking';


export interface BookingModels {

    _id: string;
    name: string;
    email: string;
    phone: number;
    orderId: string;
    checkIn: string;
    checkOut: string;
    verified: IVerified;
    reservation: boolean;
    adult: number;
    night: number;
    children: number;
    amountTotal: number;
    otaTotal: number;
    amountBefDisc: number;
    dish: Dish[];
    additional: Additional[];
    ota: Ota[];
    couponId: string;
    userId:string ;
    room : Room [];
    invoice : Invoice [];
    createAt: number;
    creatorId: string;
    
}


interface ISess extends Document {
    _id: string;
    bookingId : string;
    status : string;
    grossAmount: number;
    userId: string;
    
}


const SessionSchema: Schema = new Schema(
    {

        expires: {
            type: Date,
            required: [true, "bookingId cannot be empty"],
            trim: true
        },
        session: [
            {
                cookie :{
                    type: String,
                    trim:true
                },

                cart :[
                        {
                            roomId : { type : String},
                            quantity : { type : Number},
                            price : { type : Number}
                        }
                    ]
            }
        ],

       
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

export const  SessionModel = mongoose.model<ISess>('Session', SessionSchema,'Session');

