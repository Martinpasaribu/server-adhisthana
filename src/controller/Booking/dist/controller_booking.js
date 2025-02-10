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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.BookingController = void 0;
var uuid_1 = require("uuid");
// Gunakan dynamic import
var crypto_1 = require("crypto");
var midtransConfig_1 = require("../../config/midtransConfig");
var constant_1 = require("../../constant");
var FilterAvailableRoom_1 = require("../ShortAvailable/FilterAvailableRoom");
var SiteMinderFilter_1 = require("./SiteMinderFilter");
var SetPriceDayList_1 = require("../ShortAvailable/SetPriceDayList");
var SetResponseShort_1 = require("../ShortAvailable/SetResponseShort");
var Controller_PendingRoom_1 = require("../PendingRoom/Controller_PendingRoom");
var SetAvailableCounts_1 = require("./SetAvailableCounts");
var TransactionService_1 = require("../Transaction/TransactionService");
var BookingController = /** @class */ (function () {
    function BookingController() {
    }
    BookingController.addBooking = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var UserId, BookingReq, RoomCanUse, roomDetails, _loop_1, _i, _a, roomBooking, state_1, RoomsAvailableCount, availableRoomsWithoutPending, night, Day, grossAmount, bookingId, FilterSiteMinders, setPriceDayList, updateRoomsAvailable, midtransPayload, midtransResponse, transaction, bookingData, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        UserId = req.userId;
                        BookingReq = req.body;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 12, , 13]);
                        return [4 /*yield*/, FilterAvailableRoom_1.FilterAvailable(BookingReq.checkIn, BookingReq.checkOut)];
                    case 2:
                        RoomCanUse = _b.sent();
                        roomDetails = RoomCanUse.filter(function (room) {
                            return BookingReq.room.some(function (r) { return r.roomId.toString() === room._id.toString(); });
                        });
                        if (!roomDetails) {
                            return [2 /*return*/, res.status(400).json({ status: 'error', message: "Filter Room Available not found" })];
                        }
                        _loop_1 = function (roomBooking) {
                            var room = roomDetails.find(function (r) { return r._id.toString() === roomBooking.roomId.toString(); });
                            if (!room) {
                                return { value: res.status(400).json({ status: 'error', message: "Room with ID " + roomBooking.roomId + " not found" }) };
                            }
                            // Check if the room is sold out or requested quantity exceeds availability
                            if (room.available <= 0) {
                                return { value: res.status(400).json({ status: 'error', message: "Room with ID " + roomBooking.roomId + " is sold out" }) };
                            }
                            if (roomBooking.quantity > room.available) {
                                return { value: res.status(400).json({
                                        status: 'error',
                                        message: "Room with ID " + roomBooking.roomId + " has only " + room.available + " available, but you requested " + roomBooking.quantity
                                    }) };
                            }
                        };
                        // Validate again room availability
                        for (_i = 0, _a = BookingReq.room; _i < _a.length; _i++) {
                            roomBooking = _a[_i];
                            state_1 = _loop_1(roomBooking);
                            if (typeof state_1 === "object")
                                return [2 /*return*/, state_1.value];
                        }
                        return [4 /*yield*/, SetAvailableCounts_1.SetAvailableCount(BookingReq.room, BookingReq.checkIn, BookingReq.checkOut)];
                    case 3:
                        RoomsAvailableCount = _b.sent();
                        return [4 /*yield*/, Controller_PendingRoom_1.PendingRoomController.FilterForUpdateVilaWithPending(RoomsAvailableCount, BookingReq.checkIn, BookingReq.checkOut)];
                    case 4:
                        availableRoomsWithoutPending = _b.sent();
                        if ((availableRoomsWithoutPending === null || availableRoomsWithoutPending === void 0 ? void 0 : availableRoomsWithoutPending.PendingRoom.length) > 0) {
                            return [2 /*return*/, res.status(400).json({ status: 'error', message: "Some of the rooms you select have already been purchased", data: availableRoomsWithoutPending === null || availableRoomsWithoutPending === void 0 ? void 0 : availableRoomsWithoutPending.PendingRoom })];
                        }
                        night = Number(BookingReq.night);
                        Day = {
                            In: BookingReq.checkIn,
                            Out: BookingReq.checkOut
                        };
                        grossAmount = Number(BookingReq.grossAmount);
                        bookingId = 'TRX-' + crypto_1["default"].randomBytes(5).toString('hex');
                        return [4 /*yield*/, SiteMinderFilter_1.FilterSiteMinder(BookingReq.checkIn, BookingReq.checkOut)
                            // Filter Room dengan harga yang sudah singkron dengan siteMinder
                        ];
                    case 5:
                        FilterSiteMinders = _b.sent();
                        return [4 /*yield*/, SetPriceDayList_1.SetPriceDayList(roomDetails, FilterSiteMinders, Day)
                            // Filter untuk singkron price per Item dengan lama malam -nya menjadi priceDateList
                        ];
                    case 6:
                        setPriceDayList = _b.sent();
                        return [4 /*yield*/, SetResponseShort_1.SetResponseShort(roomDetails, setPriceDayList)
                            // SetUp Room yang akan masuk dalam Room Pending
                        ];
                    case 7:
                        updateRoomsAvailable = _b.sent();
                        // SetUp Room yang akan masuk dalam Room Pending
                        return [4 /*yield*/, Controller_PendingRoom_1.PendingRoomController.SetPending(BookingReq.room, bookingId, UserId, BookingReq.checkIn, BookingReq.checkOut, req, res)];
                    case 8:
                        // SetUp Room yang akan masuk dalam Room Pending
                        _b.sent();
                        midtransPayload = {
                            transaction_details: {
                                order_id: bookingId,
                                gross_amount: grossAmount
                            },
                            customer_details: {
                                first_name: BookingReq.name,
                                email: BookingReq.email
                            },
                            item_details: __spreadArrays(updateRoomsAvailable.map(function (room) {
                                var roomBooking = BookingReq.room.find(function (r) { return r.roomId.toString() === room._id.toString(); });
                                return {
                                    id: room._id,
                                    price: room.priceDateList,
                                    quantity: (roomBooking === null || roomBooking === void 0 ? void 0 : roomBooking.quantity) || 1,
                                    name: room.name
                                };
                            }))
                        };
                        return [4 /*yield*/, midtransConfig_1.snap.createTransaction(midtransPayload)];
                    case 9:
                        midtransResponse = _b.sent();
                        return [4 /*yield*/, TransactionService_1.transactionService.createTransaction({
                                bookingId: bookingId,
                                name: BookingReq.name,
                                email: BookingReq.email,
                                phone: BookingReq.phone,
                                status: constant_1.PENDING_PAYMENT,
                                checkIn: BookingReq.checkIn,
                                checkOut: BookingReq.checkOut,
                                grossAmount: grossAmount,
                                userId: UserId !== null && UserId !== void 0 ? UserId : BookingReq.email,
                                products: roomDetails.map(function (room) {
                                    var roomBooking = BookingReq.room.find(function (r) { return r.roomId.toString() === room._id.toString(); });
                                    return {
                                        roomId: room._id,
                                        name: room.name,
                                        quantity: roomBooking === null || roomBooking === void 0 ? void 0 : roomBooking.quantity,
                                        price: roomBooking === null || roomBooking === void 0 ? void 0 : roomBooking.price
                                    };
                                }),
                                // snap_token: midtransResponse.token,
                                snap_token: '/',
                                paymentUrl: midtransResponse.redirect_url,
                                payment_type: midtransResponse.payment_type,
                                va_numbers: midtransResponse.va_numbers,
                                bank: midtransResponse.bank,
                                card_type: midtransResponse.card_type
                            })];
                    case 10:
                        transaction = _b.sent();
                        return [4 /*yield*/, TransactionService_1.transactionService.createBooking({
                                name: BookingReq.name,
                                email: BookingReq.email,
                                phone: BookingReq.phone,
                                orderId: bookingId,
                                checkIn: BookingReq.checkIn,
                                checkOut: BookingReq.checkOut,
                                adult: BookingReq.adult,
                                children: BookingReq.children,
                                amountTotal: grossAmount,
                                amountBefDisc: BookingReq.amountBefDisc || grossAmount,
                                couponId: BookingReq.couponId || null,
                                userId: UserId !== null && UserId !== void 0 ? UserId : BookingReq.email,
                                creatorId: uuid_1.v4(),
                                rooms: roomDetails.map(function (room) {
                                    var roomBooking = BookingReq.room.find(function (r) { return r.roomId.toString() === room._id.toString(); });
                                    return {
                                        roomId: room._id,
                                        quantity: roomBooking.quantity,
                                        price: roomBooking === null || roomBooking === void 0 ? void 0 : roomBooking.price
                                    };
                                })
                            })];
                    case 11:
                        bookingData = _b.sent();
                        res.status(201).json({
                            status: 'success',
                            data: {
                                message: ' successfully Booking',
                                id: bookingId,
                                transaction: transaction,
                                paymentUrl: midtransResponse.redirect_url,
                                snap_token: midtransResponse.token
                            }
                        });
                        console.log("Successfully Add Booking ");
                        return [3 /*break*/, 13];
                    case 12:
                        error_1 = _b.sent();
                        res.status(400).json({
                            requestId: uuid_1.v4(),
                            data: null,
                            message: error_1.message,
                            success: false
                        });
                        console.log(" Error Booking ");
                        return [3 /*break*/, 13];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    return BookingController;
}());
exports.BookingController = BookingController;
