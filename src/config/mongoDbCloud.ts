import mongoose from "mongoose";
import dotenv from "dotenv";


// Memuat variabel lingkungan dari file .env
dotenv.config();

// URI MongoDB dari environment variable
const mongoURI: string = process.env.MongoDB_cloud || "";
const mongoUser: string = process.env.MongoDB_user || "";
const mongoPass: string = process.env.MongoDB_pass || "";

// console.log(" Env : ", process.env.MongoDB_cloud);

if (!mongoURI) {
  throw new Error("MongoDB URI tidak ditemukan di environment variables.");
}

// Fungsi untuk menginisialisasi koneksi
export const connectToMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(mongoURI, {
        user: mongoUser,
        pass: mongoPass,
    });
    console.log("MongoDB berhasil terhubung.");
  } catch (error) {
    console.error("Gagal terhubung ke MongoDB:", error);
    process.exit(1); // Keluar dengan kode error
  }
};

// Event handler untuk koneksi
const db = mongoose.connection;
db.on("error", (err) => {
  console.error("Error pada koneksi MongoDB:", err);
});

db.once("open", () => {
  console.log("Koneksi ke MongoDB telah terbuka.");
});

export default db;
