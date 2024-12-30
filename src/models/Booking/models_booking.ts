import mongoose, { Document, Schema } from 'mongoose';


interface Room {
    roomId:string;
    quantity:number;
}


interface IBooking extends Document {

    _id: string;
    title: string;
    oderId: string;
    checkIn: string;
    checkOut: string;

    adult: number;
    children: number;
    amountTotal: number;
    amountBefDisc: number;
   
    couponId: string;
    idUser:string ;
    room : Room [];
    
    createAt: number;
    creatorId: string;
    
}


const BookingSchema: Schema = new Schema(
    {

        oderId: {
            type: String,
            // required: [true, "oderId cannot be empty"],
            trim: true
        },
        title: {
            type: String,
            // required: [true, "checkIn cannot be empty"],
            trim: true
        },
        checkIn: {
            type: String,
            // required: [true, "checkIn cannot be empty"],
            trim: true
        },

        checkOut: {
            type: String,
            // required: [true, "checkOut cannot be empty"],
            trim: true
        },

        adult: {
            type: Number,
            required: false,
            // min: [1, 'adult must more then 0'],
            trim: true
        },
        children: {
            type: Number,
            required: false,
            // min: [1, 'children must more then 0'],
            trim: true
        },
        amountTotal: {
            type: Number,
            required: false,
            // min: [1, 'amountTotal must more then 0'],
            trim: true
        },
        amountBefDisc: {
            type: Number,
            required: false,
            // min: [1, 'amountBefDisc must more then 0'],
            trim: true
        },
        couponId: {
            type: String,
            // required: [true, "couponId cannot be empty"],
            trim: true
        },
        idUser: {
            type: String,
            // required: [true, "idUser cannot be empty"],
            trim: true
        },

        room: [{
            roomId: {type: String},
            quantity: {type: Number}
        }],

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


export const BookingModel = mongoose.model<IBooking>('Booking', BookingSchema,'Booking');



