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
exports.ReservationController = void 0;
var uuid_1 = require("uuid");
var crypto_1 = require("crypto");
var models_transaksi_1 = require("../../../models/Transaction/models_transaksi");
var Index_1 = require("./components/Index");
var FilterWithRoomPending_1 = require("./components/FilterWithRoomPending");
var Controller_PendingRoom_1 = require("../../PendingRoom/Controller_PendingRoom");
var controller_short_1 = require("../../ShortAvailable/controller_short");
var constant_1 = require("../../../constant");
var models_booking_1 = require("../../../models/Booking/models_booking");
var ReservationController = /** @class */ (function () {
    function ReservationController() {
    }
    ReservationController.GetAllTransactionReservation = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var filterQuery, transactions, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        filterQuery = {
                            status: { $in: [constant_1.PAYMENT_ADMIN, constant_1.PAID_ADMIN] },
                            reservation: true,
                            isDeleted: false
                        };
                        return [4 /*yield*/, models_transaksi_1.TransactionModel.find(filterQuery)];
                    case 1:
                        transactions = _a.sent();
                        // console.log('data availble transactions :', transactions);
                        // Kirim hasil response
                        res.status(200).json({
                            requestId: uuid_1.v4(),
                            data: transactions,
                            success: true
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        res.status(500).json({ message: "Failed to fetch transactions", error: error_1 });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ReservationController.AddTransaction = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, booking_keyId, title, name, email, phone, grossAmount, reservation, products, night, checkIn, checkOut, ReservationReadyToBeSaved, bookingId, status, IsHaveAccount, userId, newTransaction, savedTransaction, newBooking, savedBooking, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 8, , 9]);
                        _a = req.body, booking_keyId = _a.booking_keyId, title = _a.title, name = _a.name, email = _a.email, phone = _a.phone, grossAmount = _a.grossAmount, reservation = _a.reservation, products = _a.products, night = _a.night, checkIn = _a.checkIn, checkOut = _a.checkOut;
                        // ✅ Validasi data sebelum disimpan
                        if (!title || !name || !email || !phone || !grossAmount || !checkIn || !checkOut) {
                            return [2 /*return*/, res.status(400).json({
                                    requestId: uuid_1.v4(),
                                    data: null,
                                    message: "All required fields must be provided!",
                                    success: false
                                })];
                        }
                        return [4 /*yield*/, FilterWithRoomPending_1.ReservationService.createReservation({ products: products, checkIn: checkIn, checkOut: checkOut })];
                    case 1:
                        ReservationReadyToBeSaved = _b.sent();
                        if (ReservationReadyToBeSaved.WithoutPending === 0) {
                        }
                        bookingId = 'TRX-' + crypto_1["default"].randomBytes(5).toString('hex');
                        status = constant_1.PAYMENT_ADMIN;
                        return [4 /*yield*/, Index_1.CekUser(email)];
                    case 2:
                        IsHaveAccount = _b.sent();
                        userId = void 0;
                        if (!!IsHaveAccount) return [3 /*break*/, 4];
                        return [4 /*yield*/, Index_1.Register(title, name, email, phone)];
                    case 3:
                        userId = _b.sent();
                        _b.label = 4;
                    case 4:
                        newTransaction = new models_transaksi_1.TransactionModel({
                            bookingId: bookingId,
                            booking_keyId: booking_keyId,
                            userId: IsHaveAccount !== null && IsHaveAccount !== void 0 ? IsHaveAccount : userId,
                            status: status,
                            title: title,
                            name: name,
                            email: email,
                            phone: phone,
                            grossAmount: grossAmount,
                            reservation: reservation,
                            products: ReservationReadyToBeSaved.WithoutPending,
                            night: night,
                            checkIn: checkIn,
                            checkOut: checkOut
                        });
                        return [4 /*yield*/, newTransaction.save()];
                    case 5:
                        savedTransaction = _b.sent();
                        newBooking = new models_booking_1.BookingModel({
                            oderId: bookingId,
                            userId: IsHaveAccount !== null && IsHaveAccount !== void 0 ? IsHaveAccount : userId,
                            status: status,
                            title: title,
                            name: name,
                            email: email,
                            phone: phone,
                            amountTotal: grossAmount,
                            reservation: reservation,
                            room: ReservationReadyToBeSaved.WithoutPending,
                            night: night,
                            checkIn: checkIn,
                            checkOut: checkOut
                        });
                        return [4 /*yield*/, newBooking.save()];
                    case 6:
                        savedBooking = _b.sent();
                        // SetUp Room yang akan masuk dalam Room Pending
                        return [4 /*yield*/, Controller_PendingRoom_1.PendingRoomController.SetPending(ReservationReadyToBeSaved.WithoutPending, bookingId, IsHaveAccount !== null && IsHaveAccount !== void 0 ? IsHaveAccount : userId, checkIn, checkOut, req, res)
                            // ✅ Berikan respon sukses
                        ];
                    case 7:
                        // SetUp Room yang akan masuk dalam Room Pending
                        _b.sent();
                        // ✅ Berikan respon sukses
                        return [2 /*return*/, res.status(201).json({
                                requestId: uuid_1.v4(),
                                data: {
                                    acknowledged: true,
                                    insertedTransactionId: savedTransaction._id,
                                    insertedBoopkingId: savedBooking._id
                                },
                                message: "Successfully add transaction to reservation.",
                                success: true
                            })];
                    case 8:
                        error_2 = _b.sent();
                        console.error("Error creating transaction:", error_2);
                        return [2 /*return*/, res.status(500).json({
                                requestId: uuid_1.v4(),
                                data: null,
                                message: error_2.message || "Internal Server Error",
                                success: false
                            })];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    ReservationController.SetPayment = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var TransactionId, BookingReservation, IsTransaction, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        TransactionId = req.params.TransactionId;
                        // ✅ Validasi data sebelum disimpan
                        if (!TransactionId) {
                            return [2 /*return*/, res.status(400).json({
                                    requestId: uuid_1.v4(),
                                    data: null,
                                    message: "required TransactionId!",
                                    success: false
                                })];
                        }
                        return [4 /*yield*/, models_transaksi_1.TransactionModel.find({ bookingId: TransactionId, isDeleted: false, reservation: true })];
                    case 1:
                        BookingReservation = _a.sent();
                        if (!BookingReservation) {
                            return [2 /*return*/, res.status(400).json({
                                    requestId: uuid_1.v4(),
                                    data: null,
                                    message: "Transaction no found !",
                                    success: false
                                })];
                        }
                        return [4 /*yield*/, models_transaksi_1.TransactionModel.findOneAndUpdate({ bookingId: TransactionId, isDeleted: false, status: constant_1.PAYMENT_ADMIN, reservation: true }, {
                                status: constant_1.PAID_ADMIN
                            })];
                    case 2:
                        IsTransaction = _a.sent();
                        if (!IsTransaction) {
                            return [2 /*return*/, res.status(400).json({
                                    requestId: uuid_1.v4(),
                                    data: null,
                                    message: "Set Transaction no found !",
                                    success: false
                                })];
                        }
                        console.log("Transaction " + IsTransaction.name + " has Pay");
                        return [4 /*yield*/, controller_short_1.ShortAvailableController.addBookedRoomForAvailable({
                                bookingId: TransactionId,
                                userId: IsTransaction.userId,
                                status: constant_1.PAID,
                                checkIn: IsTransaction.checkIn,
                                checkOut: IsTransaction.checkOut,
                                products: IsTransaction.products.map(function (product) { return ({
                                    roomId: product.roomId,
                                    price: product.price,
                                    quantity: product.quantity,
                                    name: product.name
                                }); })
                            }, res)];
                    case 3:
                        _a.sent();
                        // ✅ Berikan respon sukses
                        return [2 /*return*/, res.status(201).json({
                                requestId: uuid_1.v4(),
                                data: {
                                    acknowledged: true
                                },
                                message: "Successfully payment transaction : " + TransactionId,
                                success: true
                            })];
                    case 4:
                        error_3 = _a.sent();
                        console.error("Error creating transaction:", error_3);
                        return [2 /*return*/, res.status(500).json({
                                requestId: uuid_1.v4(),
                                data: null,
                                message: error_3.message || "Internal Server Error",
                                success: false
                            })];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return ReservationController;
}());
exports.ReservationController = ReservationController;
