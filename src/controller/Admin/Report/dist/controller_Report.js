"use strict";
// controllers/reportController.ts
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
exports.ReportController = void 0;
var models_report_1 = require("../../../models/Report/models_report");
var uuid_1 = require("uuid");
var models_booking_1 = require("../../../models/Booking/models_booking");
var ReportController = /** @class */ (function () {
    function ReportController() {
    }
    ReportController.SaveReport = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var date, requestDate, today, _a, villa, incharge, mu_checkout, mu_extend, request, complain, lf, creatorId, startOfDay, endOfDay, existingReport, newReport, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        date = req.params.date;
                        requestDate = new Date(date);
                        today = new Date();
                        if (requestDate.getDate() !== today.getDate() ||
                            requestDate.getMonth() !== today.getMonth() ||
                            requestDate.getFullYear() !== today.getFullYear()) {
                            return [2 /*return*/, res.status(400).json({
                                    requestId: uuid_1.v4(),
                                    success: false,
                                    message: "Cannot change data other than today!",
                                    data: null
                                })];
                        }
                        _a = req.body, villa = _a.villa, incharge = _a.incharge, mu_checkout = _a.mu_checkout, mu_extend = _a.mu_extend, request = _a.request, complain = _a.complain, lf = _a.lf, creatorId = _a.creatorId;
                        startOfDay = new Date();
                        startOfDay.setHours(0, 0, 0, 0); // jam 00:00:00
                        endOfDay = new Date();
                        endOfDay.setHours(23, 59, 59, 999); // jam 23:59:59
                        return [4 /*yield*/, models_report_1["default"].findOne({
                                creatorId: creatorId,
                                createdAt: {
                                    $gte: startOfDay,
                                    $lte: endOfDay
                                },
                                isDeleted: false
                            })];
                    case 1:
                        existingReport = _b.sent();
                        if (!existingReport) return [3 /*break*/, 3];
                        // Update data jika sudah ada
                        existingReport.villa = villa;
                        existingReport.incharge = incharge;
                        existingReport.mu_checkout = mu_checkout;
                        existingReport.mu_extend = mu_extend;
                        existingReport.request = request;
                        existingReport.complain = complain;
                        existingReport.lf = lf;
                        return [4 /*yield*/, existingReport.save()];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, res.status(200).json({ message: 'Report updated', data: existingReport })];
                    case 3: return [4 /*yield*/, models_report_1["default"].create({
                            villa: villa,
                            incharge: incharge,
                            mu_checkout: mu_checkout,
                            mu_extend: mu_extend,
                            request: request,
                            complain: complain,
                            lf: lf,
                            creatorId: creatorId,
                            createAt: Date.now()
                        })];
                    case 4:
                        newReport = _b.sent();
                        return [2 /*return*/, res.status(201).json({ message: 'Report created', data: newReport })];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        err_1 = _b.sent();
                        console.error(err_1);
                        return [2 /*return*/, res.status(500).json({ message: 'Server error', error: err_1 })];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    ;
    ReportController.GetTodayReport = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var startOfDay, endOfDay, todayReport, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        startOfDay = new Date();
                        startOfDay.setHours(0, 0, 0, 0); // mulai dari jam 00:00:00
                        endOfDay = new Date();
                        endOfDay.setHours(23, 59, 59, 999); // sampai jam 23:59:59
                        return [4 /*yield*/, models_report_1["default"].findOne({
                                createdAt: {
                                    $gte: startOfDay,
                                    $lte: endOfDay
                                },
                                isDeleted: false
                            })];
                    case 1:
                        todayReport = _a.sent();
                        if (!todayReport) {
                            return [2 /*return*/, res.status(200).json({
                                    requestId: uuid_1.v4(),
                                    data: todayReport,
                                    message: 'No report found for today',
                                    success: true
                                })];
                        }
                        // Kirim hasil response
                        return [2 /*return*/, res.status(200).json({
                                requestId: uuid_1.v4(),
                                data: todayReport,
                                success: true
                            })];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error fetching today report:', error_1);
                        return [2 /*return*/, res.status(500).json({
                                requestId: uuid_1.v4(),
                                data: null,
                                message: error_1.message || "Internal Server Error",
                                success: false
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ;
    ReportController.GetReportByDate = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var date, startOfDay, endOfDay, todayReport, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        date = req.params.date;
                        if (!date || isNaN(new Date(date).getTime())) {
                            return [2 /*return*/, res.status(400).json({
                                    requestId: uuid_1.v4(),
                                    data: null,
                                    message: "Invalid Date",
                                    success: false
                                })];
                        }
                        startOfDay = new Date(date);
                        startOfDay.setHours(0, 0, 0, 0); // mulai dari jam 00:00:00
                        endOfDay = new Date(date);
                        endOfDay.setHours(23, 59, 59, 999); // sampai jam 23:59:59
                        return [4 /*yield*/, models_report_1["default"].findOne({
                                createdAt: {
                                    $gte: startOfDay,
                                    $lte: endOfDay
                                },
                                isDeleted: false
                            })];
                    case 1:
                        todayReport = _a.sent();
                        if (!todayReport) {
                            return [2 /*return*/, res.status(200).json({
                                    requestId: uuid_1.v4(),
                                    data: [],
                                    message: "No report found for " + startOfDay,
                                    success: true
                                })];
                        }
                        // Kirim hasil response
                        return [2 /*return*/, res.status(200).json({
                                requestId: uuid_1.v4(),
                                data: todayReport,
                                message: "Data Report : " + startOfDay,
                                success: true
                            })];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Error fetching today report:', error_2);
                        return [2 /*return*/, res.status(400).json({
                                requestId: uuid_1.v4(),
                                data: null,
                                message: error_2.message || "Internal Server Error",
                                success: false
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ;
    ReportController.GetReportBooking = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var ReportBooking, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, models_booking_1.BookingModel.find({ isDeleted: false }).populate('roomStatusKey')];
                    case 1:
                        ReportBooking = _a.sent();
                        // Kirim hasil response
                        return [2 /*return*/, res.status(200).json({
                                requestId: uuid_1.v4(),
                                data: ReportBooking,
                                success: true
                            })];
                    case 2:
                        error_3 = _a.sent();
                        console.error('Error fetching report booking:', error_3);
                        return [2 /*return*/, res.status(500).json({
                                requestId: uuid_1.v4(),
                                data: null,
                                message: error_3.message || "Internal Server Error",
                                success: false
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ;
    // Pagination
    // static async GetReportBooking(req: Request, res: Response) {
    //   try {
    //     const page = parseInt(req.query.page as string) || 1;
    //     const limit = parseInt(req.query.limit as string) || 25;
    //     const skip = (page - 1) * limit;
    //     const total = await BookingModel.countDocuments({ isDeleted: false });
    //     const bookings = await BookingModel.find({ isDeleted: false })
    //       .populate('roomStatusKey')
    //       .skip(skip)
    //       .limit(limit);
    //     return res.status(200).json({
    //       requestId: uuidv4(),
    //       data: bookings,
    //       page,
    //       limit,
    //       total,
    //       success: true
    //     });
    //   } catch (error) {
    //     return res.status(500).json({
    //       requestId: uuidv4(),
    //       data: null,
    //       message: (error as Error).message || "Internal Server Error",
    //       success: false
    //     });
    //   }
    // }
    ReportController.GetReportBookingByDate = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, code, start, end, startOfDay, endOfDay, todayReport, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        _a = req.params, code = _a.code, start = _a.start, end = _a.end;
                        if (!code || !start || !end) {
                            return [2 /*return*/, res.status(400).json({
                                    requestId: uuid_1.v4(),
                                    data: null,
                                    message: "Date and Type date can't empty",
                                    success: false
                                })];
                        }
                        // Validasi parameter tanggal
                        if (!start || !end || isNaN(new Date(start).getTime()) || isNaN(new Date(end).getTime())) {
                            return [2 /*return*/, res.status(400).json({
                                    requestId: uuid_1.v4(),
                                    data: null,
                                    message: "Invalid Date",
                                    success: false
                                })];
                        }
                        startOfDay = new Date(start);
                        startOfDay.setHours(0, 0, 0, 0);
                        endOfDay = new Date(end);
                        endOfDay.setHours(23, 59, 59, 999);
                        todayReport = void 0;
                        if (!(code === "BO")) return [3 /*break*/, 2];
                        return [4 /*yield*/, models_booking_1.BookingModel.find({
                                createdAt: {
                                    $gte: startOfDay,
                                    $lte: endOfDay
                                },
                                isDeleted: false
                            })];
                    case 1:
                        // Filter berdasarkan createdAt untuk CI
                        todayReport = _b.sent();
                        return [3 /*break*/, 5];
                    case 2:
                        if (!(code === "CI")) return [3 /*break*/, 4];
                        return [4 /*yield*/, models_booking_1.BookingModel.find({
                                checkIn: {
                                    $gte: startOfDay.toISOString(),
                                    $lte: endOfDay.toISOString()
                                },
                                isDeleted: false
                            })];
                    case 3:
                        // Filter berdasarkan checkIn untuk BO
                        // Pastikan field checkIn dalam format ISO date
                        todayReport = _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        if (code === "PY") {
                            // Logika khusus untuk kode PY bisa ditambahkan di sini
                            todayReport = []; // Misalnya sementara kosong
                        }
                        else {
                            return [2 /*return*/, res.status(400).json({
                                    requestId: uuid_1.v4(),
                                    data: null,
                                    message: "Invalid code type",
                                    success: false
                                })];
                        }
                        _b.label = 5;
                    case 5:
                        if (!todayReport || todayReport.length === 0) {
                            return [2 /*return*/, res.status(200).json({
                                    requestId: uuid_1.v4(),
                                    data: [],
                                    message: "No report found from " + startOfDay.toISOString() + " - " + startOfDay.toISOString() + "}",
                                    success: true
                                })];
                        }
                        return [2 /*return*/, res.status(200).json({
                                requestId: uuid_1.v4(),
                                data: todayReport,
                                dataLength: todayReport.length,
                                message: "Data Report: " + startOfDay.toISOString() + " - " + endOfDay.toISOString(),
                                success: true
                            })];
                    case 6:
                        error_4 = _b.sent();
                        console.error("Error fetching report:", error_4);
                        return [2 /*return*/, res.status(500).json({
                                requestId: uuid_1.v4(),
                                data: null,
                                message: error_4.message || "Internal Server Error",
                                success: false
                            })];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return ReportController;
}());
exports.ReportController = ReportController;
