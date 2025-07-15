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
exports.InvoiceController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const models_booking_1 = require("../../../models/Booking/models_booking");
const crypto_1 = __importDefault(require("crypto"));
const AddPayment_1 = require("../Reservation/components/AddPayment");
class InvoiceController {
    static SetInvoice(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_Booking, id_Product, note, code, less, totalPrice } = data;
                if (!id_Booking || !id_Product || !note || !code || !totalPrice) {
                    return {
                        status: false,
                        message: 'field need invoice'
                    };
                }
                const invoice = {
                    status: less === 0 ? false : true,
                    id: 'INV-' + crypto_1.default.randomBytes(4).toString('hex'),
                    id_Product,
                    subject: code === "VLA" ? "Villa" : "Food & Drink",
                    note,
                    less,
                    totalPrice,
                    code
                };
                const updatedInvoice = yield models_booking_1.BookingModel.findByIdAndUpdate({ _id: new mongoose_1.default.Types.ObjectId(id_Booking), isDeleted: false }, { $push: { invoice } }, { new: true, runValidators: true });
                return {
                    status: true,
                    message: `Successfully Set Invoice: ${invoice.id}`,
                    id_Invoice: invoice.id,
                    data: updatedInvoice === null || updatedInvoice === void 0 ? void 0 : updatedInvoice.invoice // <- ini kunci
                };
            }
            catch (error) {
                console.error("Error creating Invoice:", error);
                return {
                    status: false,
                    message: error.message || "Internal Server Error"
                };
            }
        });
    }
    static CreateInvoiceBooking(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_Booking, id_Product, code, code2, less, totalPrice, subject } = req.body;
                if (!id_Booking || !id_Product || !code || !less || !totalPrice) {
                    return res.status(400).json({
                        status: false,
                        message: 'field need invoice'
                    });
                }
                const invoice = {
                    status: true,
                    id: 'INV-' + crypto_1.default.randomBytes(4).toString('hex'),
                    id_Product,
                    subject,
                    note: 'Suspended',
                    less,
                    totalPrice,
                    code,
                    code2,
                };
                const updatedInvoice = yield models_booking_1.BookingModel.findByIdAndUpdate({ _id: new mongoose_1.default.Types.ObjectId(id_Booking), isDeleted: false }, { $push: { invoice } }, { new: true, runValidators: true });
                return res.status(200).json({
                    status: true,
                    message: `Successfully Set Invoice: ${invoice.id}`,
                    id_Invoice: invoice.id,
                    data: updatedInvoice === null || updatedInvoice === void 0 ? void 0 : updatedInvoice.invoice
                });
            }
            catch (error) {
                console.error("Error creating Invoice:", error);
                return res.status(500).json({
                    status: false,
                    message: error.message || "Internal Server Error"
                });
            }
        });
    }
    static PayInvoice(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_Booking, code } = req.params;
                const { id_Invoice, paid, payment } = req.body;
                if (!id_Booking || !id_Invoice || paid === undefined) {
                    return res.status(400).json({
                        status: false,
                        message: 'Missing required fields',
                    });
                }
                const booking = yield models_booking_1.BookingModel.findOne({
                    _id: new mongoose_1.default.Types.ObjectId(id_Booking),
                    isDeleted: false,
                });
                if (!booking) {
                    return res.status(404).json({ message: 'Booking not found' });
                }
                const invoiceIndex = booking.invoice.findIndex(inv => inv.id === id_Invoice);
                if (invoiceIndex === -1) {
                    return res.status(404).json({ message: 'Invoice not found' });
                }
                const currentLess = booking.invoice[invoiceIndex].less;
                const result = (currentLess <= 0 || paid > currentLess) ? 0 : currentLess - paid;
                booking.invoice[invoiceIndex].less = result;
                booking.invoice[invoiceIndex].status = result !== 0;
                booking.invoice[invoiceIndex].note = result === 0 ? "Paid" : "Suspended";
                booking.invoice[invoiceIndex].timePaid = Date.now();
                let ResponseInvoice = "";
                let DataInvoice = {};
                if (code === "FAD") {
                    const Pay = Number(paid);
                    const dishIndex = booking.dish.findIndex(dis => dis.id_Invoice === id_Invoice);
                    if (dishIndex === -1) {
                        ResponseInvoice = 'Dish not found';
                    }
                    else {
                        const dishCurrentLess = booking.dish[dishIndex].amountPrice;
                        const dishResult = (dishCurrentLess <= 0 || Pay > dishCurrentLess) ? 0 : dishCurrentLess - Pay;
                        DataInvoice = booking.dish[dishIndex];
                        booking.dish[dishIndex].amountPrice = dishResult;
                        booking.dish[dishIndex].status = dishResult !== 0;
                        booking.dish[dishIndex].note = dishResult === 0 ? "Paid" : "Suspended";
                    }
                }
                yield booking.save();
                const StatusAddPayment = yield (0, AddPayment_1.AddPayment)(payment, id_Booking);
                return res.status(200).json({
                    message: 'Invoice updated successfully',
                    responseInvoice: ResponseInvoice,
                    messageAddPayment: `Status : ${StatusAddPayment}`,
                    DataInvoice: DataInvoice,
                    data: booking.invoice[invoiceIndex],
                });
            }
            catch (error) {
                console.error("Error creating Invoice:", error);
                return res.status(500).json({
                    status: false,
                    message: error.message || "Internal Server Error",
                });
            }
        });
    }
    static DeletedInvoiceBooking(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_Booking, id_Product } = data;
            try {
                const booking = yield models_booking_1.BookingModel.findOne({ _id: id_Booking, isDeleted: false });
                if (!booking) {
                    return {
                        status: false,
                        message: 'Invoice not found!'
                    };
                }
                // Temukan invoice yang akan dihapus
                const deletedInvoice = booking.invoice.find((item) => item.id_Product === id_Product);
                if (!deletedInvoice) {
                    return {
                        status: false,
                        message: 'Invoice product not found in booking!'
                    };
                }
                // Hapus invoice dari array dish
                booking.invoice = booking.invoice.filter((item) => item.id_Product !== id_Product);
                // Simpan perubahan
                yield booking.save();
                return {
                    status: true,
                    message: `Successfully deleted invoice: ${id_Product}`,
                    id_Invoice: id_Product,
                    data: deletedInvoice // mengembalikan data invoice yang dihapus
                };
            }
            catch (error) {
                console.error(`Error deleting invoice ${id_Product}:`, error);
                return {
                    status: false,
                    message: error.message || "Internal Server Error"
                };
            }
        });
    }
}
exports.InvoiceController = InvoiceController;
