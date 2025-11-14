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
const express_1 = __importDefault(require("express"));
const ImageKit_1 = require("../../../router/ImageKit");
const controllers_event_1 = require("../controller/controllers_event");
const EventRouter = express_1.default.Router();
EventRouter.get("/", controllers_event_1.EventController.GetEvent);
EventRouter.get("/client", controllers_event_1.EventController.GetEventForClient);
EventRouter.post("/", controllers_event_1.EventController.AddEvent);
EventRouter.post("/image/:_id", ImageKit_1.uploadTipe2, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file)
        return res.status(400).json({ error: "No file uploaded" });
    try {
        const uploadedImageUrl = yield (0, ImageKit_1.uploadImage)(req.file);
        req.body.image = uploadedImageUrl; // Inject URL untuk controller
        next();
    }
    catch (err) {
        // ✅ KOREKSI: Pesan error lebih spesifik
        console.error("❌ Error upload main event image:", err);
        return res.status(500).json({ error: "Gagal upload gambar" });
    }
}), controllers_event_1.EventController.AddImage);
EventRouter.post("/background/:_id", ImageKit_1.uploadTipe2, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file)
        return res.status(400).json({ error: "No file uploaded" });
    try {
        const uploadedImageUrl = yield (0, ImageKit_1.uploadImage)(req.file);
        req.body.background = uploadedImageUrl; // Inject URL untuk controller
        next();
    }
    catch (err) {
        // ✅ KOREKSI: Pesan error lebih spesifik
        console.error("❌ Error upload background image:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
}), controllers_event_1.EventController.AddBackground);
// 🔹 Ubah status aktif/nonaktif
EventRouter.patch('/:id/status', controllers_event_1.EventController.ToggleStatus);
EventRouter.patch('/update/:id', controllers_event_1.EventController.updateEvent);
// DELETE promo
EventRouter.delete("/:id", controllers_event_1.EventController.DeleteEvent);
EventRouter.get("/detail-by-code/:code", controllers_event_1.EventController.GetEventByCode);
exports.default = EventRouter;
