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
const models_transaksi_1 = require("../../models/Transaction/models_transaksi");
const constant_1 = require("../../utils/constant");
const controller_short_1 = require("../ShortAvailable/controller_short");
const Controller_PendingRoom_1 = require("../PendingRoom/Controller_PendingRoom");
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
const updateStatusBaseOnMidtransResponse = (transaction_id, data, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log(
    //     'order_id:', transaction_id,
    //     'order_id2:', data.order_id,
    //     'data_status:', data.status_code,
    //     'transaction_status:', data.transaction_status,
    //     'data gross amount:', data.gross_amount,
    //     'midtrans_key:', MIDTRANS_SERVER_KEY,
    //     'payment_type :', data.payment_type,
    //     'va_numbers :', data.va_numbers,
    //     'bank :', data.bank,
    //     'card_type :', data.card_type,
    //     'signature_key :', data.signature_key,
    //     // " Data1 yang akan dimasukan ke short : ", data
    // );
    // Generate signature hash
    const hash = crypto_1.default
        .createHash('sha512')
        .update(`${transaction_id}${data.status_code}${data.gross_amount}${MIDTRANS_SERVER_KEY}`)
        .digest('hex');
    if (data.signature_key !== hash) {
        console.log("invalid signature");
        return {
            status: 'error',
            message: 'Invalid signature key',
        };
    }
    // Pemerikasaan room pada data transaksi
    const formattedTransactionId = data.order_id.replace(/^order-/, '');
    const RoomFromTransactionModel = yield models_transaksi_1.TransactionModel.findOne({ bookingId: data.order_id });
    if (!RoomFromTransactionModel) {
        throw new Error('RoomFromTransactionModel not found.');
    }
    let responseData = null;
    switch (data.transaction_status) {
        case 'capture':
            if (data.fraud_status === 'accept') {
                responseData = yield models_transaksi_1.TransactionModel.findOneAndUpdate({ bookingId: data.order_id }, {
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
                // if success payment save data room will pay
                yield controller_short_1.ShortAvailableController.addBookedRoomForAvailable({
                    transactionId: data.order_id,
                    userId: RoomFromTransactionModel.userId,
                    status: constant_1.PAID,
                    checkIn: RoomFromTransactionModel.checkIn,
                    checkOut: RoomFromTransactionModel.checkOut,
                    products: RoomFromTransactionModel.products.map((product) => ({
                        roomId: product.roomId,
                        price: product.price,
                        quantity: product.quantity,
                        name: product.name,
                    })),
                }, res);
            }
            break;
        case 'settlement':
            responseData = yield models_transaksi_1.TransactionModel.findOneAndUpdate({ bookingId: data.order_id }, {
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
            console.log(" Data2 yang akan dimasukan ke short : ", data);
            // if success payment save data room will pay
            // if success payment save data room will pay
            yield controller_short_1.ShortAvailableController.addBookedRoomForAvailable({
                transactionId: data.order_id,
                userId: RoomFromTransactionModel.userId,
                status: constant_1.PAID,
                checkIn: RoomFromTransactionModel.checkIn,
                checkOut: RoomFromTransactionModel.checkOut,
                products: RoomFromTransactionModel.products.map((product) => ({
                    roomId: product.roomId,
                    price: product.price,
                    quantity: product.quantity,
                    name: product.name,
                })),
            }, res);
            break;
        case 'cancel':
        case 'deny':
        case 'expire':
            responseData = yield models_transaksi_1.TransactionModel.findOneAndUpdate({ bookingId: data.order_id }, {
                status: constant_1.CANCELED,
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
            console.log('findOneAndUpdate result:', responseData);
            if (!responseData) {
                console.error('No document found with bookingId:', data.order_id);
            }
            break;
        case 'pending':
            responseData = yield models_transaksi_1.TransactionModel.findOneAndUpdate({ bookingId: data.order_id }, {
                status: constant_1.PENDING_PAYMENT,
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
        default:
            console.warn('Unhandled transaction status:', data.transaction_status);
    }
    // Perbaharui Room Pending pada saat user sudah melakukan transaction atau pembayaran gagal 
    const messagePendingRoom = yield Controller_PendingRoom_1.PendingRoomController.UpdatePending(transaction_id);
    return {
        status: 'success',
        data: responseData,
        messagePendingRoom: messagePendingRoom,
        message: 'Transaction status has been updated!',
    };
});
exports.updateStatusBaseOnMidtransResponse = updateStatusBaseOnMidtransResponse;
