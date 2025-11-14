
import ImageKit from 'imagekit';
import multer from "multer";
import dotenv from 'dotenv';



dotenv.config();



const imagekit = new ImageKit({
    publicKey: `${process.env.publicKey}`,
    privateKey: `${process.env.privateKey}`,
    urlEndpoint: `${process.env.urlEndpoint}`,
   
});


export const  uploadImage =  (file: Express.Multer.File): Promise<string> => {
    return new Promise((resolve, reject) => {
        
        try {
            const response = imagekit.upload({
                file: file.buffer,
                fileName: file.originalname,
                folder: 'dbTestAdhisthana',
            }, (error, result) => {
                if (error) {
                    reject(error); // Menolak promise jika ada error
                } else {
                    resolve(result?.url || ""); // Menggunakan optional chaining untuk menghindari null
                }
            });
            console.log('File berhasil diupload:', response);
        } catch (error) {
            console.error('Error uploading file:', error);
        }

    });
};


const storage = multer.memoryStorage();

export const upload = multer({ 
    storage: storage,
    limits: { fileSize: 25 * 1024 * 1024 }, // Maksimal 25MB
}).fields([
    { name: "image", maxCount: 5 },
    { name: "optionImage", maxCount: 5 },
    { name: "correctAnswerImage", maxCount: 5 },
    { name: "imagePoster", maxCount: 5 },
    { name: "imageShort", maxCount: 5 },
]);



export const uploadTipe2 = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // maksimal 25MB
}).single("image"); // 👉 hanya untuk 1 file


