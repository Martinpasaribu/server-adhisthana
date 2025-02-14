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
exports.SubsModel = exports.ContactModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ContactSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "name cannot be empty"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "name cannot be empty"],
        trim: true
    },
    phone: {
        type: Number,
        required: false,
        min: [1, 'size must more then 0'],
        trim: true
    },
    subject: {
        type: String,
        required: false,
        trim: true
    },
    message: {
        type: String,
        required: false,
        trim: true
    },
    createAt: {
        type: Number,
        default: Date.now
    },
    creatorId: {
        type: String,
        required: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true,
});
exports.ContactModel = mongoose_1.default.model('Contact', ContactSchema, 'Contact');
const SubsSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: [true, "name cannot be empty"],
        trim: true
    },
    createAt: {
        type: Number,
        default: Date.now
    },
    creatorId: {
        type: String,
        required: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true,
});
exports.SubsModel = mongoose_1.default.model('Subscribe', SubsSchema, 'Subscribe');
