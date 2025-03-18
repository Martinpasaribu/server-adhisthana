import mongoose, { Document, Schema } from 'mongoose';


interface Room {
    roomId:string;
    name:string;
    priceTotal:number;
    ota:number;
    quantity:number;
}

interface IVerified {
    status: boolean;
    time?: number; // Opsional, jika hanya diisi saat diverifikasi
}


interface IBooking extends Document {

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
   
    couponId: string;
    userId:string ;
    room : Room [];
    
    createAt: number;
    creatorId: string;
    
}


const BookingSchema: Schema = new Schema(
    {

        orderId: {
            type: String,
            // required: [true, "oderId cannot be empty"],
            trim: true
        },
        name: {
            type: String,
            // required: [true, "checkIn cannot be empty"],
            trim: true
        },
        email: {
            type: String,
            // required: [true, "checkIn cannot be empty"],
            trim: true
        },
        phone: {
            type: Number, // Tidak perlu trim di tipe Number
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

        verified: {
            status: { 
                type: Boolean, 
                default: false,  
            },
            time: {
                type: Number,
                default: Date.now, // Otomatis set timestamp saat diverifikasi
            }
        },

        reservation: {
            type: Boolean,
            trim: true,
        },
    
        adult: {
            type: Number,
            required: false,
            // min: [1, 'adult must more then 0'],
            trim: true
        },

        night: {
            type: Number,
            required: false,
            // min: [1, 'adult must more then 0'],
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
        otaTotal: {
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
            default: 0,  
            // required: [true, "couponId cannot be empty"],
            trim: true
        },
        userId: {
            type: String,
            // required: [true, "idUser cannot be empty"],
            trim: true
        },

        room: [{
            roomId: {type: String},
            name: {type: String},
            ota: {type: Number},
            priceTotal: {type: Number},
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



