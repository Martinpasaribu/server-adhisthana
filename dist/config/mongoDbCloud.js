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
exports.connectToMongoDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
// Memuat variabel lingkungan dari file .env
dotenv_1.default.config();
// URI MongoDB dari environment variable
const mongoURI = process.env.MongoDB_cloud || "";
const mongoUser = process.env.MongoDB_user || "";
const mongoPass = process.env.MongoDB_pass || "";
// console.log(" Env : ", process.env.MongoDB_cloud);
if (!mongoURI) {
    throw new Error("MongoDB URI tidak ditemukan di environment variables.");
}
// Fungsi untuk menginisialisasi koneksi
const connectToMongoDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(mongoURI, {
            user: mongoUser,
            pass: mongoPass,
        });
        console.log("MongoDB berhasil terhubung.");
    }
    catch (error) {
        console.error("Gagal terhubung ke MongoDB:", error);
        process.exit(1); // Keluar dengan kode error
    }
});
exports.connectToMongoDB = connectToMongoDB;
// Event handler untuk koneksi
const db = mongoose_1.default.connection;
db.on("error", (err) => {
    console.error("Error pada koneksi MongoDB:", err);
});
db.once("open", () => {
    console.log("Koneksi ke MongoDB telah terbuka.");
});
exports.default = db;
