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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionController = void 0;
const uuid_1 = require("uuid");
const constant_1 = require("../../utils/constant");
const models_transaksi_1 = require("../../models/Transaction/models_transaksi");
const Update_Status_1 = require("./Update_Status");
class TransactionController {
    static TrxNotif(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = req.body;
                // console.log("Data from midtrans:", data);
                // Menghilangkan prefiks "order-" dari transaction_id
                const formattedTransactionId = data.order_id.replace(/^order-/, "");
                // console.log("Formatted Transaction ID:", formattedTransactionId);
                // Menunggu hasil findOne dengan bookingId yang sudah diformat
                const existingTransaction = yield models_transaksi_1.TransactionModel.findOne({ bookingId: formattedTransactionId });
                let resultUpdate;
                if (existingTransaction) {
                    // Properti bookingId sekarang tersedia
                    const result = yield (0, Update_Status_1.updateStatusBaseOnMidtransResponse)(data.order_id, data, res);
                    console.log('result = ', result);
                    resultUpdate = result;
                }
                else {
                    console.log('Transaction not found in server, Data =', data);
                }
                res.status(200).json({
                    status: 'success',
                    message: "OK",
                    data: resultUpdate
                });
            }
            catch (error) {
                console.error('Error handling transaction notification:', error);
                res.status(500).json({
                    error: 'Internal Server Error'
                });
            }
        });
    }
    static getTransactionsById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { transaction_id } = req.params;
                const transaction = yield models_transaksi_1.TransactionModel.findOne({ bookingId: transaction_id });
                if (!transaction) {
                    return res.status(404).json({
                        status: 'error',
                        message: 'Transaction not found'
                    });
                }
                res.status(202).json({
                    status: 'success',
                    data: transaction
                });
            }
            catch (error) {
                res.status(400).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message,
                    success: false
                });
                console.log(" Error get data by ID ");
            }
        });
    }
    ;
    static getTransactionsByMember(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.session.userId;
                const transaction = yield models_transaksi_1.TransactionModel.find({ userId: userId });
                if (!transaction) {
                    return res.status(404).json({
                        status: 'error',
                        message: `Transaction not found by Member ${userId}`
                    });
                }
                res.status(202).json({
                    status: 'success',
                    data: transaction
                });
            }
            catch (error) {
                res.status(400).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message,
                    success: false
                });
                console.log(" Error get data by User ");
            }
        });
    }
    ;
    static updateTransactionFailed(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transactionId = req.params.order_id;
                const update = yield models_transaksi_1.TransactionModel.findOneAndUpdate({ bookingId: transactionId }, { status: constant_1.EXPIRE });
                if (!update) {
                    return res.status(404).json({
                        status: 'error',
                        message: `Transaction not found by TRX :  ${transactionId}`
                    });
                }
                res.status(202).json({
                    status: 'success',
                    data: update,
                    message: "success set expire transaction"
                });
            }
            catch (error) {
                res.status(400).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message,
                    success: false
                });
                console.log(" Error get data by User ");
            }
        });
    }
    ;
    static getTransactionsByUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = req.params;
                const transaction = yield models_transaksi_1.TransactionModel.find({ userId: user });
                if (!transaction) {
                    return res.status(404).json({
                        status: 'error',
                        message: `Transaction not found by Name ${user}`
                    });
                }
                res.status(202).json({
                    status: 'success',
                    data: transaction
                });
            }
            catch (error) {
                res.status(400).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message,
                    success: false
                });
                console.log(" Error get data by User ");
            }
        });
    }
    ;
}
exports.TransactionController = TransactionController;
