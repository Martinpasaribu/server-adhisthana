import express, { Request, Response, NextFunction } from "express";
import { upload, uploadImage, uploadTipe2 } from "../../../router/ImageKit";
import { EventController } from "../controller/controllers_event";


const EventRouter: express.Router = express.Router();



EventRouter.get("/", EventController.GetEvent );
EventRouter.get("/client", EventController.GetEventForClient );

EventRouter.post("/", EventController.AddEvent )

EventRouter.post("/image/:_id", uploadTipe2,
    async (req: Request, res: Response, next: NextFunction) => {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        try {
            const uploadedImageUrl = await uploadImage(req.file);
            req.body.image = uploadedImageUrl; // Inject URL untuk controller
            next();
        } catch (err) {
            // ✅ KOREKSI: Pesan error lebih spesifik
            console.error("❌ Error upload main event image:", err); 
            return res.status(500).json({ error: "Gagal upload gambar" });
        }
    },
    EventController.AddImage
);

EventRouter.post("/background/:_id", uploadTipe2,
    async (req: Request, res: Response, next: NextFunction) => {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        try {
            const uploadedImageUrl = await uploadImage(req.file);
            req.body.background = uploadedImageUrl; // Inject URL untuk controller
            next();
        } catch (err: any) {
            // ✅ KOREKSI: Pesan error lebih spesifik
            console.error("❌ Error upload background image:", err); 
            return res.status(500).json({ success: false, message: err.message });
        }
    },
    EventController.AddBackground
);


// 🔹 Ubah status aktif/nonaktif
EventRouter.patch('/:id/status', EventController.ToggleStatus);
EventRouter.patch('/update/:id', EventController.updateEvent)


// DELETE promo
EventRouter.delete("/:id", EventController.DeleteEvent);

EventRouter.get("/detail-by-code/:code", EventController.GetEventByCode);


export default EventRouter;