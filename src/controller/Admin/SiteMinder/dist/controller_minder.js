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
exports.SetMinderController = void 0;
var mongoose_1 = require("mongoose");
var uuid_1 = require("uuid");
var models_room_1 = require("../../../models/Room/models_room");
var constant_1 = require("../../../constant");
var models_SitemMinder_1 = require("../../../models/SiteMinder/models_SitemMinder");
var models_ShortAvailable_1 = require("../../../models/ShortAvailable/models_ShortAvailable");
var log_1 = require("../../../log");
var models_transaksi_1 = require("../../../models/Transaction/models_transaksi");
var GenerateDateRange_1 = require("./components/GenerateDateRange");
var SetMinderController = /** @class */ (function () {
    function SetMinderController() {
    }
    SetMinderController.SetUpPrice = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var prices, bulkOperations, roomId, date, price, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        prices = req.body.prices;
                        if (!prices || typeof prices !== 'object') {
                            return [2 /*return*/, res.status(400).json({ message: 'Invalid data format' })];
                        }
                        bulkOperations = [];
                        for (roomId in prices) {
                            for (date in prices[roomId]) {
                                price = prices[roomId][date];
                                bulkOperations.push({
                                    updateOne: {
                                        filter: { roomId: roomId, date: date },
                                        update: { $set: { price: price } },
                                        upsert: true
                                    }
                                });
                            }
                        }
                        return [4 /*yield*/, models_SitemMinder_1.SiteMinderModel.bulkWrite(bulkOperations)];
                    case 1:
                        _a.sent();
                        res.status(200).json({
                            requestId: uuid_1.v4(),
                            data: null,
                            message: "Prices saved",
                            success: true
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        res.status(500).json({ message: 'Failed to save prices', error: error_1 });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SetMinderController.SetPriceForHolidays = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, id_1, price_1, nationalHolidayDates, bulkOperations, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        _a = req.query, id_1 = _a.id, price_1 = _a.price;
                        // Validasi input
                        if (!id_1 || price_1 == null) {
                            return [2 /*return*/, res.status(400).json({
                                    message: 'Room ID and price are required'
                                })];
                        }
                        nationalHolidayDates = Object.keys(constant_1.NationalHolidays).filter(function (date) { return constant_1.NationalHolidays[date].holiday === true; });
                        if (nationalHolidayDates.length === 0) {
                            return [2 /*return*/, res.status(404).json({
                                    message: 'No national holidays found for the provided year'
                                })];
                        }
                        bulkOperations = nationalHolidayDates.map(function (date) { return ({
                            updateOne: {
                                filter: { roomId: id_1, date: date },
                                update: { $set: { price: price_1 } },
                                upsert: true
                            }
                        }); });
                        if (!(bulkOperations.length > 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, models_SitemMinder_1.SiteMinderModel.bulkWrite(bulkOperations)];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        res.status(200).json({
                            requestId: uuid_1.v4(),
                            data: null,
                            message: "Prices updated for national holidays",
                            success: true
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _b.sent();
                        res.status(500).json({
                            requestId: uuid_1.v4(),
                            data: null,
                            message: error_2.message,
                            success: false
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SetMinderController.SetPriceForCustomDate = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, roomId_1, price_2, dates, dateArray, startDate, endDate, bulkOperations, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        _a = req.body, roomId_1 = _a.roomId, price_2 = _a.price, dates = _a.dates;
                        // Validasi input
                        if (!roomId_1 || price_2 == null) {
                            return [2 /*return*/, res.status(400).json({
                                    message: 'Room ID Or Price are required'
                                })];
                        }
                        if (!dates || dates.length === 0) {
                            return [2 /*return*/, res.status(404).json({
                                    message: 'No found Date custom'
                                })];
                        }
                        dateArray = [];
                        if (Array.isArray(dates)) {
                            if (dates.length === 2) {
                                startDate = dates[0], endDate = dates[1];
                                dateArray = GenerateDateRange_1.generateDateRange(startDate, endDate);
                            }
                            else {
                                // Kalau array lebih dari 2, anggap itu list tanggal manual.
                                dateArray = dates;
                            }
                        }
                        else {
                            // Kalau cuma 1 tanggal (string), masukkan ke array.
                            dateArray = [dates];
                        }
                        bulkOperations = dateArray.map(function (date) { return ({
                            updateOne: {
                                filter: { roomId: roomId_1, date: date },
                                update: { $set: { price: price_2 } },
                                upsert: true
                            }
                        }); });
                        console.log("Bulk operations:", JSON.stringify(bulkOperations, null, 2));
                        if (!(bulkOperations.length > 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, models_SitemMinder_1.SiteMinderModel.bulkWrite(bulkOperations)];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        res.status(200).json({
                            requestId: uuid_1.v4(),
                            data: null,
                            message: "Prices for room " + roomId_1 + " updated for selected dates.",
                            success: true
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _b.sent();
                        res.status(500).json({
                            requestId: uuid_1.v4(),
                            data: null,
                            message: error_3.message,
                            success: false
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SetMinderController.SetPriceWeekDay = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, year, id_2, price_3, allDatesInYear, startDate, endDate, d, dayOfWeek, bulkOperations, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        _a = req.query, year = _a.year, id_2 = _a.id, price_3 = _a.price;
                        // Validasi input
                        if (!id_2 || !price_3 || !year) {
                            return [2 /*return*/, res.status(400).json({
                                    message: 'Room ID and price are required by Weekday'
                                })];
                        }
                        allDatesInYear = [];
                        startDate = new Date(year + "-01-01");
                        endDate = new Date(year + "-12-31");
                        // Metode setDate() sering digunakan untuk memanipulasi tanggal dalam sebuah loop, seperti saat membuat daftar tanggal dalam satu tahun.
                        for (d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) // getDate mengembalikan angka yang merepresentasikan hari dalam seminggu 
                         {
                            dayOfWeek = d.getDay();
                            if (dayOfWeek !== 5 && dayOfWeek !== 6) { // Kecualikan Jumat (5) dan Sabtu (6) untuk disimpan
                                //  mengembalikan tanggal dalam format ISO (contoh: 2025-01-01T00:00:00.000Z). .split('T')[0] mengambil bagian tanggal saja (contoh: 2025-01-01).
                                allDatesInYear.push(d.toISOString().split('T')[0]);
                            }
                        }
                        bulkOperations = allDatesInYear.map(function (date) { return ({
                            updateOne: {
                                filter: { roomId: id_2, date: date },
                                update: { $set: { price: price_3 } },
                                upsert: true
                            }
                        }); });
                        if (!(bulkOperations.length > 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, models_SitemMinder_1.SiteMinderModel.bulkWrite(bulkOperations)];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        res.status(200).json({
                            requestId: uuid_1.v4(),
                            data: null,
                            message: "Prices updated for all weekdays except Fridays and Saturdays",
                            success: true
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _b.sent();
                        res.status(500).json({
                            requestId: uuid_1.v4(),
                            data: null,
                            message: error_4.message,
                            success: false
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SetMinderController.SetPriceWeekend = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, year, id_3, price_4, allDatesInYear, startDate, endDate, d, dayOfWeek, bulkOperations, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        _a = req.query, year = _a.year, id_3 = _a.id, price_4 = _a.price;
                        // Validasi input
                        if (!id_3 || !price_4 || !year) {
                            return [2 /*return*/, res.status(400).json({
                                    message: 'Room ID and price are required by Weekday'
                                })];
                        }
                        allDatesInYear = [];
                        startDate = new Date(year + "-01-01");
                        endDate = new Date(year + "-12-31");
                        // Loop untuk mengidentifikasi tanggal yang jatuh pada Jumat dan Sabtu
                        for (d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
                            dayOfWeek = d.getDay();
                            if (dayOfWeek === 5 || dayOfWeek === 6) { // Jumat (5) atau Sabtu (6)
                                allDatesInYear.push(d.toISOString().split('T')[0]); // Menyimpan tanggal dalam format ISO
                            }
                        }
                        bulkOperations = allDatesInYear.map(function (date) { return ({
                            updateOne: {
                                filter: { roomId: id_3, date: date },
                                update: { $set: { price: price_4 } },
                                upsert: true
                            }
                        }); });
                        if (!(bulkOperations.length > 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, models_SitemMinder_1.SiteMinderModel.bulkWrite(bulkOperations)];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        res.status(200).json({
                            requestId: uuid_1.v4(),
                            data: null,
                            message: "Prices updated for Fridays and Saturdays only",
                            success: true
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _b.sent();
                        res.status(500).json({
                            requestId: uuid_1.v4(),
                            data: null,
                            message: error_5.message,
                            success: false
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SetMinderController.GetAllPriceByYear = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var year, startDate, endDate, prices, formattedPrices_1, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        year = req.query.year;
                        if (!year) {
                            return [2 /*return*/, res.status(400).json({ message: 'Year are required' })];
                        }
                        startDate = new Date(year + "-01-01");
                        endDate = new Date(year + "-12-31");
                        endDate.setMonth(endDate.getMonth() + 1);
                        return [4 /*yield*/, models_SitemMinder_1.SiteMinderModel.find({
                                date: {
                                    $gte: startDate.toISOString().split('T')[0],
                                    $lt: endDate.toISOString().split('T')[0]
                                }
                            })];
                    case 1:
                        prices = _a.sent();
                        formattedPrices_1 = {};
                        prices.forEach(function (_a) {
                            var roomId = _a.roomId, date = _a.date, price = _a.price;
                            if (!formattedPrices_1[roomId]) {
                                formattedPrices_1[roomId] = {};
                            }
                            formattedPrices_1[roomId][date] = price;
                        });
                        res.status(200).json({
                            requestId: uuid_1.v4(),
                            data: formattedPrices_1,
                            message: "Set from year " + year + " ",
                            success: true
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        res.status(500).json({ message: 'Failed to fetch prices', error: error_6 });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SetMinderController.GetAllPrice = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, year, month, startDate, endDate, prices, formattedPrices_2, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.query, year = _a.year, month = _a.month;
                        if (!year || !month) {
                            return [2 /*return*/, res.status(400).json({ message: 'Year and month are required' })];
                        }
                        startDate = new Date(year + "-" + month + "-01");
                        endDate = new Date(startDate);
                        endDate.setMonth(endDate.getMonth() + 1);
                        return [4 /*yield*/, models_SitemMinder_1.SiteMinderModel.find({
                                date: {
                                    $gte: startDate.toISOString().split('T')[0],
                                    $lt: endDate.toISOString().split('T')[0]
                                }
                            })];
                    case 1:
                        prices = _b.sent();
                        formattedPrices_2 = {};
                        prices.forEach(function (_a) {
                            var roomId = _a.roomId, date = _a.date, price = _a.price;
                            if (!formattedPrices_2[roomId]) {
                                formattedPrices_2[roomId] = {};
                            }
                            formattedPrices_2[roomId][date] = price;
                        });
                        res.status(200).json({
                            requestId: uuid_1.v4(),
                            data: formattedPrices_2,
                            message: "Successfully retrieved rooms. From year: " + year + " month: " + month,
                            success: true
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _b.sent();
                        res.status(500).json({ message: 'Failed to fetch prices', error: error_7 });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SetMinderController.GetAllRoomWithAvailable = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, year, month, formattedMonth, startDate, endDate, generateDateRange_1, dateRange_1, roomData, resultFilter_1, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.query, year = _a.year, month = _a.month;
                        // Validasi input
                        if (!year || !month) {
                            return [2 /*return*/, res.status(400).json({ message: "Year and month are required" })];
                        }
                        formattedMonth = String(month).padStart(2, "0");
                        startDate = new Date(year + "-" + formattedMonth + "-01T00:00:00Z");
                        endDate = new Date(startDate);
                        endDate.setUTCMonth(endDate.getUTCMonth() + 1); // Bulan berikutnya
                        generateDateRange_1 = function (start, end) {
                            var dates = [];
                            var currentDate = new Date(start);
                            while (currentDate < end) {
                                dates.push(currentDate.toISOString().split("T")[0]); // Format YYYY-MM-DD
                                currentDate.setUTCDate(currentDate.getUTCDate() + 1); // Tambah 1 hari
                            }
                            return dates;
                        };
                        dateRange_1 = generateDateRange_1(startDate, endDate);
                        return [4 /*yield*/, models_ShortAvailable_1.ShortAvailableModel.find({ isDeleted: false })];
                    case 1:
                        roomData = _b.sent();
                        resultFilter_1 = {};
                        // Proses data
                        roomData.forEach(function (room) {
                            room.products.forEach(function (product) {
                                var roomId = product.roomId;
                                // Inisialisasi resultFilter dengan rentang tanggal
                                if (!resultFilter_1[roomId]) {
                                    resultFilter_1[roomId] = {};
                                    dateRange_1.forEach(function (date) {
                                        resultFilter_1[roomId][date] = 0; // Default 0
                                    });
                                }
                                // Rentang tanggal check-in dan check-out
                                var checkIn = new Date(room.checkIn).toISOString().split("T")[0];
                                var checkOut = new Date(room.checkOut).toISOString().split("T")[0];
                                var validDates = generateDateRange_1(new Date(checkIn), new Date(checkOut));
                                // Perbarui resultFilter dengan tanggal valid
                                validDates.forEach(function (date) {
                                    if (resultFilter_1[roomId][date] !== undefined) {
                                        resultFilter_1[roomId][date] += product.quantity;
                                    }
                                });
                            });
                        });
                        // Kirimkan hasil response
                        res.status(200).json({
                            requestId: uuid_1.v4(),
                            data: resultFilter_1,
                            message: "Successfully retrieved rooms. From year: " + year + ", month: " + month,
                            success: true
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _b.sent();
                        res.status(500).json({ message: "Failed to fetch Room", error: error_8 });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SetMinderController.GetAllRoomWithUnAvailable = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, year, month, formattedMonth, startDate, endDate, generateDateRange_2, dateRange_2, roomData, Room, availabilityRoom_1, resultFilter_2, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        _a = req.query, year = _a.year, month = _a.month;
                        // Validasi input
                        if (!year || !month) {
                            return [2 /*return*/, res.status(400).json({ message: "Year and month are required" })];
                        }
                        formattedMonth = String(month).padStart(2, "0");
                        startDate = new Date(year + "-" + formattedMonth + "-01T00:00:00Z");
                        endDate = new Date(startDate);
                        endDate.setUTCMonth(endDate.getUTCMonth() + 1); // Bulan berikutnya
                        generateDateRange_2 = function (start, end) {
                            var dates = [];
                            var currentDate = new Date(start);
                            while (currentDate < end) {
                                dates.push(currentDate.toISOString().split("T")[0]); // Format YYYY-MM-DD
                                currentDate.setUTCDate(currentDate.getUTCDate() + 1); // Tambah 1 hari
                            }
                            return dates;
                        };
                        dateRange_2 = generateDateRange_2(startDate, endDate);
                        return [4 /*yield*/, models_ShortAvailable_1.ShortAvailableModel.find({ isDeleted: false })];
                    case 1:
                        roomData = _b.sent();
                        return [4 /*yield*/, models_room_1["default"].find({ isDeleted: false })];
                    case 2:
                        Room = _b.sent();
                        availabilityRoom_1 = Room.map(function (room) { return { id: room._id.toString(), availability: room.available }; });
                        log_1.Logging(availabilityRoom_1, "Hasil availabilityRoom ");
                        resultFilter_2 = {};
                        // Proses data
                        roomData.forEach(function (room) {
                            room.products.forEach(function (product) {
                                var roomId = product.roomId;
                                // Inisialisasi resultFilter dengan rentang tanggal
                                if (!resultFilter_2[roomId]) {
                                    resultFilter_2[roomId] = {};
                                    dateRange_2.forEach(function (date) {
                                        resultFilter_2[roomId][date] = 0; // Default 0
                                    });
                                }
                                // Rentang tanggal check-in dan check-out
                                var checkIn = new Date(room.checkIn).toISOString().split("T")[0];
                                var checkOut = new Date(room.checkOut).toISOString().split("T")[0];
                                var validDates = generateDateRange_2(new Date(checkIn), new Date(checkOut));
                                // Perbarui resultFilter dengan tanggal valid
                                validDates.forEach(function (date) {
                                    if (resultFilter_2[roomId][date] !== undefined) {
                                        resultFilter_2[roomId][date] += 0;
                                    }
                                });
                            });
                        });
                        // Ganti nilai 0 dengan availability dari availabilityRoom
                        Object.keys(resultFilter_2).forEach(function (roomId) {
                            var availabilityData = availabilityRoom_1.find(function (room) { return room.id === roomId; });
                            if (availabilityData) {
                                Object.keys(resultFilter_2[roomId]).forEach(function (date) {
                                    if (resultFilter_2[roomId][date] === 0) {
                                        resultFilter_2[roomId][date] = availabilityData.availability;
                                    }
                                });
                            }
                        });
                        // Kirimkan hasil response
                        res.status(200).json({
                            requestId: uuid_1.v4(),
                            data: resultFilter_2,
                            message: "Successfully retrieved rooms. From year: " + year + ", month: " + month,
                            success: true
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_9 = _b.sent();
                        res.status(500).json({ message: "Failed to fetch Room", error: error_9 });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SetMinderController.GetAllTransactionFromYearAndMonth = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, year, month, monthStr, startDate, endDate, AvailableRoom, transactionIds, filterQuery, transactions, error_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        _a = req.query, year = _a.year, month = _a.month;
                        // Validasi input
                        if (!year || !month) {
                            return [2 /*return*/, res.status(400).json({ message: "Year and month are required" })];
                        }
                        monthStr = String(month).padStart(2, "0");
                        startDate = new Date(year + "-" + monthStr + "-01T00:00:00.000Z");
                        endDate = new Date(startDate);
                        endDate.setMonth(endDate.getMonth() + 1); // Tambah 1 bulan
                        endDate.setDate(0); // Set ke hari terakhir bulan sebelumnya (misal, 31 Januari)
                        endDate.setUTCHours(23, 59, 59, 999);
                        console.log("Query range:", startDate.toISOString(), " - ", endDate.toISOString());
                        return [4 /*yield*/, models_ShortAvailable_1.ShortAvailableModel.find({
                                status: "PAID",
                                checkIn: {
                                    $gte: startDate.toISOString(),
                                    $lt: endDate.toISOString()
                                },
                                isDeleted: false
                            }, { transactionId: 1, _id: 0 })];
                    case 1:
                        AvailableRoom = _b.sent();
                        transactionIds = AvailableRoom.map(function (room) { return room.transactionId; });
                        filterQuery = {
                            status: "PAID",
                            checkIn: {
                                $gte: startDate.toISOString(),
                                $lt: endDate.toISOString()
                            },
                            isDeleted: false,
                            bookingId: { $in: transactionIds } // Mencocokkan bookingId dengan transactionId
                        };
                        return [4 /*yield*/, models_transaksi_1.TransactionModel.find(filterQuery)];
                    case 2:
                        transactions = _b.sent();
                        // console.log('data availble transactions :', transactions);
                        // Kirim hasil response
                        res.status(200).json({
                            requestId: uuid_1.v4(),
                            data: transactions,
                            message: "Transaction " + year + "-" + monthStr,
                            message2: "Query range:\", " + startDate.toISOString() + ",  - , " + endDate.toISOString(),
                            success: true
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_10 = _b.sent();
                        res.status(500).json({ message: "Failed to fetch transactions", error: error_10 });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SetMinderController.GetAllTransaction = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var AvailableRoom, transactionIds, filterQuery, transactions, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, models_ShortAvailable_1.ShortAvailableModel.find({
                                status: { $in: [constant_1.PAID, constant_1.PAID_ADMIN] },
                                isDeleted: false
                            }, { transactionId: 1, _id: 0 })];
                    case 1:
                        AvailableRoom = _a.sent();
                        transactionIds = AvailableRoom.map(function (room) { return room.transactionId; });
                        filterQuery = {
                            status: { $in: [constant_1.PAID, constant_1.PAID_ADMIN] },
                            isDeleted: false,
                            bookingId: { $in: transactionIds } // Mencocokkan bookingId dengan transactionId
                        };
                        return [4 /*yield*/, models_transaksi_1.TransactionModel.find(filterQuery)];
                    case 2:
                        transactions = _a.sent();
                        // console.log('data availble transactions :', transactions);
                        // Kirim hasil response
                        res.status(200).json({
                            requestId: uuid_1.v4(),
                            data: transactions,
                            success: true
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_11 = _a.sent();
                        res.status(500).json({ message: "Failed to fetch transactions", error: error_11 });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SetMinderController.DeletedTransaction = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var ShortAvailable, Transaction, id, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        ShortAvailable = void 0;
                        Transaction = void 0;
                        id = req.query.id;
                        return [4 /*yield*/, models_ShortAvailable_1.ShortAvailableModel.findOneAndUpdate({ transactionId: id }, { isDeleted: false }, { "new": true, runValidators: true })];
                    case 1:
                        ShortAvailable = _a.sent();
                        if (!ShortAvailable) {
                            return [2 /*return*/, res.status(404).json({
                                    requestId: uuid_1.v4(),
                                    data: null,
                                    message: "Data ShortAvailable not found.",
                                    success: false
                                })];
                        }
                        return [4 /*yield*/, models_ShortAvailable_1.ShortAvailableModel.updateMany({ transactionId: id }, { isDeleted: true })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, models_transaksi_1.TransactionModel.findOneAndUpdate({ bookingId: id }, { isDeleted: false }, { "new": true, runValidators: true })];
                    case 3:
                        Transaction = _a.sent();
                        if (!Transaction) {
                            return [2 /*return*/, res.status(404).json({
                                    requestId: uuid_1.v4(),
                                    data: null,
                                    message: "Transaction not found.",
                                    success: false
                                })];
                        }
                        return [4 /*yield*/, models_transaksi_1.TransactionModel.updateMany({ bookingId: id }, { isDeleted: true })];
                    case 4:
                        _a.sent();
                        res.status(201).json({
                            requestId: uuid_1.v4(),
                            data: [],
                            message: "Successfully Deleted ID : " + id + "  ",
                            success: true
                        });
                        return [3 /*break*/, 6];
                    case 5:
                        error_12 = _a.sent();
                        res.status(400).json({
                            requestId: uuid_1.v4(),
                            data: null,
                            message: error_12.message,
                            success: false
                        });
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    SetMinderController.UpdateTransactionDate = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, id_TRX, Edit_Date, SetcheckIn, SetcheckOut, checkIn, checkOut, _b, ShortAvailable, Transaction, error_13;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = req.body, id_TRX = _a.id_TRX, Edit_Date = _a.Edit_Date;
                        SetcheckIn = Edit_Date[0];
                        SetcheckOut = Edit_Date[Edit_Date.length - 1];
                        checkIn = new Date(SetcheckIn + "T08:00:00.000Z").toISOString();
                        checkOut = new Date(SetcheckOut + "T05:00:00.000Z").toISOString();
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, Promise.all([
                                models_ShortAvailable_1.ShortAvailableModel.findOneAndUpdate({ transactionId: id_TRX, isDeleted: false }, { checkIn: checkIn, checkOut: checkOut }, { "new": true, runValidators: true }),
                                models_transaksi_1.TransactionModel.findOneAndUpdate({ bookingId: id_TRX, isDeleted: false }, { checkIn: checkIn, checkOut: checkOut }, { "new": true, runValidators: true })
                            ])];
                    case 2:
                        _b = _c.sent(), ShortAvailable = _b[0], Transaction = _b[1];
                        // Cek apakah data ditemukan
                        if (!ShortAvailable || !Transaction) {
                            return [2 /*return*/, res.status(404).json({
                                    requestId: uuid_1.v4(),
                                    data: null,
                                    message: !ShortAvailable ? "Data ShortAvailable tidak ditemukan." : "Transaction tidak ditemukan.",
                                    success: false
                                })];
                        }
                        res.status(201).json({
                            requestId: uuid_1.v4(),
                            data: [],
                            // message: `Data yang akan diset ${checkIn}, dan ${checkOut}`,
                            message: "Data " + id_TRX + ", has update",
                            success: true
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_13 = _c.sent();
                        res.status(400).json({
                            requestId: uuid_1.v4(),
                            data: null,
                            message: error_13.message,
                            success: false
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SetMinderController.UpdateStockRooms = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, roomId, available, _id, UpdateRoomsStock, error_14;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.body, roomId = _a.roomId, available = _a.available;
                        if (!mongoose_1["default"].Types.ObjectId.isValid(roomId)) {
                            return [2 /*return*/, res.status(400).json({
                                    requestId: uuid_1.v4(),
                                    data: null,
                                    message: "Invalid roomId",
                                    success: false
                                })];
                        }
                        _id = new mongoose_1["default"].Types.ObjectId(roomId);
                        return [4 /*yield*/, models_room_1["default"].findOneAndUpdate({ _id: _id, isDeleted: false }, { available: available }, { "new": true } // Mengembalikan data terbaru
                            )];
                    case 1:
                        UpdateRoomsStock = _b.sent();
                        if (!UpdateRoomsStock) {
                            return [2 /*return*/, res.status(404).json({
                                    requestId: uuid_1.v4(),
                                    data: null,
                                    message: "Room not found",
                                    success: false
                                })];
                        }
                        res.status(200).json({
                            requestId: uuid_1.v4(),
                            data: UpdateRoomsStock,
                            message: "Stock " + UpdateRoomsStock.name + " has been updated",
                            success: true
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_14 = _b.sent();
                        res.status(500).json({
                            requestId: uuid_1.v4(),
                            data: null,
                            message: error_14.message,
                            success: false
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return SetMinderController;
}());
exports.SetMinderController = SetMinderController;
