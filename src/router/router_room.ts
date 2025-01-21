import express, { Request, Response, NextFunction } from "express";

import { uploadImage } from "./ImageKit/index";

import { RoomController } from "../controller/Room/controller_room";
import { upload } from "./ImageKit/index";
import activityLogger from "../middleware/logActivity";

const RoomRouter: express.Router = express.Router();

// RoomRouter.use(activityLogger);


RoomRouter.post("/addRoom", upload, async (req: Request, res: Response, next: NextFunction) => {
    console.log('Hasil req by addRoom:', req.files); 

    // Cek apakah file ada dalam req.files
    if (!req.files) {
        return next(); // Jika tidak ada file, lanjutkan ke RoomController
    }
    
    // Ambil file yang diunggah
    const imageFile = (req.files as { [key: string]: Express.Multer.File[] })['image'] || [];
    const imagePoster = (req.files as { [key: string]: Express.Multer.File[] })['imagePoster'] || [];
    const imageShort = (req.files as { [key: string]: Express.Multer.File[] })['imageShort'] || [];

    // Cek apakah ada file yang diunggah
    if (imageFile.length === 0 && imagePoster.length === 0 && imageShort.length === 0) {
        console.log('Tidak ada file yang diunggah!');
        return res.status(400).json({ message: "Harap unggah gambar." });
    }

    try {
        // Mengunggah gambar dan menunggu hasilnya
        const uploadedImageUrls = await Promise.all(imageFile.map(uploadImage));
        const uploadedImagePosterUrls = await Promise.all(imagePoster.map(uploadImage));
        const uploadedImageShortUrls = await Promise.all(imageShort.map(uploadImage));

        // Masukkan URL gambar yang diunggah ke dalam req.body
        if (uploadedImagePosterUrls.length > 0) {
            req.body.imagePoster = uploadedImagePosterUrls[0]; // Ambil URL poster pertama
        }
        if (uploadedImageShortUrls.length > 0) {
            req.body.imageShort = uploadedImageShortUrls[0]; // Ambil URL poster pertama
        }

        if (uploadedImageUrls.length > 0) {
            req.body.image = uploadedImageUrls.map((url, index) => ({
                row: req.body.image?.[index]?.row || "",
                image: url || "",
            }));
        }


        // Lanjutkan ke controller addRoom
        next();

    } catch (error) {
        console.error("Error uploading images:", error); 
        return res.status(500).json({ error: "Gagal mengunggah gambar." });
    }
}, RoomController.addRoom);


// semantic meaning

// Add Room
RoomRouter.get("/getRoom", RoomController.getRoom)
RoomRouter.get("/getRoomByParams/:id", RoomController.getRoomByParams)
RoomRouter.delete("/deleteRoomPermanent/:id", RoomController.deletedRoomPermanent)

RoomRouter.get("/updatePacketAll/:id", RoomController.updatePacketAll)
RoomRouter.patch("/updateRoomPart/:id", RoomController.updateRoomPart)
RoomRouter.get("/getid-from-siteminder", RoomController.getIdToSiteMinder)
// RoomRouter.delete("/deletedSoftRoom/:id", RoomController.deletedSoftRoom)

export default RoomRouter;
