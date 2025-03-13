"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLogModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ActivityLogSchema = new mongoose_1.Schema({
    adminId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Admin", required: true },
    action: { type: String, required: true },
    type: { type: String }, // Data yang dimodifikasi (opsional)
    target: { type: String }, // Data yang dimodifikasi (opsional)
    username: { type: String }, // Data yang dimodifikasi (opsional)
    statement1: { type: String }, // Data yang dimodifikasi (opsional)
    statement2: { type: String }, // Data yang dimodifikasi (opsional)
    date: [{ type: String }], // 🔹 Ubah jadi array string, bukan array objek
    role: { type: String }, // Data yang dimodifikasi (opsional)
    changedPrices: { type: mongoose_1.Schema.Types.Mixed, default: {} }, // ✅ Simpan sebagai objek fleksibel
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String }, // IP admin yang melakukan aksi
    isDeleted: {
        type: Boolean,
        default: false,
    },
});
exports.ActivityLogModel = mongoose_1.default.model('ActivityLog', ActivityLogSchema, 'ActivityLog');
