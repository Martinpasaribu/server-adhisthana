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
const uuid_1 = require("uuid");
// Gunakan dynamic import
const crypto_1 = __importDefault(require("crypto"));
const midtransConfig_1 = require("../../config/midtransConfig");
const constant_1 = require("../../constant");
const FilterAvailableRoom_1 = require("../ShortAvailable/FilterAvailableRoom");
const SiteMinderFilter_1 = require("./SiteMinderFilter");
const SetPriceDayList_1 = require("../ShortAvailable/SetPriceDayList");
const SetResponseShort_1 = require("../ShortAvailable/SetResponseShort");
const Controller_PendingRoom_1 = require("../PendingRoom/Controller_PendingRoom");
const SetAvailableCounts_1 = require("./SetAvailableCounts");
const TransactionService_1 = require("../Transaction/TransactionService");
class BookingController {
    static addBooking(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const UserId = req.userId;
            const BookingReq = req.body;
            try {
                const RoomCanUse = yield (0, FilterAvailableRoom_1.FilterAvailable02)(BookingReq.checkIn, BookingReq.checkOut);
                // Ambil hanya data room yang sesuai dari RoomCanUse berdasarkan roomId di BookingReq
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
                // Filter Room dari req Booking dari ketersedia room dan menambahkan poerpty stock ketersedian room dengan range tanggal tersebut
                const RoomsAvailableCount = yield (0, SetAvailableCounts_1.SetAvailableCount)(BookingReq.room, BookingReq.checkIn, BookingReq.checkOut);
                // Filter Is there a pending room?
                const availableRoomsWithoutPending = yield Controller_PendingRoom_1.PendingRoomController.FilterForUpdateVilaWithPending(RoomsAvailableCount, BookingReq.checkIn, BookingReq.checkOut);
                if ((availableRoomsWithoutPending === null || availableRoomsWithoutPending === void 0 ? void 0 : availableRoomsWithoutPending.PendingRoom.length) > 0) {
                    return res.status(400).json({ status: 'error', message: `Some of the rooms you select have already been purchased`, data: availableRoomsWithoutPending === null || availableRoomsWithoutPending === void 0 ? void 0 : availableRoomsWithoutPending.PendingRoom });
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
                // SetUp Room yang akan masuk dalam Room Pending
                yield Controller_PendingRoom_1.PendingRoomController.SetPending(BookingReq.room, bookingId, UserId, BookingReq.checkIn, BookingReq.checkOut, "website", req, res);
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
                        // {
                        //   id: 'TAX-12%',
                        //   price: updateRoomsAvailable.reduce((total: number, room: any) => {
                        //     const roomBooking = BookingReq.room.find((r: { roomId: any }) => r.roomId.toString() === room._id.toString());
                        //     const quantity = roomBooking?.quantity || 1; // Ambil quantity dari pesanan
                        //     return total + (room.priceDateList * quantity * 0.12); // Hitung pajak berdasarkan quantity
                        //   }, 0),
                        //   quantity: 1,
                        //   name: 'Tax (12%)',
                        // },
                    ]
                };
                // console.log('hasil midtransPayload : ', midtransPayload);
                // console.log('hasil payload BookingReq : ', BookingReq);
                const midtransResponse = yield midtransConfig_1.snap.createTransaction(midtransPayload);
                // Save booking (transaction) to your database
                const booking_id = yield TransactionService_1.transactionService.createBooking({
                    name: BookingReq.name,
                    email: BookingReq.email,
                    phone: BookingReq.phone,
                    orderId: bookingId,
                    checkIn: BookingReq.checkIn,
                    checkOut: BookingReq.checkOut,
                    adult: BookingReq.adult,
                    children: BookingReq.children,
                    amountTotal: grossAmount,
                    amountBefDisc: BookingReq.amountBefDisc || grossAmount, // Assuming discount might apply
                    couponId: BookingReq.couponId || null, // Optional coupon ID
                    userId: UserId !== null && UserId !== void 0 ? UserId : BookingReq.email,
                    creatorId: (0, uuid_1.v4)(), // Replace with actual creator ID if available
                    rooms: roomDetails.map(room => {
                        const roomBooking = BookingReq.room.find((r) => r.roomId.toString() === room._id.toString());
                        return {
                            roomId: room._id,
                            quantity: roomBooking.quantity,
                            price: roomBooking === null || roomBooking === void 0 ? void 0 : roomBooking.price,
                            image: roomBooking === null || roomBooking === void 0 ? void 0 : roomBooking.imageShort,
                        };
                    }),
                });
                const transaction = yield TransactionService_1.transactionService.createTransaction({
                    bookingId,
                    booking_keyId: booking_id,
                    name: BookingReq.name,
                    email: BookingReq.email,
                    phone: BookingReq.phone,
                    status: constant_1.PENDING_PAYMENT,
                    checkIn: BookingReq.checkIn, // Tambahkan properti ini jika dibutuhkan
                    checkOut: BookingReq.checkOut, // Tambahkan properti ini jika dibutuhkan
                    grossAmount,
                    userId: UserId !== null && UserId !== void 0 ? UserId : BookingReq.email,
                    products: roomDetails.map(room => {
                        const roomBooking = BookingReq.room.find((r) => r.roomId.toString() === room._id.toString());
                        return {
                            roomId: room._id,
                            name: room.name,
                            image: room.imageShort,
                            quantity: roomBooking === null || roomBooking === void 0 ? void 0 : roomBooking.quantity, // Optional chaining jika roomBooking tidak ditemukan
                            price: roomBooking === null || roomBooking === void 0 ? void 0 : roomBooking.price, // Menambahkan price dari room
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
                res.status(201).json({
                    status: 'success',
                    data: {
                        message: ' successfully Booking',
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
}
exports.BookingController = BookingController;
