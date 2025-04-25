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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.transactionService = void 0;
var models_booking_1 = require("../../models/Booking/models_booking");
var models_transaksi_1 = require("../../models/Transaction/models_transaksi");
var TransactionService = /** @class */ (function () {
    function TransactionService() {
    }
    // Fungsi untuk membuat Data Transaksi 
    TransactionService.prototype.createTransaction = function (_a) {
        var bookingId = _a.bookingId, booking_keyId = _a.booking_keyId, name = _a.name, email = _a.email, phone = _a.phone, status = _a.status, grossAmount = _a.grossAmount, userId = _a.userId, checkIn = _a.checkIn, checkOut = _a.checkOut, products = _a.products, snap_token = _a.snap_token, paymentUrl = _a.paymentUrl, payment_type = _a.payment_type, bank = _a.bank, card_type = _a.card_type, va_numbers = _a.va_numbers;
        return __awaiter(this, void 0, void 0, function () {
            var transaction;
            return __generator(this, function (_b) {
                transaction = {
                    name: name,
                    email: email,
                    phone: phone,
                    bookingId: bookingId,
                    booking_keyId: booking_keyId,
                    status: status,
                    grossAmount: grossAmount,
                    userId: userId,
                    checkIn: checkIn,
                    checkOut: checkOut,
                    products: products.map(function (products) { return ({
                        roomId: products.roomId,
                        price: products.price,
                        quantity: products.quantity,
                        name: products.name,
                        image: products.image
                    }); }),
                    snap_token: snap_token,
                    payment_type: '',
                    card_type: card_type,
                    paymentUrl: paymentUrl,
                    va_numbers: va_numbers
                        ? va_numbers.map(function (va_number) { return ({
                            va_number: va_number.va_number,
                            bank: va_number.bank
                        }); })
                        : [],
                    bank: bank,
                    createdAt: new Date()
                };
                // Save to database (example using MongoDB)
                return [2 /*return*/, models_transaksi_1.TransactionModel.create(transaction)];
            });
        });
    };
    // Fungsi untuk membuat data booking
    TransactionService.prototype.createBooking = function (_a) {
        var orderId = _a.orderId, name = _a.name, email = _a.email, phone = _a.phone, checkIn = _a.checkIn, checkOut = _a.checkOut, adult = _a.adult, children = _a.children, amountTotal = _a.amountTotal, amountBefDisc = _a.amountBefDisc, couponId = _a.couponId, userId = _a.userId, creatorId = _a.creatorId, rooms = _a.rooms;
        return __awaiter(this, void 0, void 0, function () {
            var bookingData, createdBooking, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        bookingData = {
                            name: name,
                            email: email,
                            phone: phone,
                            orderId: orderId,
                            checkIn: checkIn,
                            checkOut: checkOut,
                            adult: adult,
                            children: children,
                            amountTotal: amountTotal,
                            amountBefDisc: amountBefDisc,
                            couponId: couponId,
                            userId: userId,
                            room: rooms.map(function (room) { return ({
                                roomId: room.roomId,
                                quantity: room.quantity,
                                image: room.image
                            }); }),
                            creatorId: creatorId,
                            createAt: Date.now()
                        };
                        return [4 /*yield*/, models_booking_1.BookingModel.create(bookingData)];
                    case 1:
                        createdBooking = _b.sent();
                        return [2 /*return*/, createdBooking._id];
                    case 2:
                        error_1 = _b.sent();
                        console.error('Error creating booking:', error_1);
                        throw new Error('Failed to create booking');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    TransactionService.prototype.updateTransactionStatus = function (_a) {
        var transactionId = _a.transactionId, status = _a.status;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, models_booking_1.BookingModel.findByIdAndUpdate(transactionId, { status: status }, { "new": true })];
            });
        });
    };
    TransactionService.prototype.getTransactions = function (_a) {
        var status = _a.status;
        return __awaiter(this, void 0, void 0, function () {
            var query;
            return __generator(this, function (_b) {
                query = status ? { status: status } : {};
                return [2 /*return*/, models_booking_1.BookingModel.find(query)];
            });
        });
    };
    return TransactionService;
}());
exports.transactionService = new TransactionService();
