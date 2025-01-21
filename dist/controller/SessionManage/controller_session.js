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
exports.SessionController = void 0;
const uuid_1 = require("uuid");
const models_room_1 = __importDefault(require("../../models/Room/models_room"));
const models_session_1 = require("../../models/Booking/models_session");
const moment_1 = __importDefault(require("moment"));
const models_SitemMinder_1 = require("../../models/SiteMinder/models_SitemMinder");
const calculateTotalPrice_1 = require("./calculateTotalPrice");
class SessionController {
    static SetNight(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { night, date } = req.body;
            // Validasi input
            if (!night || night <= 0) {
                return res.status(400).json({ message: 'Wrong in set night' });
            }
            // Jika cart belum ada, inisialisasi
            if (!req.session.cart) {
                req.session.cart = [];
            }
            try {
                req.session.night = night;
                req.session.date = date;
                req.session.save(err => {
                    if (err) {
                        console.error('Error saving session:', err);
                        return res.status(500).json({ error: 'Failed to save session' });
                    }
                    res.json({
                        message: night + ' Night adding ',
                    });
                });
            }
            catch (error) {
                console.error('Error add Night', error);
                res.status(500).json({ message: error.message, });
            }
        });
    }
    // Sementara tidak digunakakan
    static setDate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { date } = req.body;
            // Validasi input
            if (!date || date <= 0) {
                return res.status(400).json({ message: 'Wrong in set date' });
            }
            // Jika cart belum ada, inisialisasi
            if (!req.session.cart) {
                req.session.cart = [];
            }
            try {
                req.session.date = date;
                req.session.save(err => {
                    if (err) {
                        console.error('Error saving session:', err);
                        return res.status(500).json({ error: 'Failed to save session' });
                    }
                    res.json({
                        message: date + ' Date adding ',
                    });
                });
            }
            catch (error) {
                console.error('Error add Date', error);
                res.status(500).json({ message: error.message, });
            }
        });
    }
    static PostChartRoom(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { roomId, quantity } = req.body;
            // Validasi input
            if (!roomId || quantity <= 0) {
                return res.status(400).json({ error: 'Invalid input' });
            }
            // Jika cart belum ada, inisialisasi
            if (!req.session.cart) {
                req.session.cart = [];
            }
            try {
                // Cari data kamar berdasarkan roomId
                const room = yield models_room_1.default.findById(roomId);
                if (!room) {
                    return res.status(404).json({ error: 'Room not found' });
                }
                const availableQty = room.available; // Ambil jumlah kamar yang tersedia
                const price = room.price; // Ambil harga dari database
                // Cari apakah roomId sudah ada di cart
                const existingItem = req.session.cart.find(item => item.roomId === roomId);
                if (existingItem) {
                    // Hitung jumlah total jika quantity ditambahkan
                    const newQuantity = existingItem.quantity + quantity;
                    if (newQuantity > availableQty) {
                        return res.status(400).json({
                            message: 'Quantity exceeds available rooms',
                            available: availableQty
                        });
                    }
                    // Tambahkan quantity jika valid
                    existingItem.quantity = newQuantity;
                }
                else {
                    // Periksa apakah jumlah yang diminta melebihi jumlah yang tersedia
                    if (quantity > availableQty) {
                        return res.status(400).json({
                            message: 'Quantity exceeds available rooms',
                            available: availableQty
                        });
                    }
                    // Tambahkan sebagai item baru
                    req.session.cart.push({ roomId, quantity, price });
                    req.session.deviceInfo = {
                        userAgent: req.get('User-Agent'), // Menyimpan informasi tentang browser/perangkat
                        ipAddress: req.ip, // Menyimpan alamat IP pengguna
                    };
                }
                // Hitung total harga
                const totalPrice = req.session.cart.reduce((total, item) => {
                    const itemPrice = Number(item.price);
                    const itemQuantity = Number(item.quantity);
                    return total + itemPrice * itemQuantity;
                }, 0);
                // Simpan perubahan ke session
                req.session.save(err => {
                    if (err) {
                        console.error('Error saving session:', err);
                        return res.status(500).json({ error: 'Failed to save session' });
                    }
                    res.json({
                        message: 'Item added to cart',
                        cart: req.session.cart,
                        totalPrice
                    });
                });
            }
            catch (error) {
                console.error('Error fetching room data:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
    static DelChartRoom(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { itemId } = req.body; // Ambil itemId dari request body
            // Pastikan cart ada dan itemId diberikan
            if (!req.session.cart || !itemId) {
                return res.status(400).json({ message: 'Cart is empty or itemId not provided' });
            }
            // Temukan item yang ingin dihapus atau dikurangi quantity-nya
            const item = req.session.cart.find(item => item.roomId === itemId);
            if (!item) {
                return res.status(404).json({ message: 'Item not found in cart' });
            }
            // Jika quantity lebih dari 1, kurangi quantity-nya
            if (item.quantity > 1) {
                item.quantity -= 1;
            }
            else {
                // Jika quantity 1, hapus item dari cart
                req.session.cart = req.session.cart.filter(item => item.roomId !== itemId);
            }
            return res.json({ message: 'Item updated in cart', cart: req.session.cart });
        });
    }
    static GetChartRoom(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sessionId = req.cookies["connect.sid"];
                if (!sessionId) {
                    return res.status(400).json({ error: "Session ID not provided" });
                }
                const session = yield models_session_1.SessionModel.findOne({ _id: sessionId });
                return res.status(200).json({
                    data: session,
                    message: 'Get Chart Sucsessfully'
                });
            }
            catch (error) {
                console.error('Error in GetChart:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
    ;
    // sudah di tambah siteminder data
    static GetTotalPrice(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Debugging: Lihat session yang ada di setiap permintaan
                console.log('Session:', req.session);
                // Cek apakah cart ada di session
                if (!req.session.cart) {
                    req.session.cart = [];
                }
                // Ambil data cart dari session
                const cart = req.session.cart;
                const night = req.session.night;
                const date = req.session.date;
                // Jika cart kosong, kirimkan respons error
                if (cart.length === 0) {
                    return res.status(404).json({ message: 'There are problems in sessions charts' });
                }
                if (!night) {
                    return res.status(404).json({ message: 'There are problems in sessions night set' });
                }
                const dateMinderStart = moment_1.default.utc(date === null || date === void 0 ? void 0 : date.checkin).format('YYYY-MM-DD');
                const dateMinderEnd = moment_1.default.utc(date === null || date === void 0 ? void 0 : date.checkout).subtract(1, 'days').format('YYYY-MM-DD');
                const siteMinders = yield models_SitemMinder_1.SiteMinderModel.find({
                    isDeleted: false,
                    date: { $gte: dateMinderStart, $lte: dateMinderEnd }, // Filter berdasarkan tanggal
                });
                console.log('site minder data in server:', siteMinders); // Debugging
                const totalPrice = (0, calculateTotalPrice_1.calculateTotalPrice)(cart, siteMinders);
                const tax = totalPrice * 0.12;
                // Debugging totalPrice
                console.log('Total Price:', totalPrice); // Debugging
                // Kirim respons dengan cart dan total harga
                return res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: cart,
                    totalPrice: totalPrice + tax,
                    nonTax: totalPrice,
                    amountNight: night,
                    message: 'Successfully calculated total price.',
                    success: true,
                });
            }
            catch (error) {
                console.error('Error in GetTotalPrice:', error);
                res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    // message: (error as Error).message,
                    message: 'Error to acumulation price' + error.message,
                    success: false,
                });
            }
        });
    }
    static CekSessions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Session data:', req.session);
            res.json(req.session);
        });
    }
    ;
    static Checkout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const cart = req.session.cart;
            // Pastikan cart tidak kosong
            if (!cart || cart.length === 0) {
                return res.status(400).json({ error: 'Cart is empty' });
            }
            // Validasi ulang data di server (contoh: cek harga dan ketersediaan)
            // const isValid = await validateCart(cart); // Implementasi validasi tergantung kebutuhan
            // if (!isValid) {
            //   return res.status(400).json({ error: 'Invalid cart data' });
            // }
            // Simpan transaksi ke database
            // const transaction = await saveTransaction(cart);
            // Bersihkan session setelah checkout berhasil
            req.session.cart = [];
            // res.json({ message: 'Checkout successful', transactionId: transaction.id });
        });
    }
    ;
    static RemoveCart(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                req.session.destroy((err) => {
                    if (err) {
                        console.error('Error destroying session:', err);
                        return res.status(500).json({
                            requestId: (0, uuid_1.v4)(),
                            data: null,
                            message: 'Failed to delete session.',
                            success: false,
                        });
                    }
                    // Hapus cookie session
                    res.clearCookie('connect.sid'); // Ganti 'connect.sid' dengan nama cookie session Anda
                    res.status(200).json({
                        requestId: (0, uuid_1.v4)(),
                        message: 'Session successfully deleted in server.',
                        success: true,
                    });
                });
            }
            catch (error) {
                console.error('Error in RemoveCart:', error);
                res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message,
                    success: false,
                });
            }
        });
    }
    static DelChartInSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // Pastikan cart ada dan itemId diberikan
            if (!req.session.cart) {
                return res.status(400).json({ message: 'Cart is empty ' });
            }
            req.session.cart = [];
            return res.status(200).json({
                message: 'Field Chart has Deleted',
                cart: req.session.cart
            });
        });
    }
}
exports.SessionController = SessionController;
