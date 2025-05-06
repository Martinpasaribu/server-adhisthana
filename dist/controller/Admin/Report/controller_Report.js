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
    static GetTodayReport(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const startOfDay = new Date();
                startOfDay.setHours(0, 0, 0, 0); // mulai dari jam 00:00:00
                const endOfDay = new Date();
                endOfDay.setHours(23, 59, 59, 999); // sampai jam 23:59:59
                const todayReport = yield models_report_1.default.findOne({
                    createdAt: {
                        $gte: startOfDay,
                        $lte: endOfDay
                    },
                    isDeleted: false
                });
                if (!todayReport) {
                    return res.status(200).json({
                        requestId: (0, uuid_1.v4)(),
                        data: todayReport,
                        message: 'No report found for today',
                        success: true
                    });
                }
                // Kirim hasil response
                return res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: todayReport,
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
                if (!date || isNaN(new Date(date).getTime())) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "Invalid Date",
                        success: false
                    });
                }
                const startOfDay = new Date(date);
                startOfDay.setHours(0, 0, 0, 0); // mulai dari jam 00:00:00
                const endOfDay = new Date(date);
                endOfDay.setHours(23, 59, 59, 999); // sampai jam 23:59:59
                const todayReport = yield models_report_1.default.findOne({
                    createdAt: {
                        $gte: startOfDay,
                        $lte: endOfDay
                    },
                    isDeleted: false
                });
                if (!todayReport) {
                    return res.status(200).json({
                        requestId: (0, uuid_1.v4)(),
                        data: [],
                        message: `No report found for ${startOfDay}`,
                        success: true
                    });
                }
                // Kirim hasil response
                return res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: todayReport,
                    message: `Data Report : ${startOfDay}`,
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
    // static async GetReportBooking (req: Request, res: Response){
    //     try {
    //         const ReportBooking = await BookingModel.find({isDeleted:false}).populate('roomStatusKey');
    //         // Kirim hasil response
    //         return res.status(200).json({
    //           requestId: uuidv4(),
    //           data: ReportBooking,
    //           success: true
    //         });
    //     } catch (error) {
    //         console.error('Error fetching report booking:', error);
    //         return res.status(500).json({
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
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 25;
                const skip = (page - 1) * limit;
                const total = yield models_booking_1.BookingModel.countDocuments({ isDeleted: false });
                const bookings = yield models_booking_1.BookingModel.find({ isDeleted: false })
                    .populate('roomStatusKey')
                    .skip(skip)
                    .limit(limit);
                return res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: bookings,
                    page,
                    limit,
                    total,
                    success: true
                });
            }
            catch (error) {
                return res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message || "Internal Server Error",
                    success: false
                });
            }
        });
    }
    // static async GetReportBookingByDate(req: Request, res: Response) {
    //   try {
    //     const { code, start, end } = req.params;
    //     if( !code || !start || !end){
    //       return res.status(400).json({
    //         requestId: uuidv4(),
    //         data: null,
    //         message: "Date and Type date can't empty",
    //         success: false,
    //       });
    //     }
    //     // Validasi parameter tanggal
    //     if (!start || !end || isNaN(new Date(start).getTime()) || isNaN(new Date(end).getTime())) {
    //       return res.status(400).json({
    //         requestId: uuidv4(),
    //         data: null,
    //         message: "Invalid Date",
    //         success: false,
    //       });
    //     }
    //     // Atur rentang waktu hari tersebut (dari jam 00:00 sampai 23:59)
    //     const startOfDay = new Date(start);
    //     startOfDay.setHours(0, 0, 0, 0);
    //     const endOfDay = new Date(end);
    //     endOfDay.setHours(23, 59, 59, 999);
    //     let todayReport: string | any[] 
    //     if (code === "BO") {
    //       // Filter berdasarkan createdAt untuk CI
    //       todayReport = await BookingModel.find({
    //         createdAt: {
    //           $gte: startOfDay,
    //           $lte: endOfDay,
    //         },
    //         isDeleted: false,
    //       });
    //     } else if (code === "CI") {
    //       // Filter berdasarkan checkIn untuk BO
    //       // Pastikan field checkIn dalam format ISO date
    //       todayReport = await BookingModel.find({
    //         checkIn: {
    //           $gte: startOfDay.toISOString(),
    //           $lte: endOfDay.toISOString(),
    //         },
    //         isDeleted: false,
    //       });
    //     } else if (code === "PY") {
    //       // Logika khusus untuk kode PY bisa ditambahkan di sini
    //       todayReport = []; // Misalnya sementara kosong
    //     } else {
    //       return res.status(400).json({
    //         requestId: uuidv4(),
    //         data: null,
    //         message: "Invalid code type",
    //         success: false,
    //       });
    //     }
    //     if (!todayReport || todayReport.length === 0) {
    //       return res.status(200).json({
    //         requestId: uuidv4(),
    //         data: [],
    //         message: `No report found from ${startOfDay.toISOString()} - ${startOfDay.toISOString()}}`,
    //         success: true,
    //       });
    //     }
    //     return res.status(200).json({
    //       requestId: uuidv4(),
    //       data: todayReport,
    //       dataLength: todayReport.length,
    //       message: `Data Report: ${startOfDay.toISOString()} - ${endOfDay.toISOString()}`,
    //       success: true,
    //     });
    //   } catch (error) {
    //     console.error("Error fetching report:", error);
    //     return res.status(500).json({
    //       requestId: uuidv4(),
    //       data: null,
    //       message: (error as Error).message || "Internal Server Error",
    //       success: false,
    //     });
    //   }
    // }
    static GetReportBookingByDate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { code, start, end } = req.params;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 25;
                const skip = (page - 1) * limit;
                if (!code || !start || !end) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "Date and Type date can't be empty",
                        success: false,
                    });
                }
                // Validasi tanggal
                const startOfDay = new Date(start);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(end);
                endOfDay.setHours(23, 59, 59, 999);
                if (isNaN(startOfDay.getTime()) || isNaN(endOfDay.getTime())) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "Invalid date format",
                        success: false,
                    });
                }
                let filter = { isDeleted: false };
                let dateField = "";
                // Tentukan filter berdasarkan kode
                switch (code) {
                    case "BO":
                        dateField = "createdAt";
                        break;
                    case "CI":
                        dateField = "checkIn";
                        break;
                    case "PY":
                        // Jika belum ada implementasi khusus
                        return res.status(200).json({
                            requestId: (0, uuid_1.v4)(),
                            data: [],
                            dataLength: 0,
                            total: 0,
                            message: "No data for code PY yet",
                            success: true,
                        });
                    default:
                        return res.status(400).json({
                            requestId: (0, uuid_1.v4)(),
                            data: null,
                            message: "Invalid code type",
                            success: false,
                        });
                }
                // Tambahkan filter tanggal
                if (dateField) {
                    filter[dateField] = {
                        $gte: dateField === "checkIn" ? startOfDay.toISOString() : startOfDay,
                        $lte: dateField === "checkIn" ? endOfDay.toISOString() : endOfDay,
                    };
                }
                // Ambil data dan total
                const todayReport = yield models_booking_1.BookingModel.find(filter)
                    .populate("roomStatusKey")
                    .skip(skip)
                    .limit(limit);
                const total = yield models_booking_1.BookingModel.countDocuments(filter);
                return res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: todayReport,
                    dataLength: todayReport.length,
                    total,
                    page,
                    limit,
                    message: `Data Report: ${startOfDay.toISOString()} - ${endOfDay.toISOString()}`,
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
