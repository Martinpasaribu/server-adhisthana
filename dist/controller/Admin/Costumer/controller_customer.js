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
exports.AdminCustomerController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const models_booking_1 = require("../../../models/Booking/models_booking");
const models_contact_1 = require("../../../models/Contact/models_contact");
const models_user_1 = __importDefault(require("../../../models/User/models_user"));
const models_transaksi_1 = require("../../../models/Transaction/models_transaksi");
class AdminCustomerController {
    static GetUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const filterQuery = {
                    isDeleted: false,
                };
                // Query untuk TransactionModel (ambil semua data)
                const User = yield models_user_1.default.find(filterQuery);
                // console.log('data availble transactions :', transactions);
                // Kirim hasil response
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: User,
                    success: true
                });
            }
            catch (error) {
                res.status(500).json({ message: "Failed to fetch User", error });
            }
        });
    }
    static GetMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const filterQuery = {
                    isDeleted: false,
                };
                // Query untuk TransactionModel (ambil semua data)
                const Message = yield models_contact_1.ContactModel.find(filterQuery);
                // console.log('data availble transactions :', transactions);
                // Kirim hasil response
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: Message,
                    success: true
                });
            }
            catch (error) {
                res.status(500).json({ message: "Failed to fetch Message", error });
            }
        });
    }
    static SetVerified(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { TransactionId } = req.params;
                // ✅ Validasi jika TransactionId tidak ada
                if (!TransactionId) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "TransactionId is required!",
                        success: false
                    });
                }
                // ✅ Cari booking berdasarkan TransactionId
                const BookingReservation = yield models_booking_1.BookingModel.findOne({
                    orderId: TransactionId,
                    isDeleted: false
                });
                if (!BookingReservation) {
                    return res.status(404).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "Booking not found!",
                        success: false
                    });
                }
                // ✅ Update status verified
                const updatedBooking = yield models_booking_1.BookingModel.findOneAndUpdate({ orderId: TransactionId, isDeleted: false }, {
                    verified: { status: true, timeIn: Date.now() }
                }, { new: true } // Mengembalikan data yang sudah diperbarui
                );
                if (!updatedBooking) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "Failed to update booking verification status!",
                        success: false
                    });
                }
                console.log(`Booking ${updatedBooking.name} has been verified`);
                return res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: { acknowledged: true },
                    message: `Successfully verified Booking Not : ${TransactionId}`,
                    success: true
                });
            }
            catch (error) {
                console.error("Error verifying Booking:", error);
                return res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message || "Internal Server Error",
                    success: false
                });
            }
        });
    }
    static DeletedMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { MessageId } = req.params;
                // ✅ Validasi jika MessageId tidak ada
                if (!MessageId) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "MessageId is required!",
                        success: false
                    });
                }
                // ✅ Cari booking berdasarkan MessageId
                const MessageData = yield models_contact_1.ContactModel.findOneAndUpdate({ _id: MessageId, isDeleted: false }, { isDeleted: true }, { new: true } // Mengembalikan data yang diperbarui
                );
                if (!MessageData) {
                    return res.status(404).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "MessageData not found!",
                        success: false
                    });
                }
                console.log(`MessageData ${MessageData} has been get`);
                return res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: { acknowledged: true },
                    message: `Successfully get MessageData: ${MessageId}`,
                    success: true
                });
            }
            catch (error) {
                console.error("Error get MessageData:", error);
                return res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message || "Internal Server Error",
                    success: false
                });
            }
        });
    }
    static UpdateCustomer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const updateData = req.body;
            try {
                // Pastikan data yang dikirim tidak kosong
                if (Object.keys(updateData).length === 0) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        success: false,
                        message: "No data provided for update",
                    });
                }
                // Eksekusi semua update secara paralel
                const [updateCustomer, updateCustomerVBooking, updateCustomerTransaction] = yield Promise.all([
                    models_user_1.default.findOneAndUpdate({ _id: new mongoose_1.default.Types.ObjectId(id) }, { $set: updateData }, { new: true, runValidators: true }),
                    models_booking_1.BookingModel.findOneAndUpdate({ userId: new mongoose_1.default.Types.ObjectId(id) }, { $set: updateData }, { new: true, runValidators: true }),
                    models_transaksi_1.TransactionModel.findOneAndUpdate({ userId: new mongoose_1.default.Types.ObjectId(id) }, { $set: updateData }, { new: true, runValidators: true })
                ]);
                // Jika semua gagal
                if (!updateCustomer && !updateCustomerVBooking && !updateCustomerTransaction) {
                    return res.status(404).json({
                        requestId: (0, uuid_1.v4)(),
                        success: false,
                        message: "Customer not found in all collections",
                    });
                }
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    success: true,
                    message: "Successfully updated Customer data",
                    data: updateCustomer,
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
    static GetCustomerByParams(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let data;
            const { id } = req.params;
            try {
                new mongoose_1.default.Types.ObjectId(id),
                    data = yield models_user_1.default.find({ _id: id, isDeleted: false });
                res.status(201).json({
                    requestId: (0, uuid_1.v4)(),
                    data: data,
                    message: "Successfully Fetch Data Customer by Params.",
                    success: true
                });
            }
            catch (error) {
                res.status(400).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message,
                    RoomId: `Customer id : ${id}`,
                    success: false
                });
            }
        });
    }
    static DeletedUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { UserId } = req.params;
                // ✅ Validasi jika MessageId tidak ada
                if (!UserId) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "UserId is required!",
                        success: false
                    });
                }
                // ✅ Cari booking berdasarkan MessageId
                const UserData = yield models_user_1.default.findOneAndUpdate({ _id: new mongoose_1.default.Types.ObjectId(UserId), isDeleted: false }, { isDeleted: true }, { new: true } // Mengembalikan data yang diperbarui
                );
                if (!UserData) {
                    return res.status(404).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "User Data not found!",
                        success: false
                    });
                }
                return res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: { acknowledged: true },
                    message: `Successfully deleted User: ${UserData.name}`,
                    success: true
                });
            }
            catch (error) {
                console.error("Error deleted User Data:", error);
                return res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message || "Internal Server Error",
                    success: false
                });
            }
        });
    }
    static SetBlock(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                // ✅ Validasi jika TransactionId tidak ada
                if (!id) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "ID is required!",
                        success: false
                    });
                }
                // ✅ Cari booking berdasarkan TransactionId
                const User = yield models_user_1.default.findOne({
                    _id: new mongoose_1.default.Types.ObjectId(id),
                    isDeleted: false
                });
                if (!User) {
                    return res.status(404).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "User not found!",
                        success: false
                    });
                }
                // ✅ Update status verified
                const blockUser = yield models_user_1.default.findOneAndUpdate({ _id: new mongoose_1.default.Types.ObjectId(id), isDeleted: false }, {
                    block: true
                }, { new: true } // Mengembalikan data yang sudah diperbarui
                );
                if (!blockUser) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: `Failed to block account ${User === null || User === void 0 ? void 0 : User.name}`,
                        success: false
                    });
                }
                console.log(`Block account ${User === null || User === void 0 ? void 0 : User.name}`);
                return res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: { acknowledged: true },
                    message: `Successfully block account ${User === null || User === void 0 ? void 0 : User.name}`,
                    success: true
                });
            }
            catch (error) {
                console.error("Error block User:", error);
                return res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message || "Internal Server Error",
                    success: false
                });
            }
        });
    }
    static SetActive(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                // ✅ Validasi jika TransactionId tidak ada
                if (!id) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "ID is required!",
                        success: false
                    });
                }
                // ✅ Cari booking berdasarkan TransactionId
                const User = yield models_user_1.default.findOne({
                    _id: new mongoose_1.default.Types.ObjectId(id),
                    isDeleted: false
                });
                if (!User) {
                    return res.status(404).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "User not found!",
                        success: false
                    });
                }
                // ✅ Update status verified
                const blockUser = yield models_user_1.default.findOneAndUpdate({ _id: new mongoose_1.default.Types.ObjectId(id), isDeleted: false }, {
                    block: false
                }, { new: true } // Mengembalikan data yang sudah diperbarui
                );
                if (!blockUser) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: `Failed to active account ${User === null || User === void 0 ? void 0 : User.name}!`,
                        success: false
                    });
                }
                console.log(`Booking ${blockUser.name} has been verified`);
                return res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: { acknowledged: true },
                    message: `Successfully active account ${User === null || User === void 0 ? void 0 : User.name}`,
                    success: true
                });
            }
            catch (error) {
                console.error("Error active account:", error);
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
exports.AdminCustomerController = AdminCustomerController;
