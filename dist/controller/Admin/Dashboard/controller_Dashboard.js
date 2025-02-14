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
exports.DashboardController = void 0;
const uuid_1 = require("uuid");
const models_room_1 = __importDefault(require("../../../models/Room/models_room"));
const models_transaksi_1 = require("../../../models/Transaction/models_transaksi");
const models_user_1 = __importDefault(require("../../../models/User/models_user"));
const models_ShortAvailable_1 = require("../../../models/ShortAvailable/models_ShortAvailable");
class DashboardController {
    static ChartTransaction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Ambil semua transaksi dari database
                const transactions = yield models_transaksi_1.TransactionModel.find({ isDeleted: false });
                if (transactions.length === 0) {
                    return res.status(200).json({
                        requestId: (0, uuid_1.v4)(),
                        data: {},
                        success: true,
                    });
                }
                // Objek untuk menyimpan hasil per tahun
                const yearlyData = {};
                // Iterasi transaksi untuk mengelompokkan berdasarkan tahun & bulan
                transactions.forEach((transaction) => {
                    if (transaction.createdAt) {
                        const transactionDate = new Date(transaction.checkIn);
                        const transactionYear = transactionDate.getFullYear();
                        const monthIndex = transactionDate.getMonth(); // 0 = Januari, 11 = Desember
                        // Jika tahun belum ada di objek, buat array 12 bulan dengan default 0
                        if (!yearlyData[transactionYear]) {
                            yearlyData[transactionYear] = new Array(12).fill(0);
                        }
                        // Tambahkan transaksi ke bulan yang sesuai (hanya menghitung jumlahnya)
                        yearlyData[transactionYear][monthIndex] += 1;
                    }
                });
                // Kirim hasil response
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: yearlyData,
                    success: true,
                });
            }
            catch (error) {
                res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    message: `Failed to fetch transaction data: ${error}`,
                    success: false,
                });
            }
        });
    }
    static ChartPriceTransaction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Ambil semua transaksi dari database
                const transactions = yield models_transaksi_1.TransactionModel.find({ isDeleted: false });
                if (transactions.length === 0) {
                    return res.status(200).json({
                        requestId: (0, uuid_1.v4)(),
                        data: {},
                        success: true,
                    });
                }
                // Objek untuk menyimpan hasil per tahun
                const yearlyData = {};
                // Iterasi transaksi untuk mengelompokkan berdasarkan tahun & bulan
                transactions.forEach((transaction) => {
                    if (transaction.createdAt) {
                        const transactionDate = new Date(transaction.createdAt);
                        const transactionYear = transactionDate.getFullYear();
                        const monthIndex = transactionDate.getMonth(); // 0 = Januari, 11 = Desember
                        // Jika tahun belum ada di objek, buat array 12 bulan dengan default 0
                        if (!yearlyData[transactionYear]) {
                            yearlyData[transactionYear] = new Array(12).fill(0);
                        }
                        // Tambahkan transaksi ke bulan yang sesuai
                        yearlyData[transactionYear][monthIndex] += transaction.grossAmount;
                    }
                });
                // Kirim hasil response
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: yearlyData,
                    success: true,
                });
            }
            catch (error) {
                res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    message: `Failed to fetch transaction data: ${error}`,
                    success: false,
                });
            }
        });
    }
    static TotalProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Query untuk TransactionModel (ambil semua data)
                const room = yield models_room_1.default.find({ isDeleted: false });
                // Kirim hasil response
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: room.length,
                    success: true
                });
            }
            catch (error) {
                res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    message: `Failed to fetch total room ${error}`,
                    success: false
                });
            }
        });
    }
    static TotalUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield models_user_1.default.find({ isDeleted: false });
                // Kirim hasil response
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: user.length,
                    success: true
                });
            }
            catch (error) {
                res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    message: `Failed to fetch total user ${error}`,
                    success: false
                });
            }
        });
    }
    static MostPurchased(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const RoomSold = yield models_ShortAvailable_1.ShortAvailableModel.find({ isDeleted: false }).select('products');
                const roomCount = {};
                RoomSold.forEach(transaction => {
                    transaction.products.forEach((product) => {
                        if (roomCount[product.name]) {
                            roomCount[product.name] += product.quantity;
                        }
                        else {
                            roomCount[product.name] = product.quantity;
                        }
                    });
                });
                // Mengubah hasil ke dalam bentuk array
                const resultArray = Object.values(roomCount);
                console.log("cek : ", resultArray);
                // Kirim hasil response
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: resultArray,
                    success: true
                });
            }
            catch (error) {
                res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    message: `Failed to fetch most purchased ${error}`,
                    success: false
                });
            }
        });
    }
}
exports.DashboardController = DashboardController;
