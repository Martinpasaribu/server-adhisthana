import mongoose, { Document, Schema } from 'mongoose';

interface Room {
    roomId: string;
    quantity: number;
    ota:number;
    image:string;
    price: number;
    priceTotal: number;
    availableCount: number;
    name: string;
}

interface VaNumber {
    va_number : string;
    bank : string;
}

export interface Voucher {
    status: boolean;
    id_voucher: string;
    user: string;
    credential_account: string;
    time?: number; // Opsional, jika hanya diisi saat diverifikasi
    tim_claim?: number; // Opsional, jika hanya diisi saat diverifikasi
    time_use?: number; // Opsional, jika hanya diisi saat diverifikasi
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
    otaTotal: number;
    userId: string;
    checkIn: string;
    checkOut: string;
    voucher: Voucher;
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
            // required: [true, "booking_key cannot be empty"],
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


        voucher: {
            status: { 
                type: Boolean, 
                default: false,  // voucher belum aktif / belum diklaim
            },
            id_voucher: {
                type: String,     // atau ObjectId kalau ada model Voucher
                default: null
            },
            user: {
                type: String, 
                default: null
            },
            credential_account: {
                type: String,
                default: null
            },
            time: {
                type: Date,
                default: Date.now // otomatis set waktu saat voucher dibuat/dipakai
            },
            time_claim: {
                type: Date,
                default: null // belum diklaim = null
            },
            time_use: {
                type: Date,
                default: null // belum dipakai = null
            }
        },
                  

        otaTotal: {
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
                image: { type: String, trim: true },
                price: { type: Number }, // Tidak perlu trim di tipe Number
                priceTotal: { type: Number }, // Tidak perlu trim di tipe Number
                quantity: { type: Number }, // Tidak perlu trim di tipe Number
                ota: { type: Number }, // Tidak perlu trim di tipe Number
                availableCount: { type: Number }, // Tidak perlu trim di tipe Number
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
