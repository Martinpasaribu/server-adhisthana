"use strict";
exports.__esModule = true;
exports.TransactionModel = void 0;
var mongoose_1 = require("mongoose");
var TransactionSchema = new mongoose_1.Schema({
    bookingId: {
        type: String,
        trim: true
    },
    userId: {
        type: String,
        // required: [true, "userId cannot be empty"],
        trim: true
    },
    name: {
        type: String,
        // required: [true, "userId cannot be empty"],
        trim: true
    },
    email: {
        type: String,
        // required: [true, "userId cannot be empty"],
        trim: true
    },
    phone: {
        type: Number
    },
    status: {
        type: String,
        trim: true
    },
    booking_keyId: {
        type: String,
        ref: 'Booking',
        // required: [true, "booking_key cannot be empty"],
        trim: true
    },
    reservation: {
        type: Boolean,
        trim: true
    },
    payment_type: {
        type: String,
        trim: true
    },
    va_numbers: [{
            va_number: { type: String },
            bank: { type: String }
        }],
    bank: { type: String, trim: true },
    card_type: { type: String, trim: true },
    grossAmount: {
        type: Number
    },
    otaTotal: {
        type: Number
    },
    checkIn: {
        type: String,
        trim: true
    },
    checkOut: {
        type: String,
        trim: true
    },
    products: [
        {
            roomId: { type: String, trim: true },
            name: { type: String, trim: true },
            image: { type: String, trim: true },
            price: { type: Number },
            priceTotal: { type: Number },
            quantity: { type: Number },
            ota: { type: Number },
            availableCount: { type: Number }
        },
    ],
    snap_token: {
        type: String,
        trim: true
    },
    paymentUrl: {
        type: String,
        trim: true
    },
    createAt: {
        type: Number,
        "default": Date.now
    },
    creatorId: {
        type: String,
        required: false
    },
    isDeleted: {
        type: Boolean,
        "default": false
    }
}, {
    timestamps: true
});
exports.TransactionModel = mongoose_1["default"].model('Transaction', TransactionSchema, 'Transaction');
