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
exports.PromoServices = void 0;
const models_promo_1 = require("../models/models_promo");
class PromoService {
    ValidationPromo(user_id, totalPrice, promo_key) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!user_id) {
                throw {
                    message: " ID User Empty",
                    data: null,
                    status: 500
                };
            }
            if (promo_key.length <= 0)
                return totalPrice;
            let finalPrice = totalPrice;
            for (const promo of promo_key) {
                if (!promo || !promo.discountValue)
                    continue;
                const discountValue = Number(promo.discountValue);
                const discountType = (_a = promo.discountType) === null || _a === void 0 ? void 0 : _a.toLowerCase();
                if (discountType === 'percentage' || discountType === 'percentage') {
                    // Potongan dalam persen
                    finalPrice -= (discountValue / 100) * finalPrice;
                }
                else if (discountType === 'fixed' || discountType === 'nominal') {
                    // Potongan nominal langsung
                    finalPrice -= discountValue;
                }
            }
            // Pastikan tidak minus
            return Math.max(0, Math.round(finalPrice));
        });
    }
    /**
     * Inisialisasi daftar promo yang dipilih user
     * @param user_key ID user
     * @param promo_key Array berisi promo_id (ObjectId)
     */
    InitialPromo(user_key, promo_key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!user_key)
                throw new Error("User ID tidak boleh kosong");
            if (!promo_key || !promo_key.length)
                return [];
            // const userObjectId = new mongoose.Types.ObjectId(user_key);
            // 🧩 Hasil akhir
            const results = [];
            // 🔁 Loop tiap promo
            for (const pid of promo_key) {
                try {
                    const promo = yield models_promo_1.PromoModel.findOne({
                        _id: pid,
                        isDeleted: false,
                    });
                    if (!promo) {
                        results.push({
                            promoId: pid,
                            success: false,
                            message: "Promo tidak ditemukan.",
                        });
                        continue;
                    }
                    // Cek tanggal dan status aktif
                    const now = new Date();
                    if (!promo.isActive || promo.startDate > now || promo.endDate < now) {
                        results.push({
                            promoId: promo._id.toString(),
                            success: false,
                            message: "Promo tidak aktif atau sudah kadaluarsa.",
                        });
                        continue;
                    }
                    // Cek batas pemakaian global
                    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
                        results.push({
                            promoId: promo._id.toString(),
                            success: false,
                            message: "Promo sudah mencapai batas penggunaan maksimum.",
                        });
                        continue;
                    }
                    // Cek apakah user sudah terdaftar di promo
                    const userAlreadyRegistered = promo.user_key.some((u) => u.toString() === user_key.toString());
                    if (!userAlreadyRegistered) {
                        promo.user_key.push(user_key);
                    }
                    // Tambah hitungan pemakaian
                    promo.usedCount += 1;
                    yield promo.save();
                    results.push({
                        promoId: promo._id.toString(),
                        success: true,
                        message: "Promo berhasil diaktifkan.",
                    });
                }
                catch (err) {
                    results.push({
                        promoId: pid,
                        success: false,
                        message: err.message || "Terjadi kesalahan.",
                    });
                }
            }
            return results;
        });
    }
}
exports.PromoServices = new PromoService();
