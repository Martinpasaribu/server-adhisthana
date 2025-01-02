"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.uploadImage = void 0;
const imagekit_1 = __importDefault(require("imagekit"));
const multer_1 = __importDefault(require("multer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const imagekit = new imagekit_1.default({
    publicKey: `${process.env.publicKey}`,
    privateKey: `${process.env.privateKey}`,
    urlEndpoint: `${process.env.urlEndpoint}`,
});
const uploadImage = (file) => {
    return new Promise((resolve, reject) => {
        try {
            const response = imagekit.upload({
                file: file.buffer,
                fileName: file.originalname,
                folder: 'dbTestAdhisthana',
            }, (error, result) => {
                if (error) {
                    reject(error); // Menolak promise jika ada error
                }
                else {
                    resolve((result === null || result === void 0 ? void 0 : result.url) || ""); // Menggunakan optional chaining untuk menghindari null
                }
            });
            console.log('File berhasil diupload:', response);
        }
        catch (error) {
            console.error('Error uploading file:', error);
        }
    });
};
exports.uploadImage = uploadImage;
const storage = multer_1.default.memoryStorage();
exports.upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 25 * 1024 * 1024 }, // Maksimal 25MB
}).fields([
    { name: "image", maxCount: 5 },
    { name: "optionImage", maxCount: 5 },
    { name: "correctAnswerImage", maxCount: 5 },
    { name: "imagePoster", maxCount: 5 },
    { name: "imageShort", maxCount: 5 },
]);
