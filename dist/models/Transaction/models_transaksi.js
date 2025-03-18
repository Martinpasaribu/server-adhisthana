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
exports.TransactionModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const TransactionSchema = new mongoose_1.Schema({
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
        ref: 'Booking',
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
    va_numbers: [{
            va_number: { type: String },
            bank: { type: String }
        }],
    bank: { type: String, trim: true },
    card_type: { type: String, trim: true },
    grossAmount: {
        type: Number, // Tidak perlu trim di tipe Number
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
}, {
    timestamps: true,
});
exports.TransactionModel = mongoose_1.default.model('Transaction', TransactionSchema, 'Transaction');
