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
const mongoose_1 = __importStar(require("mongoose"));
const RoomSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "name cannot be empty"],
        trim: true
    },
    nameAdditional: {
        type: String,
        required: [true, "subName cannot be empty"],
        trim: true
    },
    maxCapacity: {
        type: Number,
        required: false,
        trim: true
    },
    shortDesc: {
        type: String,
        required: false,
        trim: true
    },
    describe: {
        type: String,
        required: false,
        trim: true
    },
    price: {
        type: Number,
        required: false,
        min: [1, 'price must more then 0'],
        trim: true
    },
    priceDateList: {
        type: Number,
        required: false,
        // min: [1, 'price must more then 0'],
        trim: true
    },
    size: {
        type: Number,
        required: false,
        min: [1, 'size must more then 0'],
        trim: true
    },
    bedType: {
        type: String,
        required: false,
        trim: true
    },
    available: {
        type: Number,
        required: false,
        trim: true
    },
    image: [{
            row: { type: Number },
            image: { type: String }
        }],
    imagePoster: {
        type: String,
        required: false,
        trim: true,
    },
    imageShort: {
        type: String,
        required: false,
        trim: true,
    },
    facility: [{
            type: String
        }],
    rating: {
        type: String,
        required: false,
        trim: true
    },
    review: {
        type: String,
        required: false,
        trim: true
    },
    used: {
        type: Number,
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
const RoomModel = mongoose_1.default.model('Room', RoomSchema, 'Room');
exports.default = RoomModel;
