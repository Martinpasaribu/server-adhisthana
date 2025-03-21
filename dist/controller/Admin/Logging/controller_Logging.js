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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingController = void 0;
const uuid_1 = require("uuid");
const models_LogActivity_1 = require("../../../models/LogActivity/models_LogActivity");
class LoggingController {
    static GetAllLogging(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ActivityLog = yield models_LogActivity_1.ActivityLogModel.find({ isDeleted: false });
                // Kirim hasil response
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: ActivityLog,
                    success: true
                });
            }
            catch (error) {
                res.status(500).json({ message: "Failed to fetch ActivityLog", error });
            }
        });
    }
    static GetLogsPagination(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { key, page, limit } = req.query;
                const pageNumber = parseInt(page) || 1;
                const limitNumber = parseInt(limit) || 10;
                const skip = (pageNumber - 1) * limitNumber;
                // Buat query dinamis
                const query = {};
                if (key && key !== "null" && key !== "undefined") {
                    query.type = key; // Filter hanya jika key memiliki nilai
                }
                // Ambil data log dengan pagination
                const logs = yield models_LogActivity_1.ActivityLogModel.find(query)
                    .skip(skip)
                    .limit(limitNumber)
                    .sort({ timestamp: -1 });
                // Hitung total data sesuai query
                const totalLogs = yield models_LogActivity_1.ActivityLogModel.countDocuments(query);
                // Kirim hasil response
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: logs,
                    totalPages: Math.ceil(totalLogs / limitNumber),
                    totalAllLog: totalLogs,
                    currentPage: pageNumber,
                    success: true,
                });
            }
            catch (error) {
                res.status(500).json({ message: "Failed to fetch ActivityLog Pagination", error });
            }
        });
    }
}
exports.LoggingController = LoggingController;
