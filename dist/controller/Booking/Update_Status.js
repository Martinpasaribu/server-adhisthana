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
    console.log(' oder_id : ', transaction_id, 'data_status : ', data.status_code, 'data gross amount : ', data.gross_amount, 'midtrans_key : ', MIDTRANS_SERVER_KEY);
    const hash = crypto_1.default
        .createHash('sha512')
        .update(`${transaction_id}${data.status_code}${data.gross_amount}${MIDTRANS_SERVER_KEY}`)
        .digest('hex');
    if (data.signature_key !== hash) {
        return {
            status: "error",
            message: " invalid signature Key"
        };
    }
    const formattedTransactionId = data.order_id.replace(/^order-/, "");
    let responseData = null;
    let transactionStatus = data.transaction_status;
    let fraudStatus = data.fraud_status;
    if (transactionStatus == 'capture') {
        if (fraudStatus == 'accept') {
            const transaction = yield models_transaksi_1.TransactionModel.updateOne({ formattedTransactionId, status: constant_1.PAID, payment_methode: data.payment_type });
            responseData = transaction;
        }
    }
    else if (transactionStatus == 'settlement') {
        const transaction = yield models_transaksi_1.TransactionModel.updateOne({ formattedTransactionId, status: constant_1.PAID, payment_methode: data.payment_type });
        responseData = transaction;
    }
    else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
        const transaction = yield models_transaksi_1.TransactionModel.updateOne({ formattedTransactionId, status: constant_1.CANCELED });
        responseData = transaction;
    }
    else if (transactionStatus == 'pending ') {
        const transaction = yield models_transaksi_1.TransactionModel.updateOne({ formattedTransactionId, status: constant_1.PENDING_PAYMENT });
        responseData = transaction;
    }
    return {
        status: 'success',
        data: responseData
    };
});
exports.updateStatusBaseOnMidtransResponse = updateStatusBaseOnMidtransResponse;
