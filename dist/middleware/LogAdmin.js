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
exports.logActivity = void 0;
const models_LogActivity_1 = require("../models/LogActivity/models_LogActivity");
const models_admin_1 = __importDefault(require("../models/Admin/models_admin"));
const models_user_1 = __importDefault(require("../models/User/models_user"));
const models_booking_1 = require("../models/Booking/models_booking");
const mongoose_1 = __importDefault(require("mongoose"));
const CekUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const _id = new mongoose_1.default.Types.ObjectId(id);
    let user = yield models_user_1.default.findOne({ _id, isDeleted: false }).select("title name email phone");
    // console.log("Update Data user di LOG :", user );
    return user;
});
const CekBooking = (id) => __awaiter(void 0, void 0, void 0, function* () {
    let booking = yield models_booking_1.BookingModel.findOne({ orderId: id, isDeleted: false })
        .select("name email roomStatusKey phone orderId checkIn checkOut verified reservation night amountTotal otaTotal room createdAt")
        .populate("roomStatusKey", "number name code nameVilla -_id");
    // console.log("Update Data user di LOG :", booking );
    return booking;
});
const logActivity = (action) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            let user = yield CekUser(req.params.id || req.params.MessageId || req.params.UserId);
            let booking = yield CekBooking(req.params.TransactionId || req.query.id || req.body.id_TRX || req.params.IdBooking || req.params.id_transaction);
            let adminId = req.body.adminId || req.session.userId;
            const ipAddress = req.ip || req.socket.remoteAddress;
            const routePath = req.originalUrl; // Dapatkan route yang diakses
            let type = ""; // Target data yang akan dicatat di log
            let target = ""; // Target data yang akan dicatat di log
            let statement1 = ""; // Target data yang akan dicatat di log
            let statement2 = ""; // Target data yang akan dicatat di log
            let data = "";
            let changedPrices = null; // ⬅️ Inisialisasi awal
            let date = [];
            // Handle jika admin ID tidak ditemukan, coba cari dari username
            if (!adminId && req.body.username) {
                const adminData = yield models_admin_1.default.findOne({ username: req.body.username });
                if (adminData) {
                    adminId = adminData._id;
                }
                else {
                    return next(); // Skip logging jika admin tidak ditemukan
                }
            }
            if (!adminId)
                return next();
            // Ambil data admin
            const DataAdmin = yield models_admin_1.default.findOne({ _id: new mongoose_1.default.Types.ObjectId(adminId) });
            if (!DataAdmin) {
                console.log("Data admin tidak ditemukan");
                return next();
            }
            // 🔹 **LOGIKA BERDASARKAN ROUTE**
            switch (true) {
                case routePath.startsWith("/api/v1/site/minder/set-minder"):
                    type = "Management";
                    target = req.body.roomId || "-";
                    changedPrices = req.body.changedPrices || {};
                    break;
                case routePath.startsWith("/api/v1/site/minder/set-price-custom"):
                    type = "Management";
                    target = req.body.roomId || "-";
                    statement1 = req.body.price || "-";
                    date = req.body.dates || [];
                    break;
                case routePath.startsWith("/api/v1/auth"):
                    type = "Auth";
                    target = req.body.email || "-";
                    break;
                case routePath.startsWith("/api/v1/admin/customer/deleted-message"):
                    type = "Customer";
                    target = user ? (`ID  : ${user._id} ,  Name : ${user.name}`) : "-";
                    break;
                case routePath.startsWith("/api/v1/admin/customer/deleted"):
                    type = "Customer";
                    target = user ? (`ID  : ${user._id} ,  Name : ${user.name}`) : "-";
                    data = `${user}`;
                    break;
                case routePath.startsWith("/api/v1/admin/customer/set-block"):
                    type = "Customer";
                    target = user ? (`ID  : ${user._id} ,  Name : ${user.name}`) : "-";
                    data = `${user}`;
                    break;
                case routePath.startsWith("/api/v1/admin/customer/set-active"):
                    type = "Customer";
                    target = user ? (`ID  : ${user._id} ,  Name : ${user.name}`) : "-";
                    data = `${user}`;
                    break;
                case routePath.startsWith("/api/v1/admin/customer/update"):
                    type = "Customer";
                    target = user ? (`ID  : ${user._id} ,  Name : ${user.name}`) : "-";
                    const body = req.body;
                    // Ambil hanya properti yang bukan indeks angka
                    const filteredData = Object.keys(body)
                        .filter(key => Number.isNaN(Number(key)))
                        .reduce((acc, key) => (Object.assign(Object.assign({}, acc), { [key]: body[key] })), {}); // Simpan properti lainnya
                    statement1 = `New Data : ${JSON.stringify(filteredData, null, 2)}`;
                    statement2 = `Old Data : ${user}`;
                    break;
                // Booking 
                case routePath.startsWith("/api/v1/admin/booking/set-verified"):
                    type = "Booking";
                    target = booking ? (`ID  : ${booking.orderId} ,  Name : ${booking.name}`) : "-";
                    break;
                case routePath.startsWith("/api/v1/admin/booking/set-checkout"):
                    type = "Booking";
                    // const user = await CekUser(req.params.TransactionId);
                    target = booking ? (`ID : ${booking.orderId} ,  Name : ${booking.name}`) : "-";
                    break;
                case routePath.startsWith("/api/v1/booking/change-room"):
                    type = "Booking";
                    // const user = await CekUser(req.params.TransactionId);
                    target = booking ? (`ID : ${booking.orderId} ,  Name : ${booking.name}`) : "-";
                    statement1 = booking
                        ? `data_old : ${booking.roomStatusKey
                            ? JSON.stringify(booking.roomStatusKey, null, 2)
                            : "No old data"}`
                        : "";
                    data = JSON.stringify({
                        "data request": req.body
                    }, null, 2);
                    console.log('lupakan dada 🟢');
                    break;
                // Membuat Reservation
                case routePath.startsWith("/api/v1/reservation/add-reservation"):
                    type = "Reservation";
                    target = req.body.name || [],
                        date = [`ChekIn : ${req.body.checkIn},  CheckOut : ${req.body.checkOut}`],
                        data = `${JSON.stringify(req.body, null, 2)} ` || '-';
                    break;
                case routePath.startsWith("/api/v1/reservation/pay-transaction"):
                    type = "Reservation";
                    target = booking ? (`ID : ${booking.orderId} ,  Name : ${booking.name}`) : "-";
                    data = `${booking}`;
                    break;
                case routePath.startsWith("/api/v1/reservation/create-schedule"):
                    type = "Reservation";
                    target = req.body.name || [];
                    const oldSchedule = (_b = (_a = req.body) === null || _a === void 0 ? void 0 : _a.reschedule) === null || _b === void 0 ? void 0 : _b.schedule_old;
                    statement1 = `Schedule_old : ${oldSchedule ? JSON.stringify(oldSchedule, null, 2) : 'No old schedule'}`;
                    statement2 = "Add Reschedule";
                    data = `Schedule_new : ${JSON.stringify(req.body, null, 2)} `;
                    break;
                case routePath.startsWith("/api/v1/site/minder/del-transaction"):
                    type = "Management";
                    target = booking ? (`ID : ${booking.orderId} ,  Name : ${booking.name}`) : "-";
                    data = `${booking}`;
                    break;
                case routePath.startsWith("/api/v1/site/minder/del-booking"):
                    type = "Management";
                    target = booking ? (`ID : ${booking.orderId} ,  Name : ${booking.name}`) : "-";
                    data = `${booking}`;
                    break;
                case routePath.startsWith("/api/v1/site/minder/del-reschedule"):
                    type = "Management";
                    target = booking ? (`ID : ${booking.orderId} ,  Name : ${booking.name}`) : "-";
                    statement1 = "Reschedule in cancel";
                    data = `Data reschedule : ${booking}`;
                    break;
                case routePath.startsWith("/api/v1/admin/report/add-report"):
                    type = "Report";
                    target = `Date : ${req.params.date} `;
                    data = `Room Status : ${JSON.stringify(req.body, null, 2)} ` || '-';
                    break;
                case routePath.startsWith("/api/v1/site/minder/edit-date-transaction"):
                    type = "Transaction";
                    target = booking ? (`ID : ${booking.orderId} ,  Name : ${booking.name}`) : "-";
                    statement1 = `New Date : ${JSON.stringify(req.body.Edit_Date, null, 2)}`;
                    statement2 = `Old Date :  In [ ${booking === null || booking === void 0 ? void 0 : booking.checkIn} ] -  Out [ ${booking === null || booking === void 0 ? void 0 : booking.checkOut} ]`;
                    break;
                default:
                    target = req.params.id || req.body.name || "Tidak ada Target Data";
                    break;
            }
            // Simpan ke database
            yield models_LogActivity_1.ActivityLogModel.create({
                adminId,
                type,
                username: DataAdmin.username,
                role: DataAdmin.role,
                statement1,
                statement2,
                changedPrices,
                date,
                data,
                action,
                target,
                ipAddress,
                routePath, // Tambahkan jalur yang diakses
            });
            // console.log("Log Activity:", {
            //   adminId,
            //   type,
            //   username: DataAdmin.username,
            //   role: DataAdmin.role,
            //   action,
            //   statement1,
            //   statement2,
            //   date,
            //   data,
            //   target,
            //   ipAddress,
            //   routePath,
            // });
            next();
        }
        catch (error) {
            console.error("Error logging activity:", error);
            next(error);
        }
    });
};
exports.logActivity = logActivity;
// import { Request, Response, NextFunction } from "express";
// import { ActivityLogModel } from "../models/LogActivity/models_LogActivity";
// import AdminModel from "../models/Admin/models_admin";
// export const logActivity = (action: string) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       let adminId = req.body.adminId || req.session.userId ; // Ambil ID admin dari body atau token JWT
//       const target = req.params.id || req.body.name || req.params.TransactionId || req.params.MessageId || ""; // Target data yang diubah (opsional)
//       const ipAddress = req.ip || req.socket.remoteAddress;
//       let DataElse = req.body.username 
//       if (DataElse && !adminId) {
//           adminId = await AdminModel.findOne(
//               { username: DataElse }
//             );
//             return next(); // Jika tidak ada admin ID, lewati logging
//         }
//         if (!adminId) {
//             return next(); // Jika tidak ada admin ID, lewati logging
//         }
//         const DataAdmin = await AdminModel.findOne({ _id:adminId })
//       if (!DataAdmin) {
//           console.log("data admin tidak ditemukan")
//             return next(); // Jika tidak ada admin ID, lewati logging
//       }
//       await ActivityLogModel.create({
//         adminId,
//         username : DataAdmin.username,
//         role : DataAdmin.role,
//         action,
//         target,
//         ipAddress,
//       });
//       console.log("Data admin : ", DataAdmin)
//       next();
//     } catch (error) {
//       console.error("Error logging activity:", error);
//       next(error);
//     }
//   };
// };
