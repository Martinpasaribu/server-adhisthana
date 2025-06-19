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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const models_report_1 = __importDefault(require("../../../models/Report/models_report"));
const uuid_1 = require("uuid");
const models_booking_1 = require("../../../models/Booking/models_booking");
const dayjs_1 = __importDefault(require("dayjs"));
const utc_js_1 = __importDefault(require("dayjs/plugin/utc.js"));
const timezone_js_1 = __importDefault(require("dayjs/plugin/timezone.js"));
const models_RoomStatus_1 = require("../../../models/RoomStatus/models_RoomStatus");
const luxon_1 = require("luxon");
const models_option_1 = __importDefault(require("../../../models/Option/models_option"));
class ReportController {
    static SaveReport(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { date } = req.params;
                const requestDate = new Date(date);
                const today = new Date();
                if (requestDate.getDate() !== today.getDate() ||
                    requestDate.getMonth() !== today.getMonth() ||
                    requestDate.getFullYear() !== today.getFullYear()) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        success: false,
                        message: "Cannot change data other than today!",
                        data: null,
                    });
                }
                const { villa, incharge, mu_checkout, mu_extend, request, complain, lf, creatorId } = req.body;
                const startOfDay = new Date();
                startOfDay.setHours(0, 0, 0, 0); // jam 00:00:00
                const endOfDay = new Date();
                endOfDay.setHours(23, 59, 59, 999); // jam 23:59:59
                // Cari apakah report hari ini sudah ada
                const existingReport = yield models_report_1.default.findOne({
                    creatorId,
                    createdAt: {
                        $gte: startOfDay,
                        $lte: endOfDay
                    },
                    isDeleted: false
                });
                if (existingReport) {
                    // Update data jika sudah ada
                    existingReport.villa = villa;
                    existingReport.incharge = incharge;
                    existingReport.mu_checkout = mu_checkout;
                    existingReport.mu_extend = mu_extend;
                    existingReport.request = request;
                    existingReport.complain = complain;
                    existingReport.lf = lf;
                    yield existingReport.save();
                    return res.status(200).json({ message: 'Report updated', data: existingReport });
                }
                else {
                    // Buat baru jika belum ada
                    const newReport = yield models_report_1.default.create({
                        villa,
                        incharge,
                        mu_checkout,
                        mu_extend,
                        request,
                        complain,
                        lf,
                        creatorId,
                        createAt: Date.now(),
                    });
                    return res.status(201).json({ message: 'Report created', data: newReport });
                }
            }
            catch (err) {
                console.error(err);
                return res.status(500).json({ message: 'Server error', error: err });
            }
        });
    }
    ;
    static GetRoomStatusToday(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                dayjs_1.default.extend(utc_js_1.default);
                dayjs_1.default.extend(timezone_js_1.default);
                // Set zona waktu lokal yang kamu inginkan (contoh: Asia/Jakarta)
                const zone = 'Asia/Jakarta';
                // Buat start dan end of day berdasarkan timezone
                const startOfDay = (0, dayjs_1.default)().tz(zone).startOf('day').toDate();
                const endOfDay = (0, dayjs_1.default)().tz(zone).endOf('day').toDate();
                const startOfDayNonR = (0, dayjs_1.default)().tz(zone).subtract(1, 'day').startOf('day').toDate();
                const endOfDayNonR = (0, dayjs_1.default)().tz(zone).subtract(1, 'day').endOf('day').toDate();
                // Debug: tampilkan hasil dalam zona waktu lokal
                console.log("Report room status from", startOfDay.toLocaleString('id-ID', { timeZone: zone }), "until", endOfDay.toLocaleString('id-ID', { timeZone: zone }));
                // const startOfDay = new Date();
                // startOfDay.setHours(0, 0, 0, 0); // mulai dari jam 00:00:00
                // const endOfDay = new Date();
                // endOfDay.setHours(23, 59, 59, 999); // sampai jam 23:59:59
                const CheckInToday = yield models_RoomStatus_1.RoomStatusModel.find({
                    status: true,
                    isDeleted: false,
                    checkIn: { $lte: endOfDay.toISOString() }, // <=
                    checkOut: { $gt: endOfDay.toISOString() }, // >
                });
                const CheckOutToday = yield models_RoomStatus_1.RoomStatusModel.find({
                    status: true,
                    isDeleted: false,
                    checkOut: {
                        $gte: startOfDay.toISOString(), // mulai dari jam 00:00
                        $lte: endOfDay.toISOString(), // sampai jam 23:59:59
                    },
                });
                const RoomTypeInToday = {
                    CheckIn: CheckInToday,
                    CheckOut: CheckOutToday
                };
                console.log(` Room status used today :, ${CheckInToday.length}, in date from : ${startOfDay}  to ${endOfDay} `);
                console.log(` Room status out today :, ${CheckOutToday.length}, in date from : ${startOfDay}  to ${endOfDay} `);
                const todayReport = yield models_report_1.default.findOne({
                    createdAt: {
                        $gte: startOfDay,
                        $lte: endOfDay
                    },
                    isDeleted: false
                });
                if (!todayReport) {
                    const todayReportNonR = yield models_report_1.default.findOne({
                        createdAt: {
                            $gte: startOfDayNonR,
                            $lte: endOfDayNonR,
                        },
                        isDeleted: false,
                    });
                    if (!todayReportNonR || !Array.isArray(todayReportNonR.villa)) {
                        return [];
                    }
                    const night = todayReportNonR.villa.map((villa) => villa.status3);
                    console.log(" Report Night :", night);
                    const villa = [];
                    return res.status(200).json({
                        requestId: (0, uuid_1.v4)(),
                        data: todayReport,
                        data_room_status: RoomTypeInToday,
                        data_night: night,
                        message: 'No report found for today, room status today',
                        message2: `report room status from ${startOfDay} until ${endOfDay}`,
                        success: true
                    });
                }
                ;
                // Kirim hasil response
                return res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: todayReport,
                    data_room_status: RoomTypeInToday,
                    message: `report room status from ${startOfDay} until ${endOfDay}`,
                    success: true
                });
            }
            catch (error) {
                console.error('Error fetching today report:', error);
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
    static GetReportByDate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { date } = req.params;
                const dateWIB = luxon_1.DateTime.fromJSDate(new Date(date), { zone: 'Asia/Jakarta' });
                const previousDateWIB = dateWIB.minus({ days: 1 });
                const startOfDayNonR = previousDateWIB.startOf('day').toJSDate();
                const endOfDayNonR = previousDateWIB.endOf('day').toJSDate();
                if (!dateWIB.isValid) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "Invalid date format",
                        success: false
                    });
                }
                const startOfDay = dateWIB.startOf('day').toJSDate();
                const endOfDay = dateWIB.endOf('day').toJSDate();
                const CheckInToday = yield models_RoomStatus_1.RoomStatusModel.find({
                    status: true,
                    isDeleted: false,
                    checkIn: { $lte: endOfDay.toISOString() }, // <=
                    checkOut: { $gt: endOfDay.toISOString() }, // >
                });
                const CheckOutToday = yield models_RoomStatus_1.RoomStatusModel.find({
                    status: true,
                    isDeleted: false,
                    checkOut: {
                        $gte: startOfDay.toISOString(), // mulai dari jam 00:00
                        $lte: endOfDay.toISOString(), // sampai jam 23:59:59
                    },
                });
                const RoomTypeInToday = {
                    CheckIn: CheckInToday,
                    CheckOut: CheckOutToday
                };
                const todayReport = yield models_report_1.default.findOne({
                    createdAt: {
                        $gte: startOfDay,
                        $lte: endOfDay,
                    },
                    isDeleted: false,
                });
                if (!todayReport) {
                    const todayReportNonR = yield models_report_1.default.findOne({
                        createdAt: {
                            $gte: startOfDayNonR,
                            $lte: endOfDayNonR,
                        },
                        isDeleted: false,
                    });
                    if (!todayReportNonR || !Array.isArray(todayReportNonR.villa)) {
                        return [];
                    }
                    const night = todayReportNonR.villa.map((villa) => villa.status3);
                    console.log(" Report Night :", night);
                    return res.status(200).json({
                        requestId: (0, uuid_1.v4)(),
                        data: [],
                        message: `No report found Next Prev for ${startOfDay}`,
                        data_room_status: RoomTypeInToday,
                        data_night: night,
                        date_req: date,
                        success: true
                    });
                }
                // Kirim hasil response
                return res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: todayReport,
                    message: `Data Report : ${startOfDay}`,
                    data_room_status: RoomTypeInToday,
                    date_req: date,
                    success: true
                });
            }
            catch (error) {
                console.error('Error fetching today report:', error);
                return res.status(400).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message || "Internal Server Error",
                    success: false
                });
            }
        });
    }
    ;
    static GetReportByPrevNext(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { date } = req.params;
                if (!date || isNaN(new Date(date).getTime())) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "Invalid Date",
                        success: false
                    });
                }
                // const dateWIB = DateTime.fromJSDate(new Date(date), { zone: 'Asia/Jakarta' });
                const dateWIB = luxon_1.DateTime.fromISO(date, { zone: 'Asia/Jakarta' });
                const startOfDay = dateWIB.startOf('day').toJSDate();
                const endOfDay = dateWIB.endOf('day').toJSDate();
                // Mundurkan 1 hari
                const previousDateWIB = dateWIB.minus({ days: 1 });
                const startOfDayNonR = previousDateWIB.startOf('day').toJSDate();
                const endOfDayNonR = previousDateWIB.endOf('day').toJSDate();
                const CheckInToday = yield models_RoomStatus_1.RoomStatusModel.find({
                    status: true,
                    isDeleted: false,
                    checkIn: { $lte: endOfDay.toISOString() }, // <=
                    checkOut: { $gt: endOfDay.toISOString() }, // >
                });
                const CheckOutToday = yield models_RoomStatus_1.RoomStatusModel.find({
                    status: true,
                    isDeleted: false,
                    checkOut: {
                        $gte: startOfDay.toISOString(), // mulai dari jam 00:00
                        $lte: endOfDay.toISOString(), // sampai jam 23:59:59
                    },
                });
                const RoomTypeInToday = {
                    CheckIn: CheckInToday,
                    CheckOut: CheckOutToday
                };
                const todayReport = yield models_report_1.default.findOne({
                    createdAt: {
                        $gte: startOfDay,
                        $lte: endOfDay,
                    },
                    isDeleted: false,
                });
                if (!todayReport) {
                    const todayReportNonR = yield models_report_1.default.findOne({
                        createdAt: {
                            $gte: startOfDayNonR,
                            $lte: endOfDayNonR,
                        },
                        isDeleted: false,
                    });
                    if (!todayReportNonR || !Array.isArray(todayReportNonR.villa)) {
                        return [];
                    }
                    const night = todayReportNonR.villa.map((villa) => villa.status3);
                    console.log(" Report Night :", night);
                    return res.status(200).json({
                        requestId: (0, uuid_1.v4)(),
                        data: [],
                        message: `No report found Next Prev for ${startOfDay}`,
                        data_room_status: RoomTypeInToday,
                        data_night: night,
                        date_req: date,
                        success: true
                    });
                }
                // Kirim hasil response
                return res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: todayReport,
                    message: `Data Report : ${startOfDay}`,
                    data_room_status: RoomTypeInToday,
                    date_req: date,
                    success: true
                });
            }
            catch (error) {
                console.error('Error fetching today report:', error);
                return res.status(400).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message || "Internal Server Error",
                    success: false
                });
            }
        });
    }
    ;
    //     static async GetReportByPrevNext (req: Request, res: Response){
    //     try {
    //       const { date } = req.params;
    //         // Kirim hasil response
    //         return res.status(200).json({
    //           requestId: uuidv4(),
    //           data: date,
    //           date_req: date,
    //           success: true
    //         });
    //     } catch (error) {
    //         console.error('Error fetching today report:', error);
    //         return res.status(400).json({
    //             requestId: uuidv4(),
    //             data: null,
    //             message: (error as Error).message || "Internal Server Error",
    //             success: false
    //         });
    //     }
    // };
    static GetReportBooking(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ReportBooking = yield models_booking_1.BookingModel.find({ isDeleted: false }).populate('roomStatusKey');
                // Kirim hasil response
                return res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: ReportBooking,
                    success: true
                });
            }
            catch (error) {
                console.error('Error fetching report booking:', error);
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
    static GetReportBookingByDate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { code, start, end, code2 } = req.params;
                console.log("Data GetReportBookingByDate : ", code, start, end, code2);
                // Validasi parameter tanggal
                if (!start || !end || isNaN(Date.parse(start)) || isNaN(Date.parse(end))) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "Invalid date format. Please use ISO format (e.g., 2024-12-25T00:00:00+07:00)",
                        success: false,
                    });
                }
                // Gunakan zona waktu Asia/Jakarta (WIB)
                const startLuxon = luxon_1.DateTime.fromISO(start, { zone: "Asia/Jakarta" }).startOf("day");
                const endLuxon = luxon_1.DateTime.fromISO(end, { zone: "Asia/Jakarta" }).endOf("day");
                const startOfDay = startLuxon.toISO(); // string ISO dgn offset WIB
                const endOfDay = endLuxon.toISO();
                console.log("start:", start);
                console.log("end:", end);
                console.log("startOfDay:", startOfDay); // 2025-05-01T00:00:00.000+07:00
                console.log("endOfDay:", endOfDay); // 2025-05-05T23:59:59.999+07:00
                const dataDate = {
                    startOfDay, endOfDay
                };
                let todayReport;
                if (code === "BO") {
                    todayReport = yield models_booking_1.BookingModel.find({
                        createdAt: {
                            $gte: startOfDay,
                            $lte: endOfDay,
                        },
                        isDeleted: false,
                    }).populate("roomStatusKey");
                }
                else if (code === "BC") {
                    todayReport = yield models_booking_1.BookingModel.find({
                        checkOut: {
                            $gte: startOfDay, // CO >= 1 Juni
                            $lte: endOfDay, // CO <= 5 Juni
                        },
                        checkIn: {
                            $lte: endOfDay, // CI <= 5 Juni
                        },
                        isDeleted: false,
                    }).populate("roomStatusKey");
                }
                else if (code2 === "SP" && code === "CI") {
                    yield models_option_1.default.updateOne({ isDeleted: false }, {
                        $set: {
                            price_total: {
                                startOfDay: startOfDay,
                                endOfDay: endOfDay,
                                status: true,
                            },
                        },
                    }, { upsert: true });
                    console.log(' Save Price Date In update !');
                    todayReport = yield models_booking_1.BookingModel.find({
                        checkIn: {
                            $gte: startOfDay,
                            $lte: endOfDay,
                        },
                        isDeleted: false,
                    }).populate("roomStatusKey");
                }
                else if (code === "CI" && code2 === "SL") {
                    todayReport = yield models_booking_1.BookingModel.find({
                        checkIn: {
                            $gte: startOfDay,
                            $lte: endOfDay,
                        },
                        isDeleted: false,
                    }).populate("roomStatusKey");
                }
                else if (code === "PY") {
                    todayReport = [];
                }
                else {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "Invalid code type",
                        success: false,
                    });
                }
                if (!todayReport || todayReport.length === 0) {
                    return res.status(200).json({
                        requestId: (0, uuid_1.v4)(),
                        data: [],
                        message: `No report found from ${startOfDay} - ${endOfDay}`,
                        success: true,
                    });
                }
                return res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: todayReport,
                    dataLength: todayReport.length,
                    date: dataDate,
                    message: `Data Report: ${startOfDay} - ${endOfDay}`,
                    success: true,
                });
            }
            catch (error) {
                console.error("Error fetching report:", error);
                return res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message || "Internal Server Error",
                    success: false,
                });
            }
        });
    }
    // Saved Price 
    static UpdatePriceTotalByDate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const SavedOption = yield models_option_1.default.findOne({ isDeleted: false });
                if (!SavedOption || !SavedOption.price_total) {
                    return res.status(404).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "No price_total data available.",
                        success: false,
                    });
                }
                const { startOfDay, endOfDay } = SavedOption.price_total;
                const todayReport = yield models_booking_1.BookingModel.find({
                    checkIn: {
                        $gte: startOfDay,
                        $lte: endOfDay,
                    },
                    isDeleted: false,
                }).populate("roomStatusKey");
                return res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    dataDate: {
                        startOfDay, endOfDay
                    },
                    data: todayReport,
                    dataLength: todayReport.length,
                    message: `Data Report: ${startOfDay} - ${endOfDay}`,
                    success: true,
                });
            }
            catch (error) {
                console.error("Error fetching report:", error);
                return res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message || "Internal Server Error",
                    success: false,
                });
            }
        });
    }
}
exports.ReportController = ReportController;
