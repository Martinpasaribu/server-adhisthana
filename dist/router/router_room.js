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
const index_1 = require("./ImageKit/index");
const controller_room_1 = require("../controller/Room/controller_room");
const index_2 = require("./ImageKit/index");
const RoomRouter = express_1.default.Router();
// RoomRouter.use(activityLogger);
RoomRouter.post("/addRoom", index_2.upload, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Hasil req by addRoom:', req.files);
    // Cek apakah file ada dalam req.files
    if (!req.files) {
        return next(); // Jika tidak ada file, lanjutkan ke RoomController
    }
    // Ambil file yang diunggah
    const imageFile = req.files['image'] || [];
    const imagePoster = req.files['imagePoster'] || [];
    const imageShort = req.files['imageShort'] || [];
    // Cek apakah ada file yang diunggah
    if (imageFile.length === 0 && imagePoster.length === 0 && imageShort.length === 0) {
        console.log('Tidak ada file yang diunggah!');
        return res.status(400).json({ message: "Harap unggah gambar." });
    }
    try {
        // Mengunggah gambar dan menunggu hasilnya
        const uploadedImageUrls = yield Promise.all(imageFile.map(index_1.uploadImage));
        const uploadedImagePosterUrls = yield Promise.all(imagePoster.map(index_1.uploadImage));
        const uploadedImageShortUrls = yield Promise.all(imageShort.map(index_1.uploadImage));
        // Masukkan URL gambar yang diunggah ke dalam req.body
        if (uploadedImagePosterUrls.length > 0) {
            req.body.imagePoster = uploadedImagePosterUrls[0]; // Ambil URL poster pertama
        }
        if (uploadedImageShortUrls.length > 0) {
            req.body.imageShort = uploadedImageShortUrls[0]; // Ambil URL poster pertama
        }
        if (uploadedImageUrls.length > 0) {
            req.body.image = uploadedImageUrls.map((url, index) => {
                var _a, _b;
                return ({
                    row: ((_b = (_a = req.body.image) === null || _a === void 0 ? void 0 : _a[index]) === null || _b === void 0 ? void 0 : _b.row) || "",
                    image: url || "",
                });
            });
        }
        // Lanjutkan ke controller addRoom
        next();
    }
    catch (error) {
        console.error("Error uploading images:", error);
        return res.status(500).json({ error: "Gagal mengunggah gambar." });
    }
}), controller_room_1.RoomController.addRoom);
// semantic meaning
// Add Room
RoomRouter.get("/getRoom", controller_room_1.RoomController.getRoom);
RoomRouter.get("/getRoomByParams/:id", controller_room_1.RoomController.getRoomByParams);
RoomRouter.delete("/deleteRoomPermanent/:id", controller_room_1.RoomController.deletedRoomPermanent);
RoomRouter.get("/updatePacketAll/:id", controller_room_1.RoomController.updatePacketAll);
RoomRouter.patch("/updateRoomPart/:id", controller_room_1.RoomController.updateRoomPart);
// RoomRouter.delete("/deletedSoftRoom/:id", RoomController.deletedSoftRoom)
exports.default = RoomRouter;
