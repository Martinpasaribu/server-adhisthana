"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NationalHolidays = exports.PAYMENT_ADMIN = exports.PAID_ADMIN = exports.EXPIRE = exports.CANCELED = exports.PAID = exports.PENDING_PAYMENT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.PENDING_PAYMENT = 'PENDING_PAYMENT';
exports.PAID = 'PAID';
exports.CANCELED = 'CANCELED';
exports.EXPIRE = 'EXPIRE';
exports.PAID_ADMIN = 'PAID_ADMIN';
exports.PAYMENT_ADMIN = 'PAYMENT_ADMIN';
// export const MIDTRANS_SEVER_KEY = process.env.MID
// export const MIDTRANS_APP_URL = process.env.MID
// export const FRONT_END_URL = process.env.MID
//  tipe eksplisit ke NationalHolidays untuk memberi tahu TypeScript bahwa itu adalah objek dengan kunci string:
exports.NationalHolidays = {
    "2025-01-01": {
        "description": [
            "Hari libur nasional"
        ],
        "holiday": true,
        "summary": [
            "Hari Tahun Baru"
        ]
    },
    "2025-01-27": {
        "description": [
            "Hari libur nasional"
        ],
        "holiday": true,
        "summary": [
            "Isra Mikraj Nabi Muhammad (belum pasti)"
        ]
    },
    "2025-01-28": {
        "description": [
            "Hari libur nasional"
        ],
        "holiday": true,
        "summary": [
            "Cuti Bersama Tahun Baru Imlek"
        ]
    },
    "2025-01-29": {
        "description": [
            "Hari libur nasional"
        ],
        "holiday": true,
        "summary": [
            "Tahun Baru Imlek"
        ]
    },
    "2025-03-02": {
        "description": [
            "Perayaan"
        ],
        "holiday": false,
        "summary": [
            "Ramadan Start (belum pasti)"
        ]
    },
    "2025-03-28": {
        "description": [
            "Hari libur nasional"
        ],
        "holiday": true,
        "summary": [
            "Cuti Bersama Hari Suci Nyepi (Tahun Baru Saka)"
        ]
    },
    "2025-03-29": {
        "description": [
            "Hari libur nasional"
        ],
        "holiday": true,
        "summary": [
            "Hari Suci Nyepi (Tahun Baru Saka)"
        ]
    },
    "2025-03-31": {
        "description": [
            "Hari libur nasional"
        ],
        "holiday": true,
        "summary": [
            "Hari Idul Fitri (belum pasti)"
        ]
    },
    "2025-04-01": {
        "description": [
            "Hari libur nasional"
        ],
        "holiday": true,
        "summary": [
            "Hari Idul Fitri (belum pasti)"
        ]
    },
    "2025-04-02": {
        "description": [
            "Hari libur nasional"
        ],
        "holiday": true,
        "summary": [
            "Cuti Bersama Idul Fitri"
        ]
    },
    "2025-04-03": {
        "description": [
            "Hari libur nasional"
        ],
        "holiday": true,
        "summary": [
            "Cuti Bersama Idul Fitri"
        ]
    },
    "2025-04-04": {
        "description": [
            "Hari libur nasional"
        ],
        "holiday": true,
        "summary": [
            "Cuti Bersama Idul Fitri"
        ]
    },
    "2025-04-07": {
        "description": [
            "Hari libur nasional"
        ],
        "holiday": true,
        "summary": [
            "Cuti Bersama Idul Fitri"
        ]
    },
    "2025-04-18": {
        "description": [
            "Hari libur nasional"
        ],
        "holiday": true,
        "summary": [
            "Wafat Isa Almasih"
        ]
    },
    "2025-04-20": {
        "description": [
            "Hari libur nasional"
        ],
        "holiday": true,
        "summary": [
            "Hari Paskah"
        ]
    },
    "2025-05-01": {
        "description": [
            "Hari libur nasional"
        ],
        "holiday": true,
        "summary": [
            "Hari Buruh Internasional / Pekerja"
        ]
    },
    "2025-05-12": {
        "description": [
            "Hari libur nasional"
        ],
        "holiday": true,
        "summary": [
            "Hari Raya Waisak"
        ]
    },
    "2025-05-13": {
        "description": [
            "Hari libur nasional"
        ],
        "holiday": true,
        "summary": [
            "Cuti Bersama Waisak"
        ]
    },
    "2025-05-29": {
        "description": [
            "Hari libur nasional"
        ],
        "holiday": true,
        "summary": [
            "Kenaikan Isa Al Masih"
        ]
    },
    "2025-05-30": {
        "description": [
            "Hari libur nasional"
        ],
        "holiday": true,
        "summary": [
            "Cuti Bersama Kenaikan Isa Al Masih"
        ]
    },
    "2025-06-01": {
        "description": [
            "Hari libur nasional"
        ],
        "holiday": true,
        "summary": [
            "Hari Lahir Pancasila"
        ]
    },
    "2025-06-06": {
        "description": [
            "Hari libur nasional"
        ],
        "holiday": true,
        "summary": [
            "Idul Adha (Lebaran Haji) (belum pasti)"
        ]
    },
    "2025-06-09": {
        "description": [
            "Hari libur nasional"
        ],
        "holiday": true,
        "summary": [
            "Idul Adha (Lebaran Haji)"
        ]
    },
    "2025-06-27": {
        "description": [
            "Hari libur nasional"
        ],
        "holiday": true,
        "summary": [
            "Satu Muharam / Tahun Baru Hijriah (belum pasti)"
        ]
    },
    "2025-08-17": {
        "description": [
            "Hari libur nasional"
        ],
        "holiday": true,
        "summary": [
            "Hari Proklamasi Kemerdekaan R.I."
        ]
    },
    "2025-09-05": {
        "description": [
            "Hari libur nasional"
        ],
        "holiday": true,
        "summary": [
            "Maulid Nabi Muhammad (belum pasti)"
        ]
    },
    "2025-10-21": {
        "description": [
            "Perayaan"
        ],
        "holiday": false,
        "summary": [
            "Diwali"
        ]
    },
    "2025-12-24": {
        "description": [
            "Perayaan"
        ],
        "holiday": false,
        "summary": [
            "Malam Natal"
        ]
    },
    "2025-12-25": {
        "description": [
            "Hari libur nasional"
        ],
        "holiday": true,
        "summary": [
            "Hari Raya Natal"
        ]
    },
    "2025-12-26": {
        "description": [
            "Hari libur nasional"
        ],
        "holiday": true,
        "summary": [
            "Cuti Bersama Natal (Hari Tinju)"
        ]
    },
    "2025-12-31": {
        "description": [
            "Perayaan"
        ],
        "holiday": false,
        "summary": [
            "Malam Tahun Baru"
        ]
    },
};
