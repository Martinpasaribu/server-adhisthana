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
exports.EventController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const models_event_1 = require("../models/models_event");
const crypto_1 = __importDefault(require("crypto"));
class EventController {
    /**
         * @description Menambahkan data event utama ke database dan mengembalikan _id.
         * Ini adalah Langkah 1 dalam proses pembuatan event.
         * @route POST /api/event
         */
    static GetEvent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // Asumsi: Body request sudah berisi semua field data event
            // (title, type, description, code, discountType, discountValue, dll.)
            const eventData = req.body;
            try {
                // Membuat instance baru dari model
                const event = yield models_event_1.EventModel.find({ isDeleted: false });
                return res.status(201).json({
                    requestId: (0, uuid_1.v4)(),
                    success: true,
                    message: "event created successfully",
                    // Penting: Pastikan _id tersedia di objek data yang dikembalikan
                    data: event
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
    static GetEventByCode(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // Asumsi: Body request sudah berisi semua field data event
            // (title, type, description, code, discountType, discountValue, dll.)
            const { code } = req.params;
            try {
                // Membuat instance baru dari model
                const event = yield models_event_1.EventModel.findOne({ code: code, isDeleted: false });
                return res.status(201).json({
                    requestId: (0, uuid_1.v4)(),
                    success: true,
                    message: "event created successfully",
                    data: event
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
    static GetEventForClient(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // Asumsi: Body request sudah berisi semua field data event
            // (title, type, description, code, discountType, discountValue, dll.)
            const eventData = req.body;
            try {
                // Membuat instance baru dari model
                const event = yield models_event_1.EventModel.find({ isDeleted: false, isActive: true });
                return res.status(201).json({
                    requestId: (0, uuid_1.v4)(),
                    success: true,
                    message: "event created successfully",
                    // Penting: Pastikan _id tersedia di objek data yang dikembalikan
                    data: event
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
    static AddEvent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const eventData = req.body;
            try {
                // 🔹 1. Generate secret key unik (seperti sebelumnya)
                const secretKey = crypto_1.default
                    .createHash("sha256")
                    .update(`${eventData.title}-${Date.now()}-${(0, uuid_1.v4)()}`)
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
                const newEvent = new models_event_1.EventModel(Object.assign(Object.assign({}, eventData), { secret_key: secretKey, code: eventCode }));
                // 🔹 4. Simpan ke MongoDB
                const savedEvent = yield newEvent.save();
                return res.status(201).json({
                    requestId: (0, uuid_1.v4)(),
                    success: true,
                    message: "Event created successfully",
                    data: savedEvent.toObject(),
                });
            }
            catch (err) {
                if (err instanceof mongoose_1.default.Error.ValidationError) {
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
        });
    }
    static AddImage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { _id } = req.params;
            // Asumsi: URL gambar diinject ke req.body.image oleh middleware router
            const { image } = req.body;
            try {
                const updated = yield models_event_1.EventModel.findOneAndUpdate({ _id, isDeleted: false }, { image: image }, // Menyimpan URL ke field 'image'
                { new: true });
                if (!updated) {
                    // ✅ KOREKSI: Ganti "Room not found" menjadi "event not found"
                    return res.status(404).json({ success: false, message: "event not found" });
                }
                return res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    success: true,
                    // ✅ KOREKSI: Pesan sukses lebih spesifik
                    message: "event image updated successfully",
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
                const updated = yield models_event_1.EventModel.findOneAndUpdate({ _id, isDeleted: false }, { backgroundImage: background }, // Menyimpan URL ke field 'backgroundImage'
                { new: true });
                if (!updated) {
                    // ✅ KOREKSI: Ganti "Room not found" menjadi "event not found"
                    return res.status(404).json({ success: false, message: "event not found" });
                }
                return res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    success: true,
                    // ✅ KOREKSI: Pesan sukses lebih spesifik
                    message: "event background updated successfully",
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
                        message: "Event ID wajib diisi",
                    });
                // Validasi nilai boolean
                if (typeof isActive !== 'boolean')
                    return res.status(400).json({
                        success: false,
                        message: "Field 'isActive' harus berupa boolean",
                    });
                // Pastikan event ditemukan
                const event = yield models_event_1.EventModel.findById(id);
                if (!event)
                    return res.status(404).json({
                        success: false,
                        message: "Event tidak ditemukan",
                    });
                // Update status aktif
                event.isActive = isActive;
                event.updatedAt = new Date();
                yield event.save();
                return res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    success: true,
                    message: `Event berhasil diubah menjadi ${isActive ? 'Aktif' : 'Nonaktif'}`,
                    data: event,
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
    static updateEvent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const updateData = req.body;
                if (!id) {
                    return res.status(400).json({
                        success: false,
                        message: 'ID events wajib diisi',
                    });
                }
                if (!updateData || typeof updateData !== 'object') {
                    return res.status(400).json({
                        success: false,
                        message: 'Data events tidak valid',
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
                const updatedEvents = yield models_event_1.EventModel.findByIdAndUpdate(id, { $set: filteredData }, { new: true } // mengembalikan data terbaru
                );
                if (!updatedEvents) {
                    return res.status(404).json({
                        success: false,
                        message: 'events tidak ditemukan',
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: 'events berhasil diperbarui',
                    data: updatedEvents,
                });
            }
            catch (error) {
                console.error('❌ Error update events:', error);
                return res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal memperbarui events',
                });
            }
        });
    }
    /**
     * @description Hapus event berdasarkan ID
     * @route DELETE /campaign/event/:id
     */
    static DeleteEvent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
                    return res.status(400).json({
                        success: false,
                        message: "ID event tidak valid",
                    });
                }
                // ✅ Pilihan 1: Hard Delete (hapus total)
                //   const deletedevent = await eventModel.findByIdAndDelete(id);
                // 🧩 Update field isDeleted
                const updateEvent = yield models_event_1.EventModel.findByIdAndUpdate(id, { isDeleted: true, updatedAt: new Date() }, { new: true });
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
            }
            catch (error) {
                console.error("❌ Error delete event:", error);
                return res.status(500).json({
                    success: false,
                    message: error.message || "Terjadi kesalahan saat menghapus event",
                });
            }
        });
    }
}
exports.EventController = EventController;
