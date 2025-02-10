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
exports.SetMinderController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const models_room_1 = __importDefault(require("../../../models/Room/models_room"));
const constant_1 = require("../../../constant");
const models_SitemMinder_1 = require("../../../models/SiteMinder/models_SitemMinder");
const models_ShortAvailable_1 = require("../../../models/ShortAvailable/models_ShortAvailable");
const log_1 = require("../../../log");
const models_transaksi_1 = require("../../../models/Transaction/models_transaksi");
class SetMinderController {
    static SetUpPrice(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { prices } = req.body;
                if (!prices || typeof prices !== 'object') {
                    return res.status(400).json({ message: 'Invalid data format' });
                }
                const bulkOperations = [];
                for (const roomId in prices) {
                    for (const date in prices[roomId]) {
                        const price = prices[roomId][date];
                        bulkOperations.push({
                            updateOne: {
                                filter: { roomId, date },
                                update: { $set: { price } },
                                upsert: true,
                            },
                        });
                    }
                }
                yield models_SitemMinder_1.SiteMinderModel.bulkWrite(bulkOperations);
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: `Prices saved`,
                    success: true,
                });
            }
            catch (error) {
                res.status(500).json({ message: 'Failed to save prices', error });
            }
        });
    }
    static SetPriceForHolidays(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, price } = req.query;
                // Validasi input
                if (!id || price == null) {
                    return res.status(400).json({
                        message: 'Room ID and price are required',
                    });
                }
                // Ambil daftar tanggal hari libur nasional
                const nationalHolidayDates = Object.keys(constant_1.NationalHolidays).filter((date) => constant_1.NationalHolidays[date].holiday === true);
                if (nationalHolidayDates.length === 0) {
                    return res.status(404).json({
                        message: 'No national holidays found for the provided year',
                    });
                }
                // Siapkan operasi bulk untuk pembaruan harga
                const bulkOperations = nationalHolidayDates.map((date) => ({
                    updateOne: {
                        filter: { roomId: id, date },
                        update: { $set: { price } },
                        upsert: true, // Jika data belum ada, tambahkan
                    },
                }));
                // Jalankan operasi bulk
                if (bulkOperations.length > 0) {
                    yield models_SitemMinder_1.SiteMinderModel.bulkWrite(bulkOperations);
                }
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: `Prices updated for national holidays`,
                    success: true,
                });
            }
            catch (error) {
                res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message,
                    success: false,
                });
            }
        });
    }
    static SetPriceForCustomDate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { roomId, price, dates } = req.body;
                // Validasi input
                if (!roomId || price == null) {
                    return res.status(400).json({
                        message: 'Room ID Or Price are required',
                    });
                }
                if (dates.length === 0) {
                    return res.status(404).json({
                        message: 'No found Date custom',
                    });
                }
                const dateArray = Array.isArray(dates) ? dates : [dates]; // Pastikan selalu array
                // Siapkan operasi bulk untuk pembaruan harga
                const bulkOperations = dateArray.map((date) => ({
                    updateOne: {
                        filter: { roomId, date },
                        update: { $set: { price }
                        },
                        upsert: true, // Jika data belum ada, tambahkan
                    },
                }));
                // Jalankan operasi bulk
                if (bulkOperations.length > 0) {
                    yield models_SitemMinder_1.SiteMinderModel.bulkWrite(bulkOperations);
                }
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: `Prices ${roomId} updated for Custom date`,
                    success: true,
                });
            }
            catch (error) {
                res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message,
                    success: false,
                });
            }
        });
    }
    static SetPriceWeekDay(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { year, id, price } = req.query;
                // Validasi input
                if (!id || !price || !year) {
                    return res.status(400).json({
                        message: 'Room ID and price are required by Weekday',
                    });
                }
                // Ambil semua tanggal dalam tahun tertentu kecuali Jumat dan Sabtu
                const allDatesInYear = [];
                const startDate = new Date(`${year}-01-01`); // Awal tahun
                const endDate = new Date(`${year}-12-31`); // Akhir
                // Metode setDate() sering digunakan untuk memanipulasi tanggal dalam sebuah loop, seperti saat membuat daftar tanggal dalam satu tahun.
                for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) // getDate mengembalikan angka yang merepresentasikan hari dalam seminggu 
                 {
                    // getDay() Mengembalikan hari dalam seminggu dari tanggal dan bulan tertentu sebagai nilai numerik
                    const dayOfWeek = d.getDay(); // Ex : 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
                    if (dayOfWeek !== 5 && dayOfWeek !== 6) { // Kecualikan Jumat (5) dan Sabtu (6) untuk disimpan
                        //  mengembalikan tanggal dalam format ISO (contoh: 2025-01-01T00:00:00.000Z). .split('T')[0] mengambil bagian tanggal saja (contoh: 2025-01-01).
                        allDatesInYear.push(d.toISOString().split('T')[0]);
                    }
                }
                // Siapkan operasi bulk untuk pembaruan harga
                const bulkOperations = allDatesInYear.map((date) => ({
                    updateOne: {
                        filter: { roomId: id, date },
                        update: { $set: { price } },
                        upsert: true, // Jika data belum ada, tambahkan
                    },
                }));
                // Jalankan operasi bulk
                if (bulkOperations.length > 0) {
                    yield models_SitemMinder_1.SiteMinderModel.bulkWrite(bulkOperations);
                }
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: `Prices updated for all weekdays except Fridays and Saturdays`,
                    success: true,
                });
            }
            catch (error) {
                res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message,
                    success: false,
                });
            }
        });
    }
    static SetPriceWeekend(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { year, id, price } = req.query;
                // Validasi input
                if (!id || !price || !year) {
                    return res.status(400).json({
                        message: 'Room ID and price are required by Weekday',
                    });
                }
                // Ambil semua tanggal dalam tahun tertentu hanya untuk Jumat dan Sabtu
                const allDatesInYear = [];
                const startDate = new Date(`${year}-01-01`); // Awal tahun
                const endDate = new Date(`${year}-12-31`); // Akhir
                // Loop untuk mengidentifikasi tanggal yang jatuh pada Jumat dan Sabtu
                for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
                    const dayOfWeek = d.getDay(); // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
                    if (dayOfWeek === 5 || dayOfWeek === 6) { // Jumat (5) atau Sabtu (6)
                        allDatesInYear.push(d.toISOString().split('T')[0]); // Menyimpan tanggal dalam format ISO
                    }
                }
                // Siapkan operasi bulk untuk pembaruan harga
                const bulkOperations = allDatesInYear.map((date) => ({
                    updateOne: {
                        filter: { roomId: id, date },
                        update: { $set: { price } },
                        upsert: true, // Jika data belum ada, tambahkan
                    },
                }));
                // Jalankan operasi bulk
                if (bulkOperations.length > 0) {
                    yield models_SitemMinder_1.SiteMinderModel.bulkWrite(bulkOperations);
                }
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: `Prices updated for Fridays and Saturdays only`,
                    success: true,
                });
            }
            catch (error) {
                res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message,
                    success: false,
                });
            }
        });
    }
    static GetAllPriceByYear(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { year } = req.query;
                if (!year) {
                    return res.status(400).json({ message: 'Year are required' });
                }
                const startDate = new Date(`${year}-01-01`); // Awal tahun
                const endDate = new Date(`${year}-12-31`); // Akhir
                endDate.setMonth(endDate.getMonth() + 1);
                const prices = yield models_SitemMinder_1.SiteMinderModel.find({
                    date: {
                        $gte: startDate.toISOString().split('T')[0],
                        $lt: endDate.toISOString().split('T')[0],
                    },
                });
                const formattedPrices = {};
                prices.forEach(({ roomId, date, price }) => {
                    if (!formattedPrices[roomId]) {
                        formattedPrices[roomId] = {};
                    }
                    formattedPrices[roomId][date] = price;
                });
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: formattedPrices,
                    message: `Set from year ${year} `,
                    success: true,
                });
            }
            catch (error) {
                res.status(500).json({ message: 'Failed to fetch prices', error });
            }
        });
    }
    static GetAllPrice(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { year, month } = req.query;
                if (!year || !month) {
                    return res.status(400).json({ message: 'Year and month are required' });
                }
                const startDate = new Date(`${year}-${month}-01`);
                const endDate = new Date(startDate);
                endDate.setMonth(endDate.getMonth() + 1);
                const prices = yield models_SitemMinder_1.SiteMinderModel.find({
                    date: {
                        $gte: startDate.toISOString().split('T')[0],
                        $lt: endDate.toISOString().split('T')[0],
                    },
                });
                const formattedPrices = {};
                prices.forEach(({ roomId, date, price }) => {
                    if (!formattedPrices[roomId]) {
                        formattedPrices[roomId] = {};
                    }
                    formattedPrices[roomId][date] = price;
                });
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: formattedPrices,
                    message: `Successfully retrieved rooms. From year: ${year} month: ${month}`,
                    success: true,
                });
            }
            catch (error) {
                res.status(500).json({ message: 'Failed to fetch prices', error });
            }
        });
    }
    static GetAllRoomWithAvailable(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { year, month } = req.query;
                // Validasi input
                if (!year || !month) {
                    return res.status(400).json({ message: "Year and month are required" });
                }
                // Pastikan month selalu dalam format 2 digit
                const formattedMonth = String(month).padStart(2, "0");
                // Set tanggal mulai dan akhir
                const startDate = new Date(`${year}-${formattedMonth}-01T00:00:00Z`);
                const endDate = new Date(startDate);
                endDate.setUTCMonth(endDate.getUTCMonth() + 1); // Bulan berikutnya
                // Fungsi untuk menghasilkan rentang tanggal
                const generateDateRange = (start, end) => {
                    const dates = [];
                    let currentDate = new Date(start);
                    while (currentDate < end) {
                        dates.push(currentDate.toISOString().split("T")[0]); // Format YYYY-MM-DD
                        currentDate.setUTCDate(currentDate.getUTCDate() + 1); // Tambah 1 hari
                    }
                    return dates;
                };
                // Pastikan rentang tanggal dihitung dengan benar
                const dateRange = generateDateRange(startDate, endDate);
                // Log hasil rentang tanggal
                // Logging(dateRange, "Hasil generate Date range");
                // Ambil data dari database
                const roomData = yield models_ShortAvailable_1.ShortAvailableModel.find({ isDeleted: false });
                // Struktur hasil filter
                const resultFilter = {};
                // Proses data
                roomData.forEach((room) => {
                    room.products.forEach((product) => {
                        const roomId = product.roomId;
                        // Inisialisasi resultFilter dengan rentang tanggal
                        if (!resultFilter[roomId]) {
                            resultFilter[roomId] = {};
                            dateRange.forEach((date) => {
                                resultFilter[roomId][date] = 0; // Default 0
                            });
                        }
                        // Rentang tanggal check-in dan check-out
                        const checkIn = new Date(room.checkIn).toISOString().split("T")[0];
                        const checkOut = new Date(room.checkOut).toISOString().split("T")[0];
                        const validDates = generateDateRange(new Date(checkIn), new Date(checkOut));
                        // Perbarui resultFilter dengan tanggal valid
                        validDates.forEach((date) => {
                            if (resultFilter[roomId][date] !== undefined) {
                                resultFilter[roomId][date] += product.quantity;
                            }
                        });
                    });
                });
                // Kirimkan hasil response
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: resultFilter,
                    message: `Successfully retrieved rooms. From year: ${year}, month: ${month}`,
                    success: true,
                });
            }
            catch (error) {
                res.status(500).json({ message: "Failed to fetch Room", error });
            }
        });
    }
    static GetAllRoomWithUnAvailable(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { year, month } = req.query;
                // Validasi input
                if (!year || !month) {
                    return res.status(400).json({ message: "Year and month are required" });
                }
                // Pastikan month selalu dalam format 2 digit
                const formattedMonth = String(month).padStart(2, "0");
                // Set tanggal mulai dan akhir
                const startDate = new Date(`${year}-${formattedMonth}-01T00:00:00Z`);
                const endDate = new Date(startDate);
                endDate.setUTCMonth(endDate.getUTCMonth() + 1); // Bulan berikutnya
                // Fungsi untuk menghasilkan rentang tanggal
                const generateDateRange = (start, end) => {
                    const dates = [];
                    let currentDate = new Date(start);
                    while (currentDate < end) {
                        dates.push(currentDate.toISOString().split("T")[0]); // Format YYYY-MM-DD
                        currentDate.setUTCDate(currentDate.getUTCDate() + 1); // Tambah 1 hari
                    }
                    return dates;
                };
                // Pastikan rentang tanggal dihitung dengan benar
                const dateRange = generateDateRange(startDate, endDate);
                // Log hasil rentang tanggal
                // Logging(dateRange, "Hasil generate Date range");
                // Ambil data dari database
                const roomData = yield models_ShortAvailable_1.ShortAvailableModel.find({ isDeleted: false });
                const Room = yield models_room_1.default.find({ isDeleted: false });
                const availabilityRoom = Room.map(room => { return { id: room._id.toString(), availability: room.available }; });
                (0, log_1.Logging)(availabilityRoom, "Hasil availabilityRoom ");
                // Struktur hasil filter
                const resultFilter = {};
                // Proses data
                roomData.forEach((room) => {
                    room.products.forEach((product) => {
                        const roomId = product.roomId;
                        // Inisialisasi resultFilter dengan rentang tanggal
                        if (!resultFilter[roomId]) {
                            resultFilter[roomId] = {};
                            dateRange.forEach((date) => {
                                resultFilter[roomId][date] = 0; // Default 0
                            });
                        }
                        // Rentang tanggal check-in dan check-out
                        const checkIn = new Date(room.checkIn).toISOString().split("T")[0];
                        const checkOut = new Date(room.checkOut).toISOString().split("T")[0];
                        const validDates = generateDateRange(new Date(checkIn), new Date(checkOut));
                        // Perbarui resultFilter dengan tanggal valid
                        validDates.forEach((date) => {
                            if (resultFilter[roomId][date] !== undefined) {
                                resultFilter[roomId][date] += 0;
                            }
                        });
                    });
                });
                // Ganti nilai 0 dengan availability dari availabilityRoom
                Object.keys(resultFilter).forEach((roomId) => {
                    const availabilityData = availabilityRoom.find((room) => room.id === roomId);
                    if (availabilityData) {
                        Object.keys(resultFilter[roomId]).forEach((date) => {
                            if (resultFilter[roomId][date] === 0) {
                                resultFilter[roomId][date] = availabilityData.availability;
                            }
                        });
                    }
                });
                // Kirimkan hasil response
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: resultFilter,
                    message: `Successfully retrieved rooms. From year: ${year}, month: ${month}`,
                    success: true,
                });
            }
            catch (error) {
                res.status(500).json({ message: "Failed to fetch Room", error });
            }
        });
    }
    static GetAllTransactionFromYearAndMonth(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { year, month } = req.query;
                // Validasi input
                if (!year || !month) {
                    return res.status(400).json({ message: "Year and month are required" });
                }
                // Format bulan agar selalu dua digit
                const monthStr = String(month).padStart(2, "0");
                // Dapatkan tanggal pertama bulan ini
                const startDate = new Date(`${year}-${monthStr}-01T00:00:00.000Z`);
                // Dapatkan tanggal terakhir bulan ini
                const endDate = new Date(startDate);
                endDate.setMonth(endDate.getMonth() + 1); // Tambah 1 bulan
                endDate.setDate(0); // Set ke hari terakhir bulan sebelumnya (misal, 31 Januari)
                endDate.setUTCHours(23, 59, 59, 999);
                console.log("Query range:", startDate.toISOString(), " - ", endDate.toISOString());
                const AvailableRoom = yield models_ShortAvailable_1.ShortAvailableModel.find({
                    status: "PAID",
                    checkIn: {
                        $gte: startDate.toISOString(),
                        $lt: endDate.toISOString(),
                    },
                    isDeleted: false
                }, { transactionId: 1, _id: 0 });
                // console.log('data availble room :', AvailableRoom);
                // Ambil hanya transactionId dari AvailableRoom
                const transactionIds = AvailableRoom.map(room => room.transactionId);
                const filterQuery = {
                    status: "PAID",
                    checkIn: {
                        $gte: startDate.toISOString(),
                        $lt: endDate.toISOString(),
                    },
                    isDeleted: false,
                    bookingId: { $in: transactionIds } // Mencocokkan bookingId dengan transactionId
                };
                // Query untuk TransactionModel (ambil semua data)
                const transactions = yield models_transaksi_1.TransactionModel.find(filterQuery);
                // console.log('data availble transactions :', transactions);
                // Kirim hasil response
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: transactions,
                    message: `Transaction ${year}-${monthStr}`,
                    message2: `Query range:", ${startDate.toISOString()},  - , ${endDate.toISOString()}`,
                    success: true
                });
            }
            catch (error) {
                res.status(500).json({ message: "Failed to fetch transactions", error });
            }
        });
    }
    static GetAllTransaction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const AvailableRoom = yield models_ShortAvailable_1.ShortAvailableModel.find({
                    status: { $in: [constant_1.PAID, constant_1.PAID_ADMIN] },
                    isDeleted: false
                }, { transactionId: 1, _id: 0 });
                // Ambil hanya transactionId dari AvailableRoom
                const transactionIds = AvailableRoom.map(room => room.transactionId);
                const filterQuery = {
                    status: { $in: [constant_1.PAID, constant_1.PAID_ADMIN] },
                    isDeleted: false,
                    bookingId: { $in: transactionIds } // Mencocokkan bookingId dengan transactionId
                };
                // Query untuk TransactionModel (ambil semua data)
                const transactions = yield models_transaksi_1.TransactionModel.find(filterQuery);
                // console.log('data availble transactions :', transactions);
                // Kirim hasil response
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: transactions,
                    success: true
                });
            }
            catch (error) {
                res.status(500).json({ message: "Failed to fetch transactions", error });
            }
        });
    }
    static DeletedTransaction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let ShortAvailable;
                let Transaction;
                const { id } = req.query;
                ShortAvailable = yield models_ShortAvailable_1.ShortAvailableModel.findOneAndUpdate({ transactionId: id }, { isDeleted: false }, { new: true, runValidators: true });
                if (!ShortAvailable) {
                    return res.status(404).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "Data ShortAvailable not found.",
                        success: false
                    });
                }
                yield models_ShortAvailable_1.ShortAvailableModel.updateMany({ transactionId: id }, { isDeleted: true });
                Transaction = yield models_transaksi_1.TransactionModel.findOneAndUpdate({ bookingId: id }, { isDeleted: false }, { new: true, runValidators: true });
                if (!Transaction) {
                    return res.status(404).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "Transaction not found.",
                        success: false
                    });
                }
                yield models_transaksi_1.TransactionModel.updateMany({ bookingId: id }, { isDeleted: true });
                res.status(201).json({
                    requestId: (0, uuid_1.v4)(),
                    data: [],
                    message: `Successfully Deleted ID : ${id}  `,
                    success: true
                });
            }
            catch (error) {
                res.status(400).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message,
                    success: false
                });
            }
        });
    }
    static UpdateTransactionDate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_TRX, Edit_Date } = req.body;
            const SetcheckIn = Edit_Date[0];
            const SetcheckOut = Edit_Date[Edit_Date.length - 1];
            // Konversi ke format ISO 8601
            const checkIn = new Date(`${SetcheckIn}T08:00:00.000Z`).toISOString();
            const checkOut = new Date(`${SetcheckOut}T05:00:00.000Z`).toISOString();
            // new Date() akan otomatis mengonversi string ISO 8601 menjadi objek Date di JavaScript.
            // Jika Mongoose mendeteksi bahwa field dalam skema bertipe Date, maka MongoDB akan menyimpannya dalam format ISO 8601 seperti berikut:
            try {
                // Jalankan dua update secara paralel menggunakan Promise.all() agar lebih cepat
                const [ShortAvailable, Transaction] = yield Promise.all([
                    models_ShortAvailable_1.ShortAvailableModel.findOneAndUpdate({ transactionId: id_TRX, isDeleted: false }, { checkIn, checkOut }, { new: true, runValidators: true }),
                    models_transaksi_1.TransactionModel.findOneAndUpdate({ bookingId: id_TRX, isDeleted: false }, { checkIn, checkOut }, { new: true, runValidators: true })
                ]);
                // Cek apakah data ditemukan
                if (!ShortAvailable || !Transaction) {
                    return res.status(404).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: !ShortAvailable ? "Data ShortAvailable tidak ditemukan." : "Transaction tidak ditemukan.",
                        success: false
                    });
                }
                res.status(201).json({
                    requestId: (0, uuid_1.v4)(),
                    data: [],
                    // message: `Data yang akan diset ${checkIn}, dan ${checkOut}`,
                    message: `Data ${id_TRX}, has update`,
                    success: true
                });
            }
            catch (error) {
                res.status(400).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message,
                    success: false
                });
            }
        });
    }
    static UpdateStockRooms(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { roomId, available } = req.body;
                if (!mongoose_1.default.Types.ObjectId.isValid(roomId)) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "Invalid roomId",
                        success: false,
                    });
                }
                const _id = new mongoose_1.default.Types.ObjectId(roomId);
                // Lakukan update dengan opsi new: true agar mendapatkan data terbaru
                const UpdateRoomsStock = yield models_room_1.default.findOneAndUpdate({ _id, isDeleted: false }, { available }, { new: true } // Mengembalikan data terbaru
                );
                if (!UpdateRoomsStock) {
                    return res.status(404).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "Room not found",
                        success: false,
                    });
                }
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: UpdateRoomsStock, // Kembalikan data terbaru
                    message: `Stock ${UpdateRoomsStock.name} has been updated`,
                    success: true,
                });
            }
            catch (error) {
                res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message,
                    success: false,
                });
            }
        });
    }
}
exports.SetMinderController = SetMinderController;
