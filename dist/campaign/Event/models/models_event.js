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
exports.EventModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const EventInfoSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    code: { type: String, required: true, unique: true, trim: true },
    secret_key: { type: String, required: true, default: null, unique: true },
    type: { type: String, required: true },
    type_claim: { type: String, required: true, enum: ["WA", "WEB", "WAW"] },
    desc: { type: String, required: true },
    sub_desc: { type: String, required: true },
    image: { type: String, required: false },
    backgroundImage: { type: String, required: false },
    video: { type: String, required: false },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    location: { type: String, required: false },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });
// ✅ Middleware: auto-nonaktifkan promo jika sudah kadaluarsa
EventInfoSchema.pre("save", function (next) {
    if (this.endDate < new Date()) {
        this.isActive = false;
    }
    next();
});
exports.EventModel = mongoose_1.default.model('Event', EventInfoSchema, 'Event');
