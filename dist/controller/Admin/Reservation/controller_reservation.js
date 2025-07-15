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
exports.ReservationController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const { ObjectId } = mongoose_1.default.Types;
const crypto_1 = __importDefault(require("crypto"));
const models_transaksi_1 = require("../../../models/Transaction/models_transaksi");
const Index_1 = require("./components/Index");
const FilterWithRoomPending_1 = require("./components/FilterWithRoomPending");
const Controller_PendingRoom_1 = require("../../PendingRoom/Controller_PendingRoom");
const controller_short_1 = require("../../ShortAvailable/controller_short");
const constant_1 = require("../../../constant");
const models_booking_1 = require("../../../models/Booking/models_booking");
const controller_invoice_1 = require("../Invoice/controller_invoice");
const Filter_1 = require("../RoomStatus/components/Filter");
const Service_1 = require("../RoomStatus/components/Service");
const RefReschedule_1 = require("../SiteMinder/components/RefReschedule");
const AddPayment_1 = require("./components/AddPayment");
class ReservationController {
    static GetAllTransactionReservation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const AvailableRoom = await ShortAvailableModel.find(
                //   {
                //     status: { $in: ["PAID", "PAYMENT_ADMIN"] },
                //     isDeleted: false
                //   },
                //   { bookingId: 1, _id: 0 }
                // );
                // // Ambil hanya transactionId dari AvailableRoom
                // const transactionIds = AvailableRoom.map(room => room.bookingId);
                const filterQuery = {
                    status: { $in: [constant_1.PAYMENT_ADMIN, constant_1.PAID_ADMIN] },
                    reservation: true,
                    isDeleted: false,
                    // bookingId: { $in: transactionIds } // Mencocokkan bookingId dengan transactionId
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
    static CountReservation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const filterQuery = {
                    status: { $in: [constant_1.PAYMENT_ADMIN, constant_1.PAID_ADMIN] },
                    reservation: true,
                    isDeleted: false
                };
                // HITUNG JUMLAH DOKUMEN TANPA MENGAMBIL DATA
                const count = yield models_transaksi_1.TransactionModel.countDocuments(filterQuery);
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: count, // KIRIM JUMLAH SAJA
                    success: true
                });
            }
            catch (error) {
                res.status(500).json({
                    message: "Failed to count reservations",
                    error: error instanceof Error ? error.message : error
                });
            }
        });
    }
    // static async CountReservationDetails(req: Request, res: Response) {
    //   try {
    //     const result = await TransactionModel.aggregate([
    //       {
    //         $match: {
    //           reservation: true,
    //           isDeleted: false,
    //           status: { $in: [PAYMENT_ADMIN, PAID_ADMIN] }
    //         }
    //       },
    //       {
    //         $group: {
    //           _id: "$status",
    //           count: { $sum: 1 }
    //         }
    //       }
    //     ]);
    //     // Konversi hasil agregasi ke format lebih mudah
    //     const counts = result.reduce((acc, curr) => {
    //       acc[curr._id] = curr.count;
    //       return acc;
    //     }, {});
    //     res.status(200).json({
    //       requestId: uuidv4(),
    //       counts: {
    //         total: result.reduce((sum, curr) => sum + curr.count, 0),
    //         ...counts
    //       },
    //       success: true
    //     });
    //   } catch (error) {
    //     res.status(500).json({ 
    //       message: "Failed to count reservations",
    //       error: error instanceof Error ? error.message : error 
    //     });
    //   }
    // }
    // {
    //   "counts": {
    //     "total": 15,
    //     "PAYMENT_ADMIN": 10,
    //     "PAID_ADMIN": 5
    //   }
    // }
    static AddTransaction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Destructure req.body
                const { title, name, email, phone, grossAmount, otaTotal, reservation, products, night, voucher, checkIn, checkOut, selectOta, roomType, } = req.body;
                // Melakukan pengecekan apakah room type yang sedang dipilih apaka sudah sedang digunakan
                const dataFilterStatusRoom = yield (0, Filter_1.FilterAvailableWithRoomStatus)(checkIn, checkOut);
                const CekRoomInUse = yield (0, Filter_1.CompareSameDataWithRoomStatus)(roomType, dataFilterStatusRoom);
                // Jika terdapat data yang sudah digunakan kembalikan false
                if (CekRoomInUse.sameRoomTypeOnly.length > 0) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        message: "The room you have selected is currently in use",
                        success: false,
                        data: CekRoomInUse,
                    });
                }
                // console.log(`Ini data payload room dari reservation: ${JSON.stringify(products, null, 2)}`);
                // ✅ Validasi data sebelum disimpan
                if (!title || !name || !email || !phone || !grossAmount || !checkIn || !checkOut || !selectOta) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        message: "All required fields must be provided!",
                        success: false,
                        data: null,
                    });
                }
                // Cek Roompending sebelum membuat reservation transaction 
                const ReservationReadyToBeSaved = yield FilterWithRoomPending_1.ReservationService.createReservation({ products, checkIn, checkOut });
                // Cek Apakah Room Masih dalam tahap Pending semua
                if (ReservationReadyToBeSaved.WithoutPending === 0) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        message: "All Room is Pending",
                        data: `Data Pending : ${ReservationReadyToBeSaved.PendingRoom}`,
                        success: false,
                    });
                }
                console.log(`Ini data reservation after filter : ${JSON.stringify(ReservationReadyToBeSaved.WithoutPending, null, 2)}`);
                // Mix data Product with OTA
                // const ProductClean = await OTAService.Mix_OTA(products,ReservationReadyToBeSaved.WithoutPending)
                // console.log(`Ini data reservation after Mix OTA : ${ProductClean}`);
                // Set Up Data Lain
                const bookingId = 'TRX-' + crypto_1.default.randomBytes(5).toString('hex');
                const status = constant_1.PAYMENT_ADMIN;
                // Daftarkan terlebih dahulu usernya
                const IsHaveAccount = yield (0, Index_1.CekUser)(email);
                let userId;
                if (!IsHaveAccount) {
                    userId = yield (0, Index_1.Register)(title, name, email, phone);
                }
                // ✅ Buat objek baru berdasarkan schema
                const newBooking = new models_booking_1.BookingModel({
                    orderId: bookingId,
                    userId: IsHaveAccount !== null && IsHaveAccount !== void 0 ? IsHaveAccount : userId,
                    status,
                    title,
                    name,
                    email,
                    phone,
                    voucher,
                    amountTotal: grossAmount,
                    otaTotal: otaTotal,
                    reservation,
                    ota: selectOta,
                    room: ReservationReadyToBeSaved.WithoutPending,
                    night,
                    checkIn,
                    checkOut
                });
                // ✅ Simpan ke database Booking
                const savedBooking = yield newBooking.save();
                // console.log(" add transaction with reservation : ", savedBooking)
                // ✅ Buat objek baru berdasarkan schema
                const newTransaction = new models_transaksi_1.TransactionModel({
                    booking_keyId: savedBooking._id,
                    bookingId,
                    userId: IsHaveAccount !== null && IsHaveAccount !== void 0 ? IsHaveAccount : userId,
                    status,
                    title,
                    name,
                    email,
                    phone,
                    grossAmount,
                    voucher,
                    otaTotal,
                    reservation,
                    products: ReservationReadyToBeSaved.WithoutPending,
                    night,
                    checkIn,
                    checkOut
                });
                // Data untuk membuat status room
                const data = {
                    id_Trx: bookingId,
                    status: "Use",
                    bookingKey: savedBooking._id,
                    checkIn,
                    checkOut,
                    roomType,
                };
                // Fungsi untuk membuat status room 
                const createRoomStatus = yield Service_1.RoomStatusService.SetRoomStatus(data);
                if (createRoomStatus && createRoomStatus.roomStatusKey) {
                    const roomStatusKey = createRoomStatus.roomStatusKey;
                    const updatedInvoice = yield models_booking_1.BookingModel.findOneAndUpdate({ _id: savedBooking._id, isDeleted: false }, { $push: { roomStatusKey } }, { new: true, runValidators: true });
                    console.log("RoomStatusKey successfully added to booking:", updatedInvoice);
                }
                // // ✅ Simpan ke database Booking
                // const savedBooking = await newBooking.save();
                // ✅ Simpan ke database Transaction
                const savedTransaction = yield newTransaction.save();
                // SetUp Room yang akan masuk dalam Room Pending
                yield Controller_PendingRoom_1.PendingRoomController.SetPending(ReservationReadyToBeSaved.WithoutPending, bookingId, IsHaveAccount !== null && IsHaveAccount !== void 0 ? IsHaveAccount : userId, checkIn, checkOut, "reservation", req, res);
                // ✅ Berikan respon sukses
                return res.status(201).json({
                    requestId: (0, uuid_1.v4)(),
                    message: "Successfully add transaction to reservation.",
                    success: true,
                    data: {
                        acknowledged: true,
                        insertedTransactionId: savedTransaction._id,
                        insertedBoopkingId: savedBooking._id
                    },
                });
            }
            catch (error) {
                console.error("Error creating transaction:", error);
                return res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    message: error.message || "Internal Server Error",
                    success: false,
                    data: null,
                });
            }
        });
    }
    // Membuat Reschedule 
    static AddTransactionToReschedule(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Destructure req.body
                const { title, name, email, phone, grossAmount, otaTotal, reservation, products, night, voucher, checkIn, checkOut, selectOta, roomType, reschedule } = req.body;
                // Melakukan pengecekan apakah room type yang sedang dipilih apakah sudah sedang digunakan
                const dataFilterStatusRoom = yield (0, Filter_1.FilterAvailableWithRoomStatus)(checkIn, checkOut);
                const CekRoomInUse = yield (0, Filter_1.CompareSameDataWithRoomStatus)(roomType, dataFilterStatusRoom);
                // Jika terdapat data yang sudah digunakan kembalikan false
                if (CekRoomInUse.sameRoomTypeOnly.length > 0) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        message: "The room you have selected is currently in use",
                        success: false,
                        data: CekRoomInUse,
                    });
                }
                // console.log(`Ini data payload room dari reservation: ${JSON.stringify(products, null, 2)}`);
                // ✅ Validasi data sebelum disimpan
                if (!title || !name || !email || !phone || !grossAmount || !checkIn || !checkOut || !selectOta) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        message: "All required fields must be provided!",
                        success: false,
                        data: null,
                    });
                }
                // Cek Room pending sebelum membuat reservation transaction 
                const ReservationReadyToBeSaved = yield FilterWithRoomPending_1.ReservationService.createReservation({ products, checkIn, checkOut });
                // Cek Apakah Room Masih dalam tahap Pending semua
                if (ReservationReadyToBeSaved.WithoutPending === 0) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        message: "All Room is Pending",
                        data: `Data Pending : ${ReservationReadyToBeSaved.PendingRoom}`,
                        success: false,
                    });
                }
                console.log(`Ini data reservation after filter : ${JSON.stringify(ReservationReadyToBeSaved.WithoutPending, null, 2)}`);
                // Mix data Product with OTA
                // const ProductClean = await OTAService.Mix_OTA(products,ReservationReadyToBeSaved.WithoutPending)
                // console.log(`Ini data reservation after Mix OTA : ${ProductClean}`);
                // Set Up Data Lain
                const bookingId = 'TRX-' + crypto_1.default.randomBytes(5).toString('hex');
                const status = constant_1.PAYMENT_ADMIN;
                // Daftarkan terlebih dahulu usernya
                const IsHaveAccount = yield (0, Index_1.CekUser)(email);
                let userId;
                if (!IsHaveAccount) {
                    userId = yield (0, Index_1.Register)(title, name, email, phone);
                }
                // ✅ Buat objek baru berdasarkan schema
                const newBooking = new models_booking_1.BookingModel({
                    orderId: bookingId,
                    userId: IsHaveAccount !== null && IsHaveAccount !== void 0 ? IsHaveAccount : userId,
                    status,
                    title,
                    name,
                    email,
                    phone,
                    voucher,
                    amountTotal: grossAmount,
                    otaTotal: otaTotal,
                    reservation,
                    ota: selectOta,
                    room: ReservationReadyToBeSaved.WithoutPending,
                    night,
                    checkIn,
                    checkOut,
                    reschedule
                });
                // ✅ Simpan ke database Booking
                const savedBooking = yield newBooking.save();
                // console.log(" add transaction with reservation : ", savedBooking)
                // ✅ Buat objek baru berdasarkan schema
                const newTransaction = new models_transaksi_1.TransactionModel({
                    booking_keyId: savedBooking._id,
                    bookingId,
                    userId: IsHaveAccount !== null && IsHaveAccount !== void 0 ? IsHaveAccount : userId,
                    status,
                    title,
                    name,
                    email,
                    phone,
                    grossAmount,
                    voucher,
                    otaTotal,
                    reservation,
                    products: ReservationReadyToBeSaved.WithoutPending,
                    night,
                    checkIn,
                    checkOut
                });
                // Data untuk membuat status room
                const data = {
                    id_Trx: bookingId,
                    status: "Use",
                    bookingKey: savedBooking._id,
                    checkIn,
                    checkOut,
                    roomType,
                };
                // Fungsi untuk membuat status room 
                const createRoomStatus = yield Service_1.RoomStatusService.SetRoomStatus(data);
                if (createRoomStatus && createRoomStatus.roomStatusKey) {
                    const roomStatusKey = createRoomStatus.roomStatusKey;
                    const updatedInvoice = yield models_booking_1.BookingModel.findOneAndUpdate({ _id: savedBooking._id, isDeleted: false }, { $push: { roomStatusKey } }, { new: true, runValidators: true });
                    console.log("RoomStatusKey successfully added to booking:", updatedInvoice);
                }
                // // ✅ Simpan ke database Booking
                // const savedBooking = await newBooking.save();
                // ✅ Simpan ke database Transaction
                const savedTransaction = yield newTransaction.save();
                // SetUp Room yang akan masuk dalam Room Pending
                yield Controller_PendingRoom_1.PendingRoomController.SetPending(ReservationReadyToBeSaved.WithoutPending, bookingId, IsHaveAccount !== null && IsHaveAccount !== void 0 ? IsHaveAccount : userId, checkIn, checkOut, "reservation", req, res);
                // Update data booking lama
                yield models_booking_1.BookingModel.findOneAndUpdate({ _id: new ObjectId(reschedule.key_reschedule) }, {
                    $set: {
                        reschedule: reschedule
                    }
                }, { new: true } // Opsional: untuk return data yang sudah di-update
                );
                // Pada saat Reschedule sudah dibuat Set Isdalate True ( Agar Qty room sebelumnya dilepas )
                const deleted = yield (0, RefReschedule_1.FreeRoomAndAvailable)(reschedule.key_reschedule);
                if (deleted) {
                    console.log('✅ Semua FreeRoomAndAvailable berhasil dihapus.');
                }
                else {
                    console.log('🔴  Gagal menghapus beberapa FreeRoomAndAvailable.');
                }
                // ✅ Berikan respon sukses
                return res.status(201).json({
                    requestId: (0, uuid_1.v4)(),
                    message: "Successfully add Reschedule to Reservation.",
                    messageDeletedAll: ` statusnya : ${deleted},  ID Use : ${reschedule.key_reschedule}`,
                    success: true,
                    data: {
                        acknowledged: true,
                        insertedTransactionId: savedTransaction._id,
                        insertedBoopkingId: savedBooking._id
                    },
                });
            }
            catch (error) {
                console.error("Error creating transaction:", error);
                return res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message || "Internal Server Error",
                    requestMessage: 'Error creating Reschedule',
                    success: false,
                });
            }
        });
    }
    static SetPayment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // Destructure req.body
                const { TransactionId, code } = req.params;
                const { invoice, payment } = req.body;
                console.log(" invoice : ", invoice);
                // ✅ Validasi data sebelum disimpan
                if (!TransactionId) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "required TransactionId!",
                        success: false
                    });
                }
                // Lalu pakai:
                let invoiceResult = null;
                if (code === "VLA") {
                    invoiceResult = yield controller_invoice_1.InvoiceController.SetInvoice(invoice);
                    if (!invoiceResult.status) {
                        return res.status(400).json({
                            requestId: (0, uuid_1.v4)(),
                            data: null,
                            message: invoiceResult.message,
                            success: false
                        });
                    }
                }
                const BookingReservation = yield models_transaksi_1.TransactionModel.find({ bookingId: TransactionId, isDeleted: false, reservation: true });
                if (!BookingReservation) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "Transaction no found or Has Paid!",
                        success: false
                    });
                }
                const IsTransaction = yield models_transaksi_1.TransactionModel.findOneAndUpdate({ bookingId: TransactionId, isDeleted: false, status: constant_1.PAYMENT_ADMIN, reservation: true }, {
                    status: constant_1.PAID_ADMIN
                });
                if (!IsTransaction) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "Set Transaction no found !",
                        success: false
                    });
                }
                console.log(`Transaction ${IsTransaction.name} has Pay`);
                yield controller_short_1.ShortAvailableController.addBookedRoomForAvailable({
                    transactionId: TransactionId,
                    userId: IsTransaction.userId,
                    status: constant_1.PAID,
                    checkIn: IsTransaction.checkIn,
                    checkOut: IsTransaction.checkOut,
                    products: IsTransaction.products.map((product) => ({
                        roomId: product.roomId,
                        price: product.price,
                        quantity: product.quantity,
                        name: product.name,
                    })),
                }, res);
                // Perbaharui Room Pending pada saat user sudah melakukan transaction atau pembayaran gagal 
                const messagePendingRoom = yield Controller_PendingRoom_1.PendingRoomController.UpdatePending(TransactionId);
                const id_booking = IsTransaction.booking_keyId;
                const StatusAddPayment = yield (0, AddPayment_1.AddPayment)(payment, id_booking);
                // ✅ Berikan respon sukses
                return res.status(201).json({
                    requestId: (0, uuid_1.v4)(),
                    data: {
                        acknowledged: true
                    },
                    resultInvoice: (_a = invoiceResult === null || invoiceResult === void 0 ? void 0 : invoiceResult.data) !== null && _a !== void 0 ? _a : [],
                    message: `Successfully payment transaction : ${TransactionId}`,
                    messagePayment: `Data : ${JSON.stringify(payment)}, Status : ${StatusAddPayment}`,
                    messagePendingRoom: messagePendingRoom,
                    success: true
                });
            }
            catch (error) {
                console.error("Error creating transaction:", error);
                return res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message || "Internal Server Error",
                    success: false
                });
            }
        });
    }
}
exports.ReservationController = ReservationController;
