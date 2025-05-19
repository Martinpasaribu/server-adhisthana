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
exports.ReservationService = void 0;
var SetAvailableCounts_1 = require("../../../Booking/SetAvailableCounts");
var Controller_PendingRoom_1 = require("../../../PendingRoom/Controller_PendingRoom");
var FilterAvailableRoom_1 = require("../../../ShortAvailable/FilterAvailableRoom");
var reservationService = /** @class */ (function () {
    function reservationService() {
    }
    // Fungsi untuk membuat Data Transaksi 
    reservationService.prototype.createReservation = function (_a) {
        var products = _a.products, checkIn = _a.checkIn, checkOut = _a.checkOut;
        return __awaiter(this, void 0, void 0, function () {
            var RoomCanUse, roomDetails, _loop_1, _i, products_1, roomBooking, RoomsAvailableCount, availableRoomsWithoutPending;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, FilterAvailableRoom_1.FilterAvailable02(checkIn, checkOut)];
                    case 1:
                        RoomCanUse = _b.sent();
                        roomDetails = RoomCanUse.filter(function (room) {
                            return products.some(function (r) { return r.roomId.toString() === room._id.toString(); });
                        });
                        if (!roomDetails) {
                            // return res.status(400).json({ status: 'error', message: `Filter Room Available not found` });
                            throw new Error('Filter Room Available not found');
                        }
                        _loop_1 = function (roomBooking) {
                            var room = roomDetails.find(function (r) { return r._id.toString() === roomBooking.roomId.toString(); });
                            if (!room) {
                                // return res.status(400).json({ status: 'error', message: `Room with ID ${roomBooking.roomId} not found` });
                                throw new Error("Room with ID " + roomBooking.roomId + " not found");
                            }
                            // Check if the room is sold out or requested quantity exceeds availability
                            if (room.available <= 0) {
                                // return res.status(400).json({ status: 'error', message: `Room with ID ${roomBooking.roomId} is sold out` });
                                throw new Error("Room with ID " + roomBooking.roomId + " is sold out");
                            }
                            if (roomBooking.quantity > room.available) {
                                // return res.status(400).json({ 
                                //     status: 'error', 
                                //     message: `Room with ID ${roomBooking.roomId} has only ${room.available} available, but you requested ${roomBooking.quantity}` 
                                // });
                                throw new Error("Room with ID " + roomBooking.roomId + " has only " + room.available + " available, but you requested " + roomBooking.quantity);
                            }
                        };
                        // Validate again room availability
                        for (_i = 0, products_1 = products; _i < products_1.length; _i++) {
                            roomBooking = products_1[_i];
                            _loop_1(roomBooking);
                        }
                        return [4 /*yield*/, SetAvailableCounts_1.SetAvailableCount(products, checkIn, checkOut)];
                    case 2:
                        RoomsAvailableCount = _b.sent();
                        return [4 /*yield*/, Controller_PendingRoom_1.PendingRoomController.FilterForUpdateVilaWithPending(RoomsAvailableCount, checkIn, checkOut)];
                    case 3:
                        availableRoomsWithoutPending = _b.sent();
                        if ((availableRoomsWithoutPending === null || availableRoomsWithoutPending === void 0 ? void 0 : availableRoomsWithoutPending.PendingRoom.length) > 0) {
                            // return res.status(400).json({ status: 'error', message: `Some of the rooms you select have already been purchased`, data :availableRoomsWithoutPending?.PendingRoom });
                            throw new Error("Some of the rooms you select have already been purchased " + JSON.stringify(availableRoomsWithoutPending === null || availableRoomsWithoutPending === void 0 ? void 0 : availableRoomsWithoutPending.PendingRoom));
                        }
                        console.log(" hasil filter reservation dengan room pending : " + availableRoomsWithoutPending.PendingRoom);
                        return [2 /*return*/, availableRoomsWithoutPending];
                }
            });
        });
    };
    return reservationService;
}());
exports.ReservationService = new reservationService();
