
import { Request, Response, NextFunction  } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { EventModel } from '../models/models_event';
import crypto from "crypto";

export class EventController {

/**
     * @description Menambahkan data event utama ke database dan mengembalikan _id.
     * Ini adalah Langkah 1 dalam proses pembuatan event.
     * @route POST /api/event
     */
    static async GetEvent(req: Request, res: Response) {
        // Asumsi: Body request sudah berisi semua field data event
        // (title, type, description, code, discountType, discountValue, dll.)
        const eventData = req.body;

        try {
            // Membuat instance baru dari model
   
            const event = await EventModel.find({isDeleted:false})

            return res.status(201).json({
                requestId: uuidv4(),
                success: true,
                message: "event created successfully",
                // Penting: Pastikan _id tersedia di objek data yang dikembalikan
                data: event
            });
        } catch (err: any) {
            // Menangani error validasi atau database
            if (err instanceof mongoose.Error.ValidationError) {
                return res.status(400).json({ success: false, message: err.message });
            }
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async GetEventByCode(req: Request, res: Response) {
        // Asumsi: Body request sudah berisi semua field data event
        // (title, type, description, code, discountType, discountValue, dll.)
        const {code} = req.params;

        try {
            // Membuat instance baru dari model
    
            const event = await EventModel.findOne({code: code, isDeleted:false})

            return res.status(201).json({
                requestId: uuidv4(),
                success: true,
                message: "event created successfully",
                data: event
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

    static async GetEventForClient(req: Request, res: Response) {
        // Asumsi: Body request sudah berisi semua field data event
        // (title, type, description, code, discountType, discountValue, dll.)
        const eventData = req.body;

        try {
            // Membuat instance baru dari model
   
            const event = await EventModel.find({isDeleted:false, isActive: true})

            return res.status(201).json({
                requestId: uuidv4(),
                success: true,
                message: "event created successfully",
                // Penting: Pastikan _id tersedia di objek data yang dikembalikan
                data: event
            });
        } catch (err: any) {
            // Menangani error validasi atau database
            if (err instanceof mongoose.Error.ValidationError) {
                return res.status(400).json({ success: false, message: err.message });
            }
            res.status(500).json({ success: false, message: err.message });
        }
    }
    
    static async AddEvent(req: Request, res: Response) {
        const eventData = req.body;

        try {
        // 🔹 1. Generate secret key unik (seperti sebelumnya)
        const secretKey = crypto
            .createHash("sha256")
            .update(`${eventData.title}-${Date.now()}-${uuidv4()}`)
            .digest("hex")
            .slice(0, 12);

        // 🔹 2. Generate KODE EVENT (misal: EVNf2A9z)
        const randomChars = [...Array(5)]
            .map(() => {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("");

        const eventCode = `EVN${randomChars}`;

        // 🔹 3. Buat instance baru
        const newEvent = new EventModel({
            ...eventData,
            secret_key: secretKey,
            code: eventCode,
        });

        // 🔹 4. Simpan ke MongoDB
        const savedEvent = await newEvent.save();

        return res.status(201).json({
            requestId: uuidv4(),
            success: true,
            message: "Event created successfully",
            data: savedEvent.toObject(),
        });
        } catch (err: any) {
        if (err instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
            success: false,
            message: err.message,
            });
        }
        res.status(500).json({
            success: false,
            message: err.message,
        });
        }
    }
    
    static async AddImage(req: Request, res: Response) {

            const { _id } = req.params;
            // Asumsi: URL gambar diinject ke req.body.image oleh middleware router
            const { image } = req.body; 

            try {
                const updated = await EventModel.findOneAndUpdate(
                    { _id, isDeleted: false },
                    { image : image }, // Menyimpan URL ke field 'image'
                    { new: true }
                );

                if (!updated) {
                    // ✅ KOREKSI: Ganti "Room not found" menjadi "event not found"
                    return res.status(404).json({ success: false, message: "event not found" });
                }

                return res.status(200).json({
                    requestId: uuidv4(),
                    success: true,
                    // ✅ KOREKSI: Pesan sukses lebih spesifik
                    message: "event image updated successfully", 
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
            const updated = await EventModel.findOneAndUpdate(
                { _id, isDeleted: false },
                { backgroundImage : background }, // Menyimpan URL ke field 'backgroundImage'
                { new: true }
            );

            if (!updated) {
                // ✅ KOREKSI: Ganti "Room not found" menjadi "event not found"
                return res.status(404).json({ success: false, message: "event not found" });
            }

            return res.status(200).json({
                requestId: uuidv4(),
                success: true,
                // ✅ KOREKSI: Pesan sukses lebih spesifik
                message: "event background updated successfully", 
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
                    message: "Event ID wajib diisi",
                });

            // Validasi nilai boolean
            if (typeof isActive !== 'boolean')
                return res.status(400).json({
                    success: false,
                    message: "Field 'isActive' harus berupa boolean",
                });

            // Pastikan event ditemukan
            const event = await EventModel.findById(id);
            if (!event)
                return res.status(404).json({
                    success: false,
                    message: "Event tidak ditemukan",
                });

            // Update status aktif
            event.isActive = isActive;
            event.updatedAt = new Date();
            await event.save();

            return res.status(200).json({
                requestId: uuidv4(),
                success: true,
                message: `Event berhasil diubah menjadi ${isActive ? 'Aktif' : 'Nonaktif'}`,
                data: event,
            });
        } catch (err: any) {
            console.error('❌ Error toggle event status:', err);
            if (err instanceof mongoose.Error.ValidationError) {
                return res.status(400).json({ success: false, message: err.message });
            }
            res.status(500).json({ success: false, message: err.message });
        }
    }


    static async updateEvent(req: Request, res: Response) {
        try {
        const { id } = req.params
        const updateData = req.body

        if (!id) {
            return res.status(400).json({
            success: false,
            message: 'ID events wajib diisi',
            })
        }

        if (!updateData || typeof updateData !== 'object') {
            return res.status(400).json({
            success: false,
            message: 'Data events tidak valid',
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
        const updatedEvents = await EventModel.findByIdAndUpdate(
            id,
            { $set: filteredData },
            { new: true } // mengembalikan data terbaru
        )

        if (!updatedEvents) {
            return res.status(404).json({
            success: false,
            message: 'events tidak ditemukan',
            })
        }

        return res.status(200).json({
            success: true,
            message: 'events berhasil diperbarui',
            data: updatedEvents,
        })
        } catch (error: any) {
        console.error('❌ Error update events:', error)
        return res.status(500).json({
            success: false,
            message: error.message || 'Gagal memperbarui events',
        })
        }
    }

    /**
     * @description Hapus event berdasarkan ID
     * @route DELETE /campaign/event/:id
     */
    static async DeleteEvent(req: Request, res: Response) {
    const { id } = req.params;

    try {
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "ID event tidak valid",
        });
        }

        // ✅ Pilihan 1: Hard Delete (hapus total)
    //   const deletedevent = await eventModel.findByIdAndDelete(id);

            // 🧩 Update field isDeleted
        const updateEvent = await EventModel.findByIdAndUpdate(
        id,
        { isDeleted: true, updatedAt: new Date() },
        { new: true }
        );

        if (!updateEvent) {
        return res.status(404).json({
            success: false,
            message: "Event tidak ditemukan",
        });
        }

        return res.status(200).json({
        success: true,
        message: "Event berhasil dihapus",
        data: updateEvent,
        });

    } catch (error: any) {
        console.error("❌ Error delete event:", error);
        return res.status(500).json({
        success: false,
        message: error.message || "Terjadi kesalahan saat menghapus event",
        });
    }
    }

}
