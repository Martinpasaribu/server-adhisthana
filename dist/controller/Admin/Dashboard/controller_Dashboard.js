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
exports.DashboardController = void 0;
const uuid_1 = require("uuid");
const models_room_1 = __importDefault(require("../../../models/Room/models_room"));
const models_transaksi_1 = require("../../../models/Transaction/models_transaksi");
const models_user_1 = __importDefault(require("../../../models/User/models_user"));
const models_ShortAvailable_1 = require("../../../models/ShortAvailable/models_ShortAvailable");
const models_admin_1 = __importDefault(require("../../../models/Admin/models_admin"));
const models_RoomStatus_1 = require("../../../models/RoomStatus/models_RoomStatus");
const dayjs_1 = __importDefault(require("dayjs"));
const utc_js_1 = __importDefault(require("dayjs/plugin/utc.js"));
const timezone_js_1 = __importDefault(require("dayjs/plugin/timezone.js"));
const isSameOrBefore_1 = __importDefault(require("dayjs/plugin/isSameOrBefore"));
const isSameOrAfter_1 = __importDefault(require("dayjs/plugin/isSameOrAfter"));
const models_RoomCondition_1 = require("../../../models/RoomCondition/models_RoomCondition");
const models_booking_1 = require("../../../models/Booking/models_booking");
const constant_1 = require("../../../constant");
dayjs_1.default.extend(isSameOrBefore_1.default);
dayjs_1.default.extend(isSameOrAfter_1.default);
class DashboardController {
    static ChartTransaction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Ambil semua transaksi dari database
                const transactions = yield models_transaksi_1.TransactionModel.find({ isDeleted: false });
                if (transactions.length === 0) {
                    return res.status(200).json({
                        requestId: (0, uuid_1.v4)(),
                        data: {},
                        success: true,
                    });
                }
                // Objek untuk menyimpan hasil per tahun
                const yearlyData = {};
                // Iterasi transaksi untuk mengelompokkan berdasarkan tahun & bulan
                transactions.forEach((transaction) => {
                    if (transaction.createdAt) {
                        const transactionDate = new Date(transaction.checkIn);
                        const transactionYear = transactionDate.getFullYear();
                        const monthIndex = transactionDate.getMonth(); // 0 = Januari, 11 = Desember
                        // Jika tahun belum ada di objek, buat array 12 bulan dengan default 0
                        if (!yearlyData[transactionYear]) {
                            yearlyData[transactionYear] = new Array(12).fill(0);
                        }
                        // Tambahkan transaksi ke bulan yang sesuai (hanya menghitung jumlahnya)
                        yearlyData[transactionYear][monthIndex] += 1;
                    }
                });
                // Kirim hasil response
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: yearlyData,
                    success: true,
                });
            }
            catch (error) {
                res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    message: `Failed to fetch transaction data: ${error}`,
                    success: false,
                });
            }
        });
    }
    static ChartPriceTransaction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Ambil semua transaksi dari database
                const transactions = yield models_transaksi_1.TransactionModel.find({ isDeleted: false });
                if (transactions.length === 0) {
                    return res.status(200).json({
                        requestId: (0, uuid_1.v4)(),
                        data: {},
                        success: true,
                    });
                }
                // Objek untuk menyimpan hasil per tahun
                const yearlyData = {};
                // Iterasi transaksi untuk mengelompokkan berdasarkan tahun & bulan
                transactions.forEach((transaction) => {
                    if (transaction.createdAt) {
                        const transactionDate = new Date(transaction.createdAt);
                        const transactionYear = transactionDate.getFullYear();
                        const monthIndex = transactionDate.getMonth(); // 0 = Januari, 11 = Desember
                        // Jika tahun belum ada di objek, buat array 12 bulan dengan default 0
                        if (!yearlyData[transactionYear]) {
                            yearlyData[transactionYear] = new Array(12).fill(0);
                        }
                        // Tambahkan transaksi ke bulan yang sesuai
                        yearlyData[transactionYear][monthIndex] += transaction.grossAmount;
                    }
                });
                // Kirim hasil response
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: yearlyData,
                    success: true,
                });
            }
            catch (error) {
                res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    message: `Failed to fetch transaction data: ${error}`,
                    success: false,
                });
            }
        });
    }
    static TotalProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Query untuk TransactionModel (ambil semua data)
                const room = yield models_room_1.default.find({ isDeleted: false });
                // Kirim hasil response
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: room.length,
                    success: true
                });
            }
            catch (error) {
                res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    message: `Failed to fetch total room ${error}`,
                    success: false
                });
            }
        });
    }
    static TotalUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield models_user_1.default.find({ isDeleted: false });
                // Kirim hasil response
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: user.length,
                    success: true
                });
            }
            catch (error) {
                res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    message: `Failed to fetch total user ${error}`,
                    success: false
                });
            }
        });
    }
    static TotalUserAdmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield models_admin_1.default.find({ isDeleted: false });
                // Kirim hasil response
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: user.length,
                    success: true
                });
            }
            catch (error) {
                res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    message: `Failed to fetch total user ${error}`,
                    success: false
                });
            }
        });
    }
    static MostPurchased(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const RoomSold = yield models_ShortAvailable_1.ShortAvailableModel.find({ isDeleted: false }).select('products');
                const roomCount = {};
                RoomSold.forEach(transaction => {
                    transaction.products.forEach((product) => {
                        if (roomCount[product.name]) {
                            roomCount[product.name] += product.quantity;
                        }
                        else {
                            roomCount[product.name] = product.quantity;
                        }
                    });
                });
                // Mengubah hasil ke dalam bentuk array
                const resultArray = Object.values(roomCount);
                console.log("cek : ", resultArray);
                // Kirim hasil response
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: resultArray,
                    success: true
                });
            }
            catch (error) {
                res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    message: `Failed to fetch most purchased ${error}`,
                    success: false
                });
            }
        });
    }
    // Information Dashboard One ( Total booking(1month), Profit(1month), reservation)
    static InfoDashboardOne(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            dayjs_1.default.extend(utc_js_1.default);
            dayjs_1.default.extend(timezone_js_1.default);
            const zone = 'Asia/Jakarta';
            // Dapatkan tahun dan bulan saat ini
            const year = (0, dayjs_1.default)().year();
            const month = (0, dayjs_1.default)().month(); // 0-based (Juli = 6)
            // Buat waktu UTC dari waktu lokal Asia/Jakarta TANPA pergeseran mundur
            const startOfMonth = dayjs_1.default.utc(new Date(Date.UTC(year, month, 1, 0, 0, 0)));
            const endOfMonth = dayjs_1.default.utc(new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999)));
            // Output ke string ISO
            const startOfMonthF = startOfMonth.toISOString();
            const endOfMonthF = endOfMonth.toISOString();
            try {
                // 1. Hitung jumlah booking langsung di database
                const BookingOneMOnth = yield models_booking_1.BookingModel.countDocuments({
                    isDeleted: false,
                    checkIn: {
                        $gte: startOfMonthF,
                        $lte: endOfMonthF,
                    },
                });
                const filterQuery = {
                    status: { $in: [constant_1.PAYMENT_ADMIN, constant_1.PAID_ADMIN] },
                    reservation: true,
                    isDeleted: false
                };
                const filterQuery_booking = {
                    isDeleted: false
                };
                // 2. HITUNG JUMLAH DOKUMEN TANPA MENGAMBIL DATA
                const ReservationTotal = yield models_transaksi_1.TransactionModel.countDocuments(filterQuery);
                const Amount_Booking = yield models_booking_1.BookingModel.countDocuments(filterQuery_booking);
                // 3. HITUNG JUMLAH PROFIT Booking
                const ProfitMonth = yield models_booking_1.BookingModel.find({
                    isDeleted: false,
                    checkIn: {
                        $gte: startOfMonthF,
                        $lte: endOfMonthF,
                    },
                }).lean();
                const CountLessVilla = (data) => {
                    const AmountLess = data
                        .filter((cek) => cek.code === "VLA")
                        .reduce((total, cek) => total + (cek.less || 0), 0); // tambahkan nilai awal = 0
                    return AmountLess;
                };
                // 1. Buat array penampung
                const valueToAddList = [];
                // console.log("===== START DEBUGGING totalAmountNormal() =====");
                ProfitMonth.forEach((item, index) => {
                    const reschedule = item.reschedule;
                    const voucher = item.voucher;
                    const amountTotal = item.amountTotal || 0;
                    const otaTotal = item.otaTotal || 0;
                    const countLess = CountLessVilla(item.invoice) || 0;
                    let valueToAdd = 0;
                    // console.log(`\n--- Item ${index + 1} ---`);
                    // console.log("_id:", item._id);
                    // console.log("amountTotal:", amountTotal);
                    // console.log("otaTotal:", otaTotal);
                    // console.log("countLess:", countLess);
                    if (reschedule === null || reschedule === void 0 ? void 0 : reschedule.status) {
                        // console.log("Reschedule STATUS: ACTIVE");
                        // console.log("reschedule.key_reschedule:", reschedule.key_reschedule);
                        // console.log("item._id:", item._id);
                        // Perbaikan utama di sini:
                        if (reschedule.key_reschedule === item._id.toString()) { // Gunakan === dan pastikan tipe data sama
                            valueToAdd = amountTotal - otaTotal - countLess;
                            // console.log("✅ Normal Calculation (matching IDs):", valueToAdd);
                        }
                        else {
                            valueToAdd = reschedule.reschedule_fee || 0;
                            // console.log("❌ Applying Reschedule Fee (non-matching IDs):", valueToAdd);
                        }
                    }
                    else {
                        //  console.log("Reschedule STATUS: INACTIVE");
                        if (voucher === null || voucher === void 0 ? void 0 : voucher.personal_voucher) {
                            valueToAdd = 0;
                            //  console.log("Voucher Applied (Personal Voucher) → valueToAdd = 0");
                        }
                        else {
                            valueToAdd = amountTotal - otaTotal - countLess;
                            //  console.log("No Voucher → Normal Calculation:", valueToAdd);
                        }
                    }
                    // Masukkan ke array
                    valueToAddList.push(valueToAdd);
                    //  console.log("Final valueToAdd:", valueToAdd);
                });
                // console.log(valueToAddList)
                // 2. Hitung total jika perlu
                const TotalPrice = valueToAddList.reduce((sum, value) => sum + value, 0);
                // console.log("\n===== FINAL RESULT =====");
                // console.log("valueToAddList:", valueToAddList);
                // console.log("Total Amount:", valueToAddList.reduce((sum, value) => sum + value, 0));
                // console.log("=========================");
                // console.log(`✅ Profit start date from : ${startOfMonthF}  to : ${endOfMonthF}`,)
                // Kirim response
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: [],
                    BookingOneMOnth: BookingOneMOnth,
                    Amount_Booking,
                    ReservationTotal: ReservationTotal,
                    ProfitBookingPerMonth: TotalPrice,
                    messageProfit: `Profit start date from : ${startOfMonthF}  to : ${endOfMonthF}`,
                    success: true
                });
            }
            catch (error) {
                res.status(500).json({
                    message: "Failed to count booking",
                    error: error instanceof Error ? error.message : error
                });
            }
        });
    }
    static ModalRoomAvailable(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const monthParam = req.query.month; // contoh: "2025-07"
                if (!monthParam) {
                    return res.status(400).json({ message: 'Month is required' });
                }
                const startOfMonth = (0, dayjs_1.default)(monthParam).startOf('month');
                const endOfMonth = (0, dayjs_1.default)(monthParam).endOf('month');
                // Ambil semua data booking yang aktif (overlap) di bulan tersebut
                const data = yield models_RoomStatus_1.RoomStatusModel.find({
                    isDeleted: false,
                    $or: [
                        {
                            checkOut: { $gte: startOfMonth.toISOString() },
                            checkIn: { $lte: endOfMonth.toISOString() }
                        },
                    ],
                });
                const AmountReschedule = yield models_booking_1.BookingModel.find({
                    isDeleted: false,
                    "reschedule.status": { $eq: true },
                    $or: [
                        {
                            checkOut: { $gte: startOfMonth.toISOString() },
                            checkIn: { $lte: endOfMonth.toISOString() }
                        },
                    ],
                });
                const AmountChancelBooking = yield models_booking_1.BookingModel.find({
                    isDeleted: true,
                    "reschedule.status": { $eq: true },
                    $or: [
                        {
                            checkOut: { $gte: startOfMonth.toISOString() },
                            checkIn: { $lte: endOfMonth.toISOString() }
                        },
                    ],
                });
                console.log('[Found Bookings]', data.length);
                data.forEach((item) => {
                    console.log(`[${item.code}] From: ${(0, dayjs_1.default)(item.checkIn).format('YYYY-MM-DD')} To: ${(0, dayjs_1.default)(item.checkOut).format('YYYY-MM-DD')}`);
                });
                console.log(monthParam);
                console.log(startOfMonth.toDate());
                console.log(endOfMonth.toDate());
                console.log('data :', data);
                const daysInMonth = startOfMonth.daysInMonth();
                const result = [];
                for (let i = 0; i < daysInMonth; i++) {
                    const currentDate = startOfMonth.add(i, 'day');
                    // Ambil semua villa yang aktif di tanggal ini
                    const villasOnThisDay = data
                        .filter(item => (0, dayjs_1.default)(item.checkIn).isSameOrBefore(currentDate, 'day') &&
                        (0, dayjs_1.default)(item.checkOut).isAfter(currentDate, 'day'))
                        .map(item => item.code); // atau item.name kalau mau pakai nama
                    // Kelompokkan per 3 kode villa
                    const chunked = [];
                    for (let j = 0; j < villasOnThisDay.length; j += 3) {
                        chunked.push({ vila: villasOnThisDay.slice(j, j + 3), color: 'use' });
                    }
                    result.push({
                        date: currentDate.format('YYYY-MM-DD'),
                        target_use: chunked
                    });
                }
                return res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: result,
                    dataAmountReschedule: AmountReschedule.length,
                    dataAmountChancelBooking: AmountChancelBooking.length,
                    success: true
                });
            }
            catch (err) {
                console.error('[ModalRoomAvailable Error]', err);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
    static SaveRoomCondition(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data } = req.body;
                if (!Array.isArray(data)) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        success: false,
                        message: 'Data harus berupa array'
                    });
                }
                // Kosongkan koleksi dulu (jika replace all)
                yield models_RoomCondition_1.RoomConditionModel.deleteMany({});
                // Simpan semua data baru ke DB
                const inserted = yield models_RoomCondition_1.RoomConditionModel.insertMany(data);
                return res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    success: true,
                    data: inserted
                });
            }
            catch (err) {
                console.error('[RoomCondition Save Error]', err);
                return res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    success: false,
                    message: 'Terjadi kesalahan server'
                });
            }
        });
    }
    static GetRoomConditions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield models_RoomCondition_1.RoomConditionModel.find({ isDeleted: false });
                return res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    success: true,
                    data: result
                });
            }
            catch (err) {
                console.error('[RoomCondition GET Error]', err);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
}
exports.DashboardController = DashboardController;
