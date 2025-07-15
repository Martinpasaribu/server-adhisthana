import mongoose, { Document, Schema } from 'mongoose';


export interface Room {
    roomId:string;
    name:string;
    image: string;
    priceTotal:number;
    ota:number;
    quantity:number;
}
export default interface IPayment {
  name: string;                                // contoh: 'BCA', 'GoPay', 'DANA'
  type: 'bank_transfer' | 'virtual_account' | 'e_wallet' | 'qris' | 'retail' | 'etc'| 'traveloka' | 'booking.com';
  amount: number;                              // contoh: 150000
  foreign_key: string;                              // contoh: 150000
  code: string;                              // contoh: 150000
  note?: string;
  createAt:string;                               // contoh: 'tanggal Pembayaran awal'
}

export interface Reschedule {
  status: boolean;
  
  schedule_new: {
    checkIn: Date | string;   // string jika data dari API berbentuk ISO string
    checkOut: Date | string;
  };
  
  schedule_old: {
    checkIn: Date | string;   // string jika data dari API berbentuk ISO string
    checkOut: Date | string;
  };

  type: string;

  key_reschedule?: string;    // Optional karena bisa null/undefined
  reschedule_fee?: number | null;
  price_prev?: number | null;
  price_next?: number | null;
  reason?: string;
  time?: Date | string;       // Bisa ISO string jika dari server
}

export interface data {
    status:string;
    note:string;
    amountPrice:number;
    desc:string,
    image:string,
    name:string;
    code:string;
    price:number;
}

export interface Dish {
    status:boolean;
    id:string;
    id_Invoice:string;
    note:string;
    amountPrice:number;
    totalPrice:number;
    data: data [];
    createAt: Date;
}

export interface Ota {
    status:string;
    code:string;
    name:string;
    qty:number;
    price:number;
}

export interface Invoice {
    status:boolean;
    code:string;
    code2: string;
    note:string;
    subject:string;
    id:number;
    less:number;
    totalPrice:number;
    id_Product:number;
    timePaid:number;
    createAt: number;

}

export interface Additional {
    status:string;
    name:string;
    qty:number;
    price:number;
    note:string;
}

export interface IVerified {
    status: boolean;
    time?: number; // Opsional, jika hanya diisi saat diverifikasi
    timeIn?: number; // Opsional, jika hanya diisi saat diverifikasi
    timeOut?: number; // Opsional, jika hanya diisi saat diverifikasi
}
export interface Voucher {
    personal_voucher: boolean;
    status: boolean;
    id_voucher: string;
    user: string;
    credential_account: string;
    time?: number; // Opsional, jika hanya diisi saat diverifikasi
    tim_claim?: number; // Opsional, jika hanya diisi saat diverifikasi
    time_use?: number; // Opsional, jika hanya diisi saat diverifikasi
}


interface IBooking extends Document {

    _id: string;
    roomStatusKey:string;
    name: string;
    email: string;
    phone: number;
    orderId: string;
    checkIn: string;
    checkOut: string;
    verified: IVerified;
    reservation: boolean;
    reschedule: Reschedule;
    adult: number;
    night: number;
    payment: IPayment[];
    children: number;
    amountTotal: number;
    otaTotal: number;
    amountBefDisc: number;
    dish: Dish[];
    additional: Additional[];
    ota: Ota[];
    couponId: string;
    voucher: Voucher;
    userId:string ;
    room : Room [];
    invoice : Invoice [];
    createAt: number;
    creatorId: string;
    
}


const BookingSchema: Schema = new Schema(

    {
        roomStatusKey: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'RoomStatus',  // mengacu ke nama model
            default: [], 
        }],
        
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
                default: null,  
            },
            time: {
                type: Number,
                default: Date.now, // Otomatis set timestamp saat diverifikasi
            },
            timeIn: {
                type: Number,
                default: '0',
            },
            timeOut: {
                type: Number,
                default: '0',
            }
        },

        reschedule: {

            status: { 
                type: Boolean, 
                default: false,  
            },

            type:{                  // SRC (Source) || RES (Result)
                type : String,
                default: null
            },

            schedule_new: {
                checkIn: {
                    type: Date,
                    default: "",
                },
                checkOut: {
                    type: Date,
                    default: "",
                },
            },

            schedule_old: {
                checkIn: {
                    type: Date,
                    default: "",
                },
                checkOut: {
                    type: Date,
                    default: "",
                },
            },

            key_reschedule: {
                type: String,
                trim: true
            },

            reschedule_fee: {
                type: Number,  
                default: null      
            },


            price_prev: {
                type: Number,
                default: null
            },

            price_next: {
                type: Number,
                default: null
            },

            reason: {
                type: String,
                trim: true,
                default: "",
            },

            time: {
                type: Date,
                default: Date.now
            },
        },

        payment: [{
            name: {               // Nama bank atau provider (contoh: BCA, DANA, GoPay)
                type: String,
                required: true,
                trim: true,
            },
            type: {               // Kategori metode pembayaran
                type: String,
                enum: ['bank_transfer', 'virtual_account', 'e_wallet', 'qris', 'retail', 'etc','booking.com','traveloka'],
                required: true,
                lowercase: true,
            },
            amount: {             // Jumlah yang dibayarkan
                type: Number,
                required: true,
                min: 0,
            },
            code: {               // Catatan tambahan, misal "dari user A", atau "pembayaran awal"
                type: String,
                default: '',
                trim: true,
            },
            foreign_key: {               // Catatan tambahan, misal "dari user A", atau "pembayaran awal"
                type: String,
                default: '',
                trim: true,
            },
            note: {               // Catatan tambahan, misal "dari user A", atau "pembayaran awal"
                type: String,
                default: '',
                trim: true,
            },
            createAt: {
                type: Number,
                default: Date.now
            },
        }],

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

        dish: [{
            status: { type: Boolean, default: null },
            id: { type: String, default: null },
            note: { type: String, default: null },
            id_Invoice: { type: String, default: null },
            amountPrice: { type: Number, default: 0 },
            totalPrice: { type: Number, default: 0 },
            data: [{
              type: { type: String, default: null },
              code: { type: String, default: null },
              desc: { type: String, default: null },
              name: { type: String, default: null },
              image: { type: String, default: null },
              qty: { type: Number, default: null },
              amountPrice: { type: Number, default: null },
              price: { type: Number, default: null },
            }],
            createAt: {
                type: Number,
                default: Date.now,
            },
        }],
        
        invoice: [{
            status: { type: Boolean, default: null },
            id: { type: String, default: null },
            id_Product: { type: String, default: null },
            note: { type: String, default: null },
            subject: { type: String, default: null },
            code: { type: String, default: null }, // VLA,FAD,ADD
            code2: { type: String, default: null }, // BDE
            less: { type: Number, default: 0 },
            totalPrice: { type: Number, default: 0 },
            timePaid: {
                type: Number,
                default: '0',
            },
            createAt: {
                type: Number,
                default: Date.now,
            },
        }],
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
        additional: [{            

            status: { 
                type: Boolean, 
                default: null,  
            },                                                                                        

            name:{
                type: String, 
                default: null,  
            },
            qty:{
                type: String, 
                default: null,  
            },
            price:{
                type: String, 
                default: null,  
            },
            note:{
                type: String, 
                default: null,  
            },
        }],

        amountTotal: {
            type: Number,
            required: false,
            // min: [1, 'amountTotal must more then 0'],
            trim: true
        },

        ota: {
            status: { 
                type: Boolean, 
                default: null,  
            },

            code:{
                type: String, 
                default: null,  
            },
        
            name:{
                type: String, 
                default: null,  
            },
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

        voucher: {

            personal_voucher:{
                type: Boolean,
                default: false
            },

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
          

        room: [{
            roomId: {type: String},
            name: {type: String},
            image: {type: String},
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



