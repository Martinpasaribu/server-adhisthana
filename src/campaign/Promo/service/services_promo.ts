import mongoose from "mongoose";
import { PromoModel } from "../models/models_promo";


class PromoService {

    async ValidationPromo (user_id: string, totalPrice: number, promo_key: any[]){
        
        if(!user_id){

            throw { 
                message: " ID User Empty",
                data: null,
                status: 500 
            };    
              
        }

        if (promo_key.length <= 0) return totalPrice

        let finalPrice = totalPrice

        for (const promo of promo_key) {
            if (!promo || !promo.discountValue) continue

            const discountValue = Number(promo.discountValue)
            const discountType = promo.discountType?.toLowerCase()

            if (discountType === 'percentage' || discountType === 'percentage') {
            // Potongan dalam persen
            finalPrice -= (discountValue / 100) * finalPrice
            } else if (discountType === 'fixed' || discountType === 'nominal') {
            // Potongan nominal langsung
            finalPrice -= discountValue
            }
        }

        // Pastikan tidak minus
        return Math.max(0, Math.round(finalPrice))

    }

    /**
     * Inisialisasi daftar promo yang dipilih user
     * @param user_key ID user
     * @param promo_key Array berisi promo_id (ObjectId)
     */
    
    async InitialPromo(user_key: string, promo_key: any[]) {

        if (!user_key) throw new Error("User ID tidak boleh kosong");
        if (!promo_key || !promo_key.length) return [];

        // const userObjectId = new mongoose.Types.ObjectId(user_key);

        // 🧩 Hasil akhir
        const results: {
        promoId: string;
        success: boolean;
        message: string;
        }[] = [];

        // 🔁 Loop tiap promo
        for (const pid of promo_key) {

            try {
                const promo = await PromoModel.findOne({
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
                const userAlreadyRegistered = promo.user_key.some(
                (u) => u.toString() === user_key.toString()
                );

                if (!userAlreadyRegistered) {
                promo.user_key.push(user_key);
                }

                // Tambah hitungan pemakaian
                promo.usedCount += 1;
                await promo.save();

                results.push({
                promoId: promo._id.toString(),
                success: true,
                message: "Promo berhasil diaktifkan.",
                });
            } catch (err: any) {
                results.push({
                promoId: pid,
                success: false,
                message: err.message || "Terjadi kesalahan.",
                });
            }
        }

        return results;
    }


}


export const PromoServices = new PromoService();
