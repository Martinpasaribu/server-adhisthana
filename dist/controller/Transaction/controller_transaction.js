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
const models_transaksi_1 = require("../../models/Transaction/models_transaksi");
class TransactionController {
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
