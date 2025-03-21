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
const CekUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    let user = yield models_user_1.default.findOne({ _id: id, isDeleted: false }).select("title name email phone");
    console.log("Update Data user di LOG :", user);
    return user;
});
const CekBooking = (id) => __awaiter(void 0, void 0, void 0, function* () {
    let booking = yield models_booking_1.BookingModel.findOne({ orderId: id, isDeleted: false }).select("name email phone orderId");
    console.log("Update Data user di LOG :", booking);
    return booking;
});
const logActivity = (action) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let user = yield CekUser(req.params.id);
            let booking = yield CekBooking(req.params.TransactionId);
            let adminId = req.body.adminId || req.session.userId;
            const ipAddress = req.ip || req.socket.remoteAddress;
            const routePath = req.originalUrl; // Dapatkan route yang diakses
            let type = ""; // Target data yang akan dicatat di log
            let target = ""; // Target data yang akan dicatat di log
            let statement1 = ""; // Target data yang akan dicatat di log
            let statement2 = ""; // Target data yang akan dicatat di log
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
            const DataAdmin = yield models_admin_1.default.findOne({ _id: adminId });
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
                    target = req.params.MessageId || "-";
                    break;
                case routePath.startsWith("/api/v1/admin/customer/update"):
                    type = "Customer";
                    target = user ? (`Name : ${user.name}, Id : ${user._id}`) : "-"; // Mengambil nama user jika ada, jika tidak ada tampilkan "-"
                    statement1 = `New Data : ${JSON.stringify(req.body, null, 2)}`;
                    statement2 = `Old Data : ${user}`;
                    break;
                case routePath.startsWith("/api/v1/admin/booking/set-verified"):
                    type = "Booking";
                    // const user = await CekUser(req.params.TransactionId);
                    target = booking ? (`Name : ${booking.name}, TRX : ${booking.orderId}`) : "-";
                    break;
                case routePath.startsWith("/api/v1/admin/booking/set-checkout"):
                    type = "Booking";
                    // const user = await CekUser(req.params.TransactionId);
                    target = booking ? (`Name : ${booking.name}, TRX : ${booking.orderId}`) : "-";
                    break;
                case routePath.startsWith("/api/v1/booking"):
                    target = req.body.bookingCode || req.params.id || "Tidak ada Booking Data";
                    break;
                case routePath.startsWith("/api/v1/user"):
                    target = req.body.username || req.params.id || "Tidak ada User Data";
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
                action,
                target,
                ipAddress,
                routePath, // Tambahkan jalur yang diakses
            });
            console.log("Log Activity:", {
                adminId,
                type,
                username: DataAdmin.username,
                role: DataAdmin.role,
                action,
                statement1,
                statement2,
                date,
                target,
                ipAddress,
                routePath,
            });
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
