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
exports.PromoModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const PromoSchema = new mongoose_1.Schema({
    secret_key: { type: String, required: true, default: null, unique: true },
    title: { type: String, required: true },
    type: { type: String, required: true, enum: ["ROM", "HLD", "DSC", "VCR"] },
    type_claim: { type: String, required: true, enum: ["WA", "WEB", "WAW"] },
    room_key: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Room", default: null },
    user_key: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
    image: { type: String, required: false },
    backgroundImage: { type: String, required: false },
    video: {
        url: { type: String, required: false, default: "" },
        orientation: { type: String, required: false, default: "" }
    },
    desc: { type: String, required: true },
    sub_desc: { type: String, required: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ["percentage", "fixed"], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    maxDiscount: { type: Number, default: null },
    minTransaction: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    startDateVoucher: { type: Date, required: true },
    endDateVoucher: { type: Date, required: true },
    usageLimit: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isPublic: { type: Boolean, default: true },
    applicableRooms: [{ type: String }],
    applicableUserIds: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Admin" },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });
// ✅ Middleware: auto-nonaktifkan promo jika sudah kadaluarsa
PromoSchema.pre("save", function (next) {
    if (this.endDate < new Date()) {
        this.isActive = false;
    }
    next();
});
exports.PromoModel = mongoose_1.default.model('Promo', PromoSchema, 'Promo');
// | Field               | Fungsi                                                                                |
// | ------------------- | ------------------------------------------------------------------------------------- |
// | **title**           | Judul promo, misalnya “Promo Akhir Tahun”                                             |
// | **type**            | Jenis promo — hanya bisa salah satu dari: `"ROM"`, `"HLD"`, `"DISCOUNT"`, `"VOUCHER"` |
// | **room_key**        | Relasi ke data **Room** (misalnya promo berlaku untuk kamar tertentu)                 |
// | **image**           | Gambar utama promo (misalnya banner kecil)                                            |
// | **backgroundImage** | Gambar latar belakang untuk tampilan besar/banner hero                                |
// | **desc**            | Deskripsi utama promo                                                                 |
// | **sub_desc**        | Deskripsi tambahan atau penjelasan singkat promo                                      |
// | Field              | Fungsi                                                                                                    |
// | ------------------ | --------------------------------------------------------------------------------------------------------- |
// | **code**           | Kode promo unik (misalnya `SAVOY2025`), otomatis diubah ke huruf besar dan di-trim (hapus spasi berlebih) |
// | **discountType**   | Jenis diskon — `"percentage"` (persentase) atau `"fixed"` (potongan nominal)                              |
// | **discountValue**  | Nilai diskon — bisa berupa angka persen atau nilai tetap (contoh: `10` atau `50000`)                      |
// | **maxDiscount**    | Batas maksimum potongan jika menggunakan persentase (contoh: maksimal potongan Rp50.000)                  |
// | **minTransaction** | Nilai minimal transaksi agar promo bisa digunakan (contoh: minimal Rp200.000)                             |
// | Field            | Fungsi                                                                  |
// | ---------------- | ----------------------------------------------------------------------- |
// | **startDate**    | Tanggal mulai promo                                                     |
// | **endDate**      | Tanggal berakhir promo                                                  |
// | **usageLimit**   | Jumlah total penggunaan promo (contoh: 100 kali total untuk semua user) |
// | **perUserLimit** | Batas pemakaian promo per user (contoh: 1 kali per user)                |
// | **usedCount**    | Jumlah penggunaan promo yang sudah tercatat                             |
// | Field                 | Fungsi                                                                        |
// | --------------------- | ----------------------------------------------------------------------------- |
// | **isActive**          | Menandakan apakah promo sedang aktif atau tidak                               |
// | **isPublic**          | Menentukan apakah promo ditampilkan untuk semua user atau hanya user tertentu |
// | **applicableRooms**   | Daftar ID kamar (atau kategori kamar) yang promo-nya berlaku                  |
// | **applicableUserIds** | Daftar user yang promo-nya berlaku (relasi ke `User`)                         |
// | **createdBy**         | ID admin yang membuat promo (relasi ke `Admin`)                               |
// | **isDeleted**         | Untuk soft delete (promo dihapus tapi datanya tetap tersimpan di DB)          |
// | Field                | Fungsi                                                                   |
// | -------------------- | ------------------------------------------------------------------------ |
// | **timestamps: true** | Menambahkan otomatis field `createdAt` dan `updatedAt` di setiap dokumen |
