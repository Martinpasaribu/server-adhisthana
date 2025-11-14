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
exports.PromoController = void 0;
const models_promo_1 = require("../models/models_promo");
const crypto_1 = __importDefault(require("crypto"));
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
class PromoController {
    /**
         * @description Menambahkan data promo utama ke database dan mengembalikan _id.
         * Ini adalah Langkah 1 dalam proses pembuatan promo.
         * @route POST /api/promo
         */
    static GetPromo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // Asumsi: Body request sudah berisi semua field data promo
            // (title, type, description, code, discountType, discountValue, dll.)
            const promoData = req.body;
            try {
                // Membuat instance baru dari model
                const promo = yield models_promo_1.PromoModel.find({ isDeleted: false })
                    .populate('room_key');
                return res.status(201).json({
                    requestId: (0, uuid_1.v4)(),
                    success: true,
                    message: "Promo Get successfully",
                    // Penting: Pastikan _id tersedia di objek data yang dikembalikan
                    data: promo
                });
            }
            catch (err) {
                // Menangani error validasi atau database
                if (err instanceof mongoose_1.default.Error.ValidationError) {
                    return res.status(400).json({ success: false, message: err.message });
                }
                res.status(500).json({ success: false, message: err.message });
            }
        });
    }
    static GetPromoByCode(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // Asumsi: Body request sudah berisi semua field data promo
            // (title, type, description, code, discountType, discountValue, dll.)
            const { code } = req.params;
            try {
                // Membuat instance baru dari model
                const promo = yield models_promo_1.PromoModel.findOne({ code: code, isDeleted: false })
                    .populate('room_key');
                return res.status(201).json({
                    requestId: (0, uuid_1.v4)(),
                    success: true,
                    message: "Promo get code successfully",
                    data: promo
                });
            }
            catch (err) {
                // Menangani error validasi atau database
                if (err instanceof mongoose_1.default.Error.ValidationError) {
                    return res.status(400).json({ success: false, message: err.message });
                }
                res.status(500).json({
                    success: false,
                    message: err.message,
                    data: `code add ${code}`
                });
            }
        });
    }
    // 🔍 Cari promo berdasarkan sebagian code
    static SearchPromoByCode(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { code } = req.params;
            try {
                if (!code || code.length < 3) {
                    return res.status(400).json({
                        success: false,
                        message: 'Masukkan minimal 3 karakter untuk mencari promo.',
                        data: [],
                    });
                }
                // Gunakan regex agar bisa cari sebagian & tidak case-sensitive
                const promos = yield models_promo_1.PromoModel.find({
                    code: { $regex: code, $options: 'i' },
                    isDeleted: false,
                })
                    .populate('room_key')
                    .sort({ createdAt: -1 });
                return res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    success: true,
                    message: promos.length > 0
                        ? 'Promo ditemukan.'
                        : `Tidak ada promo dengan kode mengandung "${code}".`,
                    data: promos,
                });
            }
            catch (err) {
                console.error('❌ Error SearchPromoByCode:', err);
                if (err instanceof mongoose_1.default.Error.ValidationError) {
                    return res.status(400).json({
                        success: false,
                        message: err.message,
                        data: [],
                    });
                }
                return res.status(500).json({
                    success: false,
                    message: 'Terjadi kesalahan pada server.',
                    error: err.message,
                });
            }
        });
    }
    static GetPromoForClient(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // Asumsi: Body request sudah berisi semua field data promo
            // (title, type, description, code, discountType, discountValue, dll.)
            const promoData = req.body;
            try {
                // Membuat instance baru dari model
                const promo = yield models_promo_1.PromoModel.find({ isDeleted: false, isActive: true })
                    .populate('room_key');
                return res.status(201).json({
                    requestId: (0, uuid_1.v4)(),
                    success: true,
                    message: "Promo get client successfully",
                    // Penting: Pastikan _id tersedia di objek data yang dikembalikan
                    data: promo
                });
            }
            catch (err) {
                // Menangani error validasi atau database
                if (err instanceof mongoose_1.default.Error.ValidationError) {
                    return res.status(400).json({ success: false, message: err.message });
                }
                res.status(500).json({ success: false, message: err.message });
            }
        });
    }
    static AddPromo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const promoData = req.body;
            try {
                // Pastikan jika room_key kosong string, ubah jadi null
                if (!promoData.room_key || promoData.room_key === '') {
                    promoData.room_key = null;
                }
                // 🔐 Generate secret key unik untuk promo baru
                const secretKey = crypto_1.default
                    .createHash("sha256")
                    .update(`${promoData.code}-${Date.now()}-${(0, uuid_1.v4)()}`)
                    .digest("hex")
                    .slice(0, 32); // panjang 32 karakter aman & efisien
                // 🧩 Tambahkan secret_key ke data promo
                const newPromo = new models_promo_1.PromoModel(Object.assign(Object.assign({}, promoData), { secret_key: secretKey }));
                const savedPromo = yield newPromo.save();
                return res.status(201).json({
                    requestId: (0, uuid_1.v4)(),
                    success: true,
                    message: "Promo created successfully",
                    data: savedPromo.toObject(),
                });
            }
            catch (err) {
                console.error("❌ Error creating promo:", err);
                if (err instanceof mongoose_1.default.Error.ValidationError) {
                    return res.status(400).json({
                        success: false,
                        message: err.message,
                    });
                }
                return res.status(500).json({
                    success: false,
                    message: err.message || "Failed to create promo",
                });
            }
        });
    }
    static AddImage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { _id } = req.params;
            // Asumsi: URL gambar diinject ke req.body.image oleh middleware router
            const { image } = req.body;
            try {
                const updated = yield models_promo_1.PromoModel.findOneAndUpdate({ _id, isDeleted: false }, { image: image }, // Menyimpan URL ke field 'image'
                { new: true });
                if (!updated) {
                    // ✅ KOREKSI: Ganti "Room not found" menjadi "Promo not found"
                    return res.status(404).json({ success: false, message: "Promo not found" });
                }
                return res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    success: true,
                    // ✅ KOREKSI: Pesan sukses lebih spesifik
                    message: "Promo image updated successfully",
                    data: updated,
                });
            }
            catch (err) {
                res.status(500).json({ success: false, message: err.message });
            }
        });
    }
    static AddBackground(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { _id } = req.params;
            // Asumsi: URL background diinject ke req.body.background oleh middleware router
            const { background } = req.body;
            try {
                const updated = yield models_promo_1.PromoModel.findOneAndUpdate({ _id, isDeleted: false }, { backgroundImage: background }, // Menyimpan URL ke field 'backgroundImage'
                { new: true });
                if (!updated) {
                    // ✅ KOREKSI: Ganti "Room not found" menjadi "Promo not found"
                    return res.status(404).json({ success: false, message: "Promo not found" });
                }
                return res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    success: true,
                    // ✅ KOREKSI: Pesan sukses lebih spesifik
                    message: "Promo background updated successfully",
                    data: updated,
                });
            }
            catch (err) {
                res.status(500).json({ success: false, message: err.message });
            }
        });
    }
    /**
     * @description Mengubah status aktif/tidak aktif event
     * @route PATCH /api/event/:id/status
     */
    static ToggleStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { isActive } = req.body;
                if (!id)
                    return res.status(400).json({
                        success: false,
                        message: "Promo ID wajib diisi",
                    });
                // Validasi nilai boolean
                if (typeof isActive !== 'boolean')
                    return res.status(400).json({
                        success: false,
                        message: "Field 'isActive' harus berupa boolean",
                    });
                // Pastikan event ditemukan
                const promo = yield models_promo_1.PromoModel.findById(id);
                if (!promo)
                    return res.status(404).json({
                        success: false,
                        message: "Promo tidak ditemukan",
                    });
                // Update status aktif
                promo.isActive = isActive;
                // disable validation if you don't want to re-validate required fields:
                yield promo.save({ validateBeforeSave: false });
                return res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    success: true,
                    message: `Toggle status : ${isActive ? 'Aktif' : 'Nonaktif'} , info : ( ${promo.endDate < new Date() ? 'Sudah Tidak Berlaku' : 'Masih berlaku'} )`,
                    data: promo,
                });
            }
            catch (err) {
                console.error('❌ Error toggle event status:', err);
                if (err instanceof mongoose_1.default.Error.ValidationError) {
                    return res.status(400).json({ success: false, message: err.message });
                }
                res.status(500).json({ success: false, message: err.message });
            }
        });
    }
    static updatePromo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const updateData = req.body;
                if (!id) {
                    return res.status(400).json({
                        success: false,
                        message: 'ID promo wajib diisi',
                    });
                }
                if (!updateData || typeof updateData !== 'object') {
                    return res.status(400).json({
                        success: false,
                        message: 'Data promo tidak valid',
                    });
                }
                // ✅ Filter hanya field yang dikirim & tidak undefined
                const filteredData = {};
                for (const [key, value] of Object.entries(updateData)) {
                    if (value !== undefined && value !== '') {
                        filteredData[key] = value;
                    }
                }
                // ✅ Update hanya field yang dikirim (tanpa menimpa data lama)
                const updatedPromo = yield models_promo_1.PromoModel.findByIdAndUpdate(id, { $set: filteredData }, { new: true } // mengembalikan data terbaru
                );
                if (!updatedPromo) {
                    return res.status(404).json({
                        success: false,
                        message: 'Promo tidak ditemukan',
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: 'Promo berhasil diperbarui',
                    data: updatedPromo,
                });
            }
            catch (error) {
                console.error('❌ Error update promo:', error);
                return res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal memperbarui promo',
                });
            }
        });
    }
    /**
     * @description Hapus promo berdasarkan ID
     * @route DELETE /campaign/promo/:id
     */
    static DeletePromo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
                    return res.status(400).json({
                        success: false,
                        message: "ID promo tidak valid",
                    });
                }
                // ✅ Pilihan 1: Hard Delete (hapus total)
                //   const deletedPromo = await PromoModel.findByIdAndDelete(id);
                // 🧩 Update field isDeleted
                const updatedPromo = yield models_promo_1.PromoModel.findByIdAndUpdate(id, { isDeleted: true, updatedAt: new Date() }, { new: true });
                if (!updatedPromo) {
                    return res.status(404).json({
                        success: false,
                        message: "Promo tidak ditemukan",
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: "Promo berhasil dihapus",
                    data: updatedPromo,
                });
                // ✅ Pilihan 2 (opsional): Soft Delete
                // const updated = await PromoModel.findByIdAndUpdate(
                //   id,
                //   { isDeleted: true },
                //   { new: true }
                // );
                // if (!updated) return res.status(404).json({ success: false, message: "Promo tidak ditemukan" });
                // return res.status(200).json({ success: true, message: "Promo di-nonaktifkan", data: updated });
            }
            catch (error) {
                console.error("❌ Error delete promo:", error);
                return res.status(500).json({
                    success: false,
                    message: error.message || "Terjadi kesalahan saat menghapus promo",
                });
            }
        });
    }
}
exports.PromoController = PromoController;
