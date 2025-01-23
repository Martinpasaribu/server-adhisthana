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
exports.BookingController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
// Gunakan dynamic import
const crypto_1 = __importDefault(require("crypto"));
const models_room_1 = __importDefault(require("../../models/Room/models_room"));
const models_booking_1 = require("../../models/Booking/models_booking");
const midtransConfig_1 = require("../../config/midtransConfig");
const transactionService_1 = require("./transactionService");
const constant_1 = require("../../utils/constant");
const models_transaksi_1 = require("../../models/Transaction/models_transaksi");
const Update_Status_1 = require("./Update_Status");
const FilterAvaliableRoom_1 = require("../ShortAvailable/FilterAvaliableRoom");
const SiteMinderFilter_1 = require("./SiteMinderFilter");
const SetPriceDayList_1 = require("../ShortAvailable/SetPriceDayList");
const SetResponseShort_1 = require("../ShortAvailable/SetResponseShort");
class BookingController {
    static addBooking(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const BookingReq = req.body;
            try {
                const RoomCanUse = yield (0, FilterAvaliableRoom_1.FilterAvailable)(BookingReq.checkIn, BookingReq.checkOut);
                // Ambil hanya data ruangan yang sesuai dari RoomCanUse berdasarkan roomId di BookingReq
                const roomDetails = RoomCanUse.filter((room) => BookingReq.room.some((r) => r.roomId.toString() === room._id.toString()));
                if (!roomDetails) {
                    return res.status(400).json({ status: 'error', message: `Filter Room Available not found` });
                }
                // Validate again room availability
                for (const roomBooking of BookingReq.room) {
                    const room = roomDetails.find(r => r._id.toString() === roomBooking.roomId.toString());
                    if (!room) {
                        return res.status(400).json({ status: 'error', message: `Room with ID ${roomBooking.roomId} not found` });
                    }
                    // Check if the room is sold out or requested quantity exceeds availability
                    if (room.available <= 0) {
                        return res.status(400).json({ status: 'error', message: `Room with ID ${roomBooking.roomId} is sold out` });
                    }
                    if (roomBooking.quantity > room.available) {
                        return res.status(400).json({
                            status: 'error',
                            message: `Room with ID ${roomBooking.roomId} has only ${room.available} available, but you requested ${roomBooking.quantity}`
                        });
                    }
                }
                const night = Number(BookingReq.night);
                const Day = {
                    In: BookingReq.checkIn,
                    Out: BookingReq.checkOut
                };
                const grossAmount = Number(BookingReq.grossAmount);
                const bookingId = 'TRX-' + crypto_1.default.randomBytes(5).toString('hex');
                // Ambil data harga di siteMinder berdasarkan waktu In dan Out
                const FilterSiteMinders = yield (0, SiteMinderFilter_1.FilterSiteMinder)(BookingReq.checkIn, BookingReq.checkOut);
                // Filter Room dengan harga yang sudah singkron dengan siteMinder
                const setPriceDayList = yield (0, SetPriceDayList_1.SetPriceDayList)(roomDetails, FilterSiteMinders, Day);
                // Filter untuk singkron price per Item dengan lama malam -nya menjadi priceDateList
                const updateRoomsAvailable = yield (0, SetResponseShort_1.SetResponseShort)(roomDetails, setPriceDayList);
                // const item_details = updateRoomsAvailable.map((room : any)=> {
                //     const roomBooking = BookingReq.room.find((r: { roomId: any }) => r.roomId.toString() === room._id.toString());
                //     return {
                //         id: room._id,
                //         price: room.priceDateList + ( room.priceDateList * 0.12),
                //         quantity: roomBooking.quantity ,
                //         name: room.name,
                //     };
                //  })
                //  console.log("Hasil item_details :", item_details);
                //  const item_details = [
                //         ...updateRoomsAvailable.map((room: any) => {
                //             const roomBooking = BookingReq.room.find((r: { roomId: any }) => r.roomId.toString() === room._id.toString());
                //             const tax = room.priceDateList * 0.12; // Hitung pajak 12%
                //             return {
                //                 id: room._id,
                //                 price: room.priceDateList + tax,
                //                 quantity: roomBooking.quantity,
                //                 name: room.name,
                //             };
                //         }),
                //         // Tambahkan rincian pajak sebagai item tambahan
                //         {
                //             id: 'TAX-12%',
                //             price: updateRoomsAvailable.reduce((total: number, room: any) => total + (room.priceDateList * 0.12), 0), // Total pajak untuk semua item
                //             quantity: 1,
                //             name: 'Tax (12%)',
                //         },
                //     ]
                //     console.log("Hasil updateRoomsAvailable :", updateRoomsAvailable); 
                //     console.log("Hasil item_details :", item_details); 
                // Create transaction in Midtrans
                const midtransPayload = {
                    transaction_details: {
                        order_id: bookingId,
                        gross_amount: grossAmount, // Pastikan nilai ini sudah mencakup pajak dan harga total
                    },
                    customer_details: {
                        first_name: BookingReq.name,
                        email: BookingReq.email,
                    },
                    item_details: [
                        ...updateRoomsAvailable.map((room) => {
                            const roomBooking = BookingReq.room.find((r) => r.roomId.toString() === room._id.toString());
                            return {
                                id: room._id,
                                price: room.priceDateList,
                                quantity: (roomBooking === null || roomBooking === void 0 ? void 0 : roomBooking.quantity) || 1, // Tambahkan quantity sesuai pesanan
                                name: room.name,
                            };
                        }),
                        // Tambahkan rincian pajak sebagai item tambahan
                        {
                            id: 'TAX-12%',
                            price: updateRoomsAvailable.reduce((total, room) => {
                                const roomBooking = BookingReq.room.find((r) => r.roomId.toString() === room._id.toString());
                                const quantity = (roomBooking === null || roomBooking === void 0 ? void 0 : roomBooking.quantity) || 1; // Ambil quantity dari pesanan
                                return total + (room.priceDateList * quantity * 0.12); // Hitung pajak berdasarkan quantity
                            }, 0),
                            quantity: 1,
                            name: 'Tax (12%)',
                        },
                    ]
                };
                console.log('hasil midtransPayload : ', midtransPayload);
                // console.log('hasil server : ', grossAmount02 + tax)
                // console.log('hasil server2 : ', grossAmount03)
                const midtransResponse = yield midtransConfig_1.snap.createTransaction(midtransPayload);
                const transaction = yield transactionService_1.transactionService.createTransaction({
                    bookingId,
                    name: BookingReq.name,
                    email: BookingReq.email,
                    status: constant_1.PENDING_PAYMENT,
                    checkIn: BookingReq.checkIn, // Tambahkan properti ini jika dibutuhkan
                    checkOut: BookingReq.checkOut, // Tambahkan properti ini jika dibutuhkan
                    grossAmount,
                    userId: (0, uuid_1.v4)(),
                    products: roomDetails.map(room => {
                        const roomBooking = BookingReq.room.find((r) => r.roomId.toString() === room._id.toString());
                        return {
                            roomId: room._id,
                            name: room.name,
                            quantity: roomBooking === null || roomBooking === void 0 ? void 0 : roomBooking.quantity, // Optional chaining jika roomBooking tidak ditemukan
                            price: room.price, // Menambahkan price dari room
                        };
                    }),
                    // snap_token: midtransResponse.token,
                    snap_token: '/',
                    paymentUrl: midtransResponse.redirect_url,
                    payment_type: midtransResponse.payment_type,
                    va_numbers: midtransResponse.va_numbers,
                    bank: midtransResponse.bank,
                    card_type: midtransResponse.card_type,
                });
                // Save booking (transaction) to your database
                const bookingData = {
                    name: BookingReq.name,
                    email: BookingReq.email,
                    orderId: bookingId,
                    checkIn: BookingReq.checkIn,
                    checkOut: BookingReq.checkOut,
                    adult: BookingReq.adult,
                    children: BookingReq.children,
                    amountTotal: grossAmount,
                    amountBefDisc: BookingReq.amountBefDisc || grossAmount, // Assuming discount might apply
                    couponId: BookingReq.couponId || null, // Optional coupon ID
                    userId: (0, uuid_1.v4)(), // Replace with the actual user ID if available
                    creatorId: (0, uuid_1.v4)(), // Replace with actual creator ID if available
                    rooms: roomDetails.map(room => {
                        const roomBooking = BookingReq.room.find((r) => r.roomId.toString() === room._id.toString());
                        return {
                            roomId: room._id,
                            quantity: roomBooking.quantity,
                        };
                    }),
                };
                const booking = yield transactionService_1.transactionService.createBooking(bookingData);
                res.status(201).json({
                    status: 'success',
                    data: {
                        message: ' successfully On Checkout',
                        id: bookingId,
                        transaction,
                        paymentUrl: midtransResponse.redirect_url,
                        snap_token: midtransResponse.token
                    }
                });
                console.log("Successfully Add Booking ");
            }
            catch (error) {
                res.status(400).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message,
                    success: false
                });
                console.log(" Error Booking ");
            }
        });
    }
    static getOffers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { checkin, checkout } = req.query;
            try {
                // Validasi dan konversi parameter checkin dan checkout
                if (!checkin || !checkout) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "Check-in and check-out dates are required.",
                        success: false,
                    });
                }
                // Query ke MongoDB
                const data = yield models_booking_1.BookingModel.find({
                    isDeleted: false,
                    checkIn: checkin,
                    checkOut: checkout,
                });
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: data,
                    message: `Successfully get vila.`,
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
    static getRoomByParams(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let data;
            const { id } = req.params;
            try {
                new mongoose_1.default.Types.ObjectId(id),
                    data = yield models_room_1.default.find({ _id: id, isDeleted: false });
                res.status(201).json({
                    requestId: (0, uuid_1.v4)(),
                    data: data,
                    message: "Successfully Fetch Data Room by Params.",
                    success: true
                });
            }
            catch (error) {
                res.status(400).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message,
                    RoomId: `Room id : ${id}`,
                    success: false
                });
            }
        });
    }
    static deletedRoomPermanent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const deletedRoom = yield models_room_1.default.findOneAndDelete({ _id: id });
                res.status(201).json({
                    requestId: (0, uuid_1.v4)(),
                    data: deletedRoom,
                    message: "Successfully DeletedPermanent Data Room as Cascade .",
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
    static updatePacketAll(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const updateData = req.body;
            try {
                const updatedPacket = yield models_room_1.default.findOneAndUpdate({ _id: id }, updateData, { new: true, runValidators: true });
                if (!updatedPacket) {
                    return res.status(404).json({
                        requestId: (0, uuid_1.v4)(),
                        success: false,
                        message: "Packet not found",
                    });
                }
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    success: true,
                    message: "Successfully updated Packet data",
                    data: updatedPacket
                });
            }
            catch (error) {
                res.status(400).json({
                    requestId: (0, uuid_1.v4)(),
                    success: false,
                    message: error.message,
                });
            }
        });
    }
    ;
    static updateRoomPart(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const updateData = req.body;
            // if (updateData._id) {
            //     delete updateData._id;
            // }
            try {
                const updatedRoom = yield models_room_1.default.findOneAndUpdate(
                // new mongoose.Types.ObjectId(id),        
                { _id: id }, updateData, { new: true, runValidators: true });
                if (!updatedRoom) {
                    return res.status(404).json({
                        requestId: (0, uuid_1.v4)(),
                        success: false,
                        message: "Room not found",
                    });
                }
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    success: true,
                    message: "Successfully updated Room data",
                    data: updatedRoom
                });
            }
            catch (error) {
                res.status(400).json({
                    requestId: (0, uuid_1.v4)(),
                    success: false,
                    message: error.message,
                });
            }
        });
    }
    ;
    static TrxNotif(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = req.body;
                // console.log("Data from midtrans:", data);
                // Menghilangkan prefiks "order-" dari transaction_id
                const formattedTransactionId = data.order_id.replace(/^order-/, "");
                // console.log("Formatted Transaction ID:", formattedTransactionId);
                // Menunggu hasil findOne dengan bookingId yang sudah diformat
                const existingTransaction = yield models_transaksi_1.TransactionModel.findOne({ bookingId: formattedTransactionId });
                let resultUpdate;
                if (existingTransaction) {
                    // Properti bookingId sekarang tersedia
                    const result = yield (0, Update_Status_1.updateStatusBaseOnMidtransResponse)(data.order_id, data, res);
                    console.log('result = ', result);
                    resultUpdate = result;
                }
                else {
                    console.log('Transaction not found in server, Data =', data);
                }
                res.status(200).json({
                    status: 'success',
                    message: "OK",
                    data: resultUpdate
                });
            }
            catch (error) {
                console.error('Error handling transaction notification:', error);
                res.status(500).json({
                    error: 'Internal Server Error'
                });
            }
        });
    }
}
exports.BookingController = BookingController;
