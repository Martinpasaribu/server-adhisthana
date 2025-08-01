"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const BookingSchema = new mongoose_1.Schema({
    roomStatusKey: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'RoomStatus', // mengacu ke nama model
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
        type: {
            type: String,
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
            name: {
                type: String,
                required: false,
                trim: true,
            },
            type: {
                type: String,
                enum: ['bank_transfer', 'virtual_account', 'e_wallet', 'qris', 'retail', 'etc', 'booking.com', 'traveloka', 'edc'],
                required: true,
                lowercase: true,
            },
            amount: {
                type: Number,
                required: false,
                min: 0,
            },
            code: {
                type: String,
                default: '',
                trim: true,
            },
            foreign_key: {
                type: String,
                default: '',
                trim: true,
            },
            note: {
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
            name: {
                type: String,
                default: null,
            },
            qty: {
                type: String,
                default: null,
            },
            price: {
                type: String,
                default: null,
            },
            note: {
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
        code: {
            type: String,
            default: null,
        },
        name: {
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
        personal_voucher: {
            type: Boolean,
            default: false
        },
        status: {
            type: Boolean,
            default: false, // voucher belum aktif / belum diklaim
        },
        id_voucher: {
            type: String, // atau ObjectId kalau ada model Voucher
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
            roomId: { type: String },
            name: { type: String },
            image: { type: String },
            ota: { type: Number },
            priceTotal: { type: Number },
            quantity: { type: Number }
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
}, {
    timestamps: true,
});
exports.BookingModel = mongoose_1.default.model('Booking', BookingSchema, 'Booking');
