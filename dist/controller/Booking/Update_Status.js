"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStatusBaseOnMidtransResponse = void 0;
const crypto_1 = __importDefault(require("crypto"));
const models_transaksi_1 = require("../../models/Booking/models_transaksi");
const constant_1 = require("../../utils/constant");
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
const updateStatusBaseOnMidtransResponse = (transaction_id, data) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('order_id:', transaction_id, 'data_status:', data.status_code, 'transaction_status:', data.transaction_status, 'data gross amount:', data.gross_amount, 'midtrans_key:', MIDTRANS_SERVER_KEY, 'payment_type :', data.payment_type, 'va_numbers :', data.va_numbers, 'bank :', data.bank, 'card_type :', data.card_type);
    // Generate signature hash
    const hash = crypto_1.default
        .createHash('sha512')
        .update(`${transaction_id}${data.status_code}${data.gross_amount}${MIDTRANS_SERVER_KEY}`)
        .digest('hex');
    if (data.signature_key !== hash) {
        return {
            status: 'error',
            message: 'Invalid signature key',
        };
    }
    const formattedTransactionId = data.order_id.replace(/^order-/, '');
    let responseData = null;
    switch (data.transaction_status) {
        case 'capture':
            if (data.fraud_status === 'accept') {
                responseData = yield models_transaksi_1.TransactionModel.updateOne({ bookingId: formattedTransactionId }, {
                    status: constant_1.PAID,
                    payment_type: data.payment_type,
                    va_numbers: data.va_numbers
                        ? data.va_numbers.map((va_number) => ({
                            va_number: va_number.va_number,
                            bank: va_number.bank,
                        }))
                        : [],
                    bank: data.bank,
                    card_type: data.card_type
                });
            }
            break;
        case 'settlement':
            responseData = yield models_transaksi_1.TransactionModel.updateOne({ bookingId: formattedTransactionId }, {
                status: constant_1.PAID,
                payment_type: data.payment_type,
                va_numbers: data.va_numbers
                    ? data.va_numbers.map((va_number) => ({
                        va_number: va_number.va_number,
                        bank: va_number.bank,
                    }))
                    : [],
                bank: data.bank,
                card_type: data.card_type
            });
            break;
        case 'cancel':
        case 'deny':
        case 'expire':
            responseData = yield models_transaksi_1.TransactionModel.updateOne({ bookingId: formattedTransactionId }, { status: constant_1.CANCELED });
            break;
        case 'pending':
            responseData = yield models_transaksi_1.TransactionModel.updateOne({ bookingId: formattedTransactionId }, { status: constant_1.PENDING_PAYMENT });
            break;
        default:
            console.warn('Unhandled transaction status:', data.transaction_status);
    }
    return {
        status: 'success',
        data: responseData,
        message: 'Transaction status has been updated!',
    };
});
exports.updateStatusBaseOnMidtransResponse = updateStatusBaseOnMidtransResponse;
