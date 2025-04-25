"use strict";
// controllers/DishController.ts
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
exports.AdminDishController = void 0;
const uuid_1 = require("uuid");
const models_dish_1 = __importDefault(require("../../../models/Dish/models_dish"));
const models_booking_1 = require("../../../models/Booking/models_booking");
const controller_invoice_1 = require("../Invoice/controller_invoice");
class AdminDishController {
    static AddMenu(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { type, code, name, stock, price, desc } = req.body;
            try {
                if (!type || !code || !name || !price || !desc) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: `field can't be empty`,
                        success: false
                    });
                }
                // 1. Cek apakah email sudah terdaftar
                const dish = yield models_dish_1.default.findOne({ name });
                if (dish) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: `Dish ${name} sudah terdaftar.`,
                        success: false
                    });
                }
                // 4. Simpan user ke DB
                const user = yield models_dish_1.default.create({
                    type,
                    code,
                    name,
                    stock,
                    price,
                    desc
                });
                // 5. Respon sukses
                return res.status(201).json({
                    requestId: (0, uuid_1.v4)(),
                    data: user,
                    message: "Menu berhasil di daftarkan.",
                    success: true
                });
            }
            catch (error) {
                console.error("Add Menu Error:", error);
                return res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message || "Terjadi kesalahan pada server.",
                    success: false
                });
            }
        });
    }
    static GetDish(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Query untuk TransactionModel (ambil semua data)
                const dish = yield models_dish_1.default.find({ isDeleted: false });
                // Kirim hasil response
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: dish,
                    success: true
                });
            }
            catch (error) {
                console.error('Error fetching dish :', error);
                return res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message || "Internal Server Error",
                    success: false
                });
            }
        });
    }
    ;
    static DeletedDishBooking(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_booking, id_dish } = req.params;
            try {
                const booking = yield models_booking_1.BookingModel.findOne({ _id: id_booking, isDeleted: false });
                if (!booking) {
                    return res.status(404).json({
                        requestId: (0, uuid_1.v4)(),
                        message: "Booking not found",
                        success: false
                    });
                }
                // Anggap booking.dishes adalah array dari objek dish atau array ID dish
                // Hapus dish berdasarkan id_dish
                booking.dish = booking.dish.filter((item) => item.id !== id_dish);
                // Simpan perubahan
                yield booking.save();
                const data = {
                    id_Booking: id_booking,
                    id_Product: id_dish
                };
                const DeleteInvoice = yield controller_invoice_1.InvoiceController.DeletedInvoiceBooking(data);
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    message: `Dish : ${id_dish} deleted successfully from booking ${id_booking} `,
                    messageInvoice: DeleteInvoice.message,
                    dataInvoice: DeleteInvoice.data,
                    success: true
                });
            }
            catch (error) {
                console.error(`Error deleting dish ${id_dish}:`, error);
                return res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    message: error.message || "Internal Server Error",
                    success: false
                });
            }
        });
    }
}
exports.AdminDishController = AdminDishController;
