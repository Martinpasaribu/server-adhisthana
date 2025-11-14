import express, { Request, Response, NextFunction } from "express";
import { upload, uploadImage, uploadTipe2 } from "../../../router/ImageKit";
import { PromoController } from "../controller/controllers_promo";


const PromoRouter: express.Router = express.Router();



PromoRouter.get("/", PromoController.GetPromo );
PromoRouter.get("/client", PromoController.GetPromoForClient );

PromoRouter.post("/", PromoController.AddPromo )

PromoRouter.post("/image/:_id", uploadTipe2,
    async (req: Request, res: Response, next: NextFunction) => {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        try {
            const uploadedImageUrl = await uploadImage(req.file);
            req.body.image = uploadedImageUrl; // Inject URL untuk controller
            next();
        } catch (err) {
            // ✅ KOREKSI: Pesan error lebih spesifik
            console.error("❌ Error upload main promo image:", err); 
            return res.status(500).json({ error: "Gagal upload gambar" });
        }
    },
    PromoController.AddImage
);

PromoRouter.post("/background/:_id", uploadTipe2,
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
    PromoController.AddBackground
);

// 🔹 Ubah status aktif/nonaktif
PromoRouter.put('/:id/status', PromoController.ToggleStatus);
PromoRouter.patch('/update/:id', PromoController.updatePromo)

// DELETE promo
PromoRouter.delete("/:id", PromoController.DeletePromo);

PromoRouter.get("/detail-by-code/:code", PromoController.GetPromoByCode);


// GET promo by code
PromoRouter.get('/search/:code', PromoController.SearchPromoByCode)


export default PromoRouter;