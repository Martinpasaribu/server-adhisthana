"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.PendingRoomController = void 0;
var models_PendingRoom_1 = require("../../models/PendingRoom/models_PendingRoom");
var uuid_1 = require("uuid");
var PendingRoomController = /** @class */ (function () {
    function PendingRoomController() {
    }
    PendingRoomController.GetData = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var RoomPending, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, models_PendingRoom_1.PendingRoomModel.find({ isDeleted: false })];
                    case 1:
                        RoomPending = _a.sent();
                        res.status(200).json({
                            requestId: uuid_1.v4(),
                            message: "Successfully retrieved before payment amount. " + RoomPending + ".length",
                            success: true,
                            data: RoomPending
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        res.status(500).json({
                            requestId: uuid_1.v4(),
                            message: error_1.message,
                            success: false,
                            data: null
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PendingRoomController.SetPending = function (room, bookingId, userId, dateIn, dateOut, code, req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var nowUTC, wibTime, lockedUntil_1, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // Validasi input
                        if (!userId || !room || !dateIn || !dateOut) {
                            return [2 /*return*/, res.status(400).json({ message: 'Room, date, or userId is Empty' })];
                        }
                        nowUTC = new Date();
                        wibTime = new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000);
                        if (code === "website")
                            wibTime.setMinutes(wibTime.getMinutes() + 5);
                        if (code === "reservation")
                            wibTime.setMinutes(wibTime.getMinutes() + 15);
                        lockedUntil_1 = wibTime.toISOString().replace("T", " ").split(".")[0] + " GMT+0700 (WIB)";
                        // console.log(` Data SetPending room Date lockedUntil ${lockedUntil}: `)
                        // Iterasi melalui setiap room
                        // for (const r of room) {
                        //     // Pastikan room memiliki properti yang diperlukan
                        //     if (!r.roomId || !r.quantity) {
                        //         return res.status(400).json({ message: `Room data is invalid for roomId: ${r.roomId}` });
                        //     }
                        //     // Buat entri baru di PendingRoomModel
                        //     await PendingRoomModel.create({
                        //         bookingId,
                        //         userId,
                        //         roomId: r.roomId,
                        //         start: dateIn,
                        //         end: dateOut,
                        //         stock: r.quantity,
                        //         lockedUntil
                        //     });
                        // }
                        return [4 /*yield*/, Promise.all(room.map(function (r) {
                                if (!r.roomId || !r.quantity) {
                                    throw new Error("Room data is invalid for roomId: " + r.roomId);
                                }
                                return models_PendingRoom_1.PendingRoomModel.create({
                                    bookingId: bookingId,
                                    userId: userId,
                                    roomId: r.roomId,
                                    start: dateIn,
                                    end: dateOut,
                                    stock: r.quantity,
                                    lockedUntil: lockedUntil_1
                                });
                            }))];
                    case 1:
                        // console.log(` Data SetPending room Date lockedUntil ${lockedUntil}: `)
                        // Iterasi melalui setiap room
                        // for (const r of room) {
                        //     // Pastikan room memiliki properti yang diperlukan
                        //     if (!r.roomId || !r.quantity) {
                        //         return res.status(400).json({ message: `Room data is invalid for roomId: ${r.roomId}` });
                        //     }
                        //     // Buat entri baru di PendingRoomModel
                        //     await PendingRoomModel.create({
                        //         bookingId,
                        //         userId,
                        //         roomId: r.roomId,
                        //         start: dateIn,
                        //         end: dateOut,
                        //         stock: r.quantity,
                        //         lockedUntil
                        //     });
                        // }
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error(error_2);
                        throw new Error('Function SetPending not implemented.');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PendingRoomController.FilterForUpdateBookingWithPending = function (rooms, dateIn, dateOut) {
        return __awaiter(this, void 0, void 0, function () {
            var start, end, nowUTC, wibOffset, wibTime, wibFormatted, now, DataPendingRoom_1, PendingRoom, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        start = new Date(dateIn);
                        end = new Date(dateOut);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        nowUTC = new Date();
                        wibOffset = 7 * 60 * 60 * 1000;
                        wibTime = new Date(nowUTC.getTime() + wibOffset);
                        wibFormatted = wibTime.toISOString().replace("T", " ").split(".")[0] + " GMT+0700 (WIB)";
                        now = wibFormatted;
                        return [4 /*yield*/, models_PendingRoom_1.PendingRoomModel.find({
                                $or: [
                                    {
                                        start: { $lte: end.toISOString() },
                                        end: { $gte: start.toISOString() },
                                        lockedUntil: { $gte: now }
                                    },
                                ],
                                isDeleted: false
                            })];
                    case 2:
                        DataPendingRoom_1 = _a.sent();
                        // console.log(` Data Pending room start ${dateIn}, end ${dateOut} : `, DataPendingRoom)
                        // console.log(` Data Pending room Now ${now}: `, DataPendingRoom)
                        console.log(" Data Filter Pending room Date Now " + now + ": ");
                        PendingRoom = rooms.filter(function (room) {
                            var _a;
                            var roomId = room._id ? room._id.toString() : room.roomId;
                            // Hitung total stock untuk roomId yang sama di DataPendingRoom
                            var totalStock = DataPendingRoom_1
                                .filter(function (data) { return data.roomId === roomId; }) // Ambil data dengan roomId yang sama
                                .reduce(function (sum, data) { return sum + data.stock; }, 0); // Jumlahkan stock
                            // Periksa apakah totalStock lebih besar atau sama dengan availableCount
                            return totalStock >= ((_a = room.availableCount) !== null && _a !== void 0 ? _a : room.quantity);
                        });
                        result = {
                            PendingRoom: PendingRoom
                        };
                        return [2 /*return*/, result];
                    case 3:
                        error_3 = _a.sent();
                        console.error(error_3);
                        throw new Error('Function SetPending not implemented.');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ;
    PendingRoomController.FilterForUpdateVilaWithPending = function (rooms, dateIn, dateOut) {
        return __awaiter(this, void 0, void 0, function () {
            var start, end, nowUTC, wibOffset, wibTime, wibFormatted, now, DataPendingRoom_2, UpdatedRooms, groupedPendingStock_1, WithoutPending, PendingRoom, result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        start = new Date(dateIn);
                        end = new Date(dateOut);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        nowUTC = new Date();
                        wibOffset = 7 * 60 * 60 * 1000;
                        wibTime = new Date(nowUTC.getTime() + wibOffset);
                        wibFormatted = wibTime.toISOString().replace("T", " ").split(".")[0] + " GMT+0700 (WIB)";
                        now = wibFormatted;
                        return [4 /*yield*/, models_PendingRoom_1.PendingRoomModel.find({
                                $or: [
                                    {
                                        start: { $lte: end.toISOString() },
                                        end: { $gte: start.toISOString() },
                                        lockedUntil: { $gte: now }
                                    },
                                ],
                                isDeleted: false
                            })];
                    case 2:
                        DataPendingRoom_2 = _a.sent();
                        UpdatedRooms = rooms.filter(function (room) {
                            var _a;
                            var roomId = room._id ? room._id.toString() : room.roomId;
                            // Hitung total stock untuk roomId yang sama di DataPendingRoom
                            var totalStock = DataPendingRoom_2
                                .filter(function (data) { return data.roomId === roomId; }) // Ambil data dengan roomId yang sama
                                .reduce(function (sum, data) { return sum + data.stock; }, 0); // Jumlahkan stock
                            // Periksa apakah availableCount lebih besar dari totalStock
                            return ((_a = room.availableCount) !== null && _a !== void 0 ? _a : room.quantity) > totalStock;
                        });
                        groupedPendingStock_1 = DataPendingRoom_2.reduce(function (acc, data) {
                            var roomId = data.roomId;
                            if (!acc[roomId]) {
                                acc[roomId] = 0;
                            }
                            acc[roomId] += data.stock; // Jumlahkan stock untuk setiap roomId
                            return acc;
                        }, {});
                        WithoutPending = UpdatedRooms.filter(function (room) {
                            var _a;
                            var roomId = room._id ? room._id.toString() : room.roomId;
                            return !groupedPendingStock_1[roomId] || groupedPendingStock_1[roomId] < ((_a = room.availableCount) !== null && _a !== void 0 ? _a : room.quantity);
                        }).map(function (room) {
                            var _a;
                            var roomId = room._id ? room._id.toString() : room.roomId;
                            var pendingStock = groupedPendingStock_1[roomId] || 0; // Ambil stock pending jika ada
                            return __assign(__assign({}, room), { availableCount: ((_a = room.availableCount) !== null && _a !== void 0 ? _a : room.quantity) - pendingStock });
                        });
                        PendingRoom = rooms.filter(function (room) {
                            var _a;
                            var roomId = room._id ? room._id.toString() : room.roomId;
                            // Hitung total stock untuk roomId yang sama di DataPendingRoom
                            var totalStock = DataPendingRoom_2
                                .filter(function (data) { return data.roomId === roomId; }) // Ambil data dengan roomId yang sama
                                .reduce(function (sum, data) { return sum + data.stock; }, 0); // Jumlahkan stock
                            // Periksa apakah totalStock lebih besar atau sama dengan availableCount
                            return totalStock >= ((_a = room.availableCount) !== null && _a !== void 0 ? _a : room.quantity);
                        });
                        result = {
                            WithoutPending: WithoutPending,
                            PendingRoom: PendingRoom
                        };
                        return [2 /*return*/, result];
                    case 3:
                        error_4 = _a.sent();
                        console.error(error_4);
                        throw new Error('Function SetPending not implemented.');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ;
    PendingRoomController.UpdatePending = function (TransactionId) {
        return __awaiter(this, void 0, void 0, function () {
            var ResultUpdate, message, message, error_5, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, models_PendingRoom_1.PendingRoomModel.findOneAndUpdate({ bookingId: TransactionId, isDeleted: false }, { isDeleted: true }, { "new": true } // Mengembalikan data yang diperbarui
                            )];
                    case 1:
                        ResultUpdate = _a.sent();
                        // Memeriksa apakah data berhasil diperbarui
                        if (ResultUpdate) {
                            message = "Transaction: " + TransactionId + " set no pending";
                            return [2 /*return*/, message];
                        }
                        else {
                            message = "Transaction: " + TransactionId + " not found or already deleted";
                            console.warn(message);
                            return [2 /*return*/, message];
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        console.error("Error updating room pending:", error_5);
                        message = "Transaction: " + TransactionId + " error setting no pending: " + error_5;
                        return [2 /*return*/, message];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return PendingRoomController;
}());
exports.PendingRoomController = PendingRoomController;
