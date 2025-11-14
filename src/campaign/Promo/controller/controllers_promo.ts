import { PromoModel } from "../models/models_promo";
import crypto from "crypto";
import { Request, Response, NextFunction  } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export class PromoController {

/**
     * @description Menambahkan data promo utama ke database dan mengembalikan _id.
     * Ini adalah Langkah 1 dalam proses pembuatan promo.
     * @route POST /api/promo
     */
    static async GetPromo(req: Request, res: Response) {
        // Asumsi: Body request sudah berisi semua field data promo
        // (title, type, description, code, discountType, discountValue, dll.)
        const promoData = req.body;

        try {
            // Membuat instance baru dari model
   
            const promo = await PromoModel.find({isDeleted:false})
            .populate('room_key')

            return res.status(201).json({
                requestId: uuidv4(),
                success: true,
                message: "Promo Get successfully",
                // Penting: Pastikan _id tersedia di objek data yang dikembalikan
                data: promo
            });
        } catch (err: any) {
            // Menangani error validasi atau database
            if (err instanceof mongoose.Error.ValidationError) {
                return res.status(400).json({ success: false, message: err.message });
            }
            res.status(500).json({ success: false, message: err.message });
        }
    }

        
    static async GetPromoByCode(req: Request, res: Response) {
        // Asumsi: Body request sudah berisi semua field data promo
        // (title, type, description, code, discountType, discountValue, dll.)
        const {code} = req.params;

        try {
            // Membuat instance baru dari model
   
            const promo = await PromoModel.findOne({code: code, isDeleted:false})
            .populate('room_key')

            return res.status(201).json({
                requestId: uuidv4(),
                success: true,
                message: "Promo get code successfully",
                data: promo
            });
        } catch (err: any) {
            // Menangani error validasi atau database
            if (err instanceof mongoose.Error.ValidationError) {
                return res.status(400).json({ success: false, message: err.message });
            }
            res.status(500).json(
                { 
                    success: false, 
                    message: err.message,
                    data: `code add ${code}`
                
                });
        }
    }


    // 🔍 Cari promo berdasarkan sebagian code
    static async SearchPromoByCode(req: Request, res: Response) {
        const { code } = req.params

        try {
        if (!code || code.length < 3) {
            return res.status(400).json({
            success: false,
            message: 'Masukkan minimal 3 karakter untuk mencari promo.',
            data: [],
            })
        }

        // Gunakan regex agar bisa cari sebagian & tidak case-sensitive
        const promos = await PromoModel.find({
            code: { $regex: code, $options: 'i' },
            isDeleted: false,
        })
            .populate('room_key')
            .sort({ createdAt: -1 })

        return res.status(200).json({
            requestId: uuidv4(),
            success: true,
            message:
            promos.length > 0
                ? 'Promo ditemukan.'
                : `Tidak ada promo dengan kode mengandung "${code}".`,
            data: promos,
        })
        } catch (err: any) {
        console.error('❌ Error SearchPromoByCode:', err)

        if (err instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
            success: false,
            message: err.message,
            data: [],
            })
        }

        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server.',
            error: err.message,
        })
        }
    }
    
    static async GetPromoForClient(req: Request, res: Response) {
        // Asumsi: Body request sudah berisi semua field data promo
        // (title, type, description, code, discountType, discountValue, dll.)
        const promoData = req.body;

        try {
            // Membuat instance baru dari model
   
            const promo = await PromoModel.find({isDeleted:false, isActive: true})
            .populate('room_key')

            return res.status(201).json({
                requestId: uuidv4(),
                success: true,
                message: "Promo get client successfully",
                // Penting: Pastikan _id tersedia di objek data yang dikembalikan
                data: promo
            });
        } catch (err: any) {
            // Menangani error validasi atau database
            if (err instanceof mongoose.Error.ValidationError) {
                return res.status(400).json({ success: false, message: err.message });
            }
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async AddPromo(req: Request, res: Response) {
    const promoData = req.body;

    try {
        // Pastikan jika room_key kosong string, ubah jadi null
        if (!promoData.room_key || promoData.room_key === '') {
        promoData.room_key = null;
        }

        // 🔐 Generate secret key unik untuk promo baru
        const secretKey = crypto
        .createHash("sha256")
        .update(`${promoData.code}-${Date.now()}-${uuidv4()}`)
        .digest("hex")
        .slice(0, 32); // panjang 32 karakter aman & efisien

        // 🧩 Tambahkan secret_key ke data promo
        const newPromo = new PromoModel({
        ...promoData,
        secret_key: secretKey,
        });

        const savedPromo = await newPromo.save();

        return res.status(201).json({
        requestId: uuidv4(),
        success: true,
        message: "Promo created successfully",
        data: savedPromo.toObject(),
        });
    } catch (err: any) {
        console.error("❌ Error creating promo:", err);

        if (err instanceof mongoose.Error.ValidationError) {
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
    }


    static async AddImage(req: Request, res: Response) {

            const { _id } = req.params;
            // Asumsi: URL gambar diinject ke req.body.image oleh middleware router
            const { image } = req.body; 

            try {
                const updated = await PromoModel.findOneAndUpdate(
                    { _id, isDeleted: false },
                    { image : image }, // Menyimpan URL ke field 'image'
                    { new: true }
                );

                if (!updated) {
                    // ✅ KOREKSI: Ganti "Room not found" menjadi "Promo not found"
                    return res.status(404).json({ success: false, message: "Promo not found" });
                }

                return res.status(200).json({
                    requestId: uuidv4(),
                    success: true,
                    // ✅ KOREKSI: Pesan sukses lebih spesifik
                    message: "Promo image updated successfully", 
                    data: updated,
                });
            } catch (err: any) {
                res.status(500).json({ success: false, message: err.message });
            }
    }

    static async AddBackground(req: Request, res: Response) {

        const { _id } = req.params;
        // Asumsi: URL background diinject ke req.body.background oleh middleware router
        const { background } = req.body; 

        try {
            const updated = await PromoModel.findOneAndUpdate(
                { _id, isDeleted: false },
                { backgroundImage : background }, // Menyimpan URL ke field 'backgroundImage'
                { new: true }
            );

            if (!updated) {
                // ✅ KOREKSI: Ganti "Room not found" menjadi "Promo not found"
                return res.status(404).json({ success: false, message: "Promo not found" });
            }

            return res.status(200).json({
                requestId: uuidv4(),
                success: true,
                // ✅ KOREKSI: Pesan sukses lebih spesifik
                message: "Promo background updated successfully", 
                data: updated,
            });
        } catch (err: any) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    /**
     * @description Mengubah status aktif/tidak aktif event
     * @route PATCH /api/event/:id/status
     */
    static async ToggleStatus(req: Request, res: Response) {
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
            const promo = await PromoModel.findById(id);
            
            if (!promo)
                return res.status(404).json({
                    success: false,
                    message: "Promo tidak ditemukan",
                });

            // Update status aktif
            promo.isActive = isActive;
            // disable validation if you don't want to re-validate required fields:
            await promo.save({ validateBeforeSave: false });


            return res.status(200).json({
                requestId: uuidv4(),
                success: true,
                message: `Toggle status : ${isActive ? 'Aktif' : 'Nonaktif'} , info : ( ${promo.endDate < new Date() ? 'Sudah Tidak Berlaku' : 'Masih berlaku'} )`,
                data: promo,
            });
        } catch (err: any) {
            console.error('❌ Error toggle event status:', err);
            if (err instanceof mongoose.Error.ValidationError) {
                return res.status(400).json({ success: false, message: err.message });
            }
            res.status(500).json({ success: false, message: err.message });
        }
    }


    static async updatePromo(req: Request, res: Response) {
        try {
        const { id } = req.params
        const updateData = req.body

        if (!id) {
            return res.status(400).json({
            success: false,
            message: 'ID promo wajib diisi',
            })
        }

        if (!updateData || typeof updateData !== 'object') {
            return res.status(400).json({
            success: false,
            message: 'Data promo tidak valid',
            })
        }

        // ✅ Filter hanya field yang dikirim & tidak undefined
        const filteredData: Record<string, any> = {}
        for (const [key, value] of Object.entries(updateData)) {
            if (value !== undefined && value !== '') {
            filteredData[key] = value
            }
        }

        // ✅ Update hanya field yang dikirim (tanpa menimpa data lama)
        const updatedPromo = await PromoModel.findByIdAndUpdate(
            id,
            { $set: filteredData },
            { new: true } // mengembalikan data terbaru
        )

        if (!updatedPromo) {
            return res.status(404).json({
            success: false,
            message: 'Promo tidak ditemukan',
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Promo berhasil diperbarui',
            data: updatedPromo,
        })
        } catch (error: any) {
        console.error('❌ Error update promo:', error)
        return res.status(500).json({
            success: false,
            message: error.message || 'Gagal memperbarui promo',
        })
        }
    }
          
    /**
     * @description Hapus promo berdasarkan ID
     * @route DELETE /campaign/promo/:id
     */
    static async DeletePromo(req: Request, res: Response) {
        const { id } = req.params;

        try {
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
            success: false,
            message: "ID promo tidak valid",
            });
        }

        // ✅ Pilihan 1: Hard Delete (hapus total)
        //   const deletedPromo = await PromoModel.findByIdAndDelete(id);

                // 🧩 Update field isDeleted
        const updatedPromo = await PromoModel.findByIdAndUpdate(
            id,
            { isDeleted: true, updatedAt: new Date() },
            { new: true }
        );

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

        } catch (error: any) {
        console.error("❌ Error delete promo:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Terjadi kesalahan saat menghapus promo",
        });
        }
    }

}
