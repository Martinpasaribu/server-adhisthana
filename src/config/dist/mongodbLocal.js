"use strict";
exports.__esModule = true;
var dotenv_1 = require("dotenv");
dotenv_1["default"].config();
var mongoDb;
// export async function connectToDatabase(): Promise<void> {
//     const url: string = process.env.MongoDB_cloud || '';
//     const client = new MongoClient(url);
//     try {
//         await client.connect();
//         mongoDb = client.db("Data_Main");
//         console.log("MongoDB connected successfully");
//     } catch (error) {
//         console.error("Error connecting to MongoDB:", error);
//         throw error;
//     }
// }
// export async function connectToDatabase(){
//     const  url: string = process.env.MongoDB_Local || '';
//     const  client = new MongoClient(url);
//     mongoDb = client.db("Database_Mari_Belajar(Main_Server)")
//     console.log("mongodb connected successfully")
// }
// Fungsi untuk menghubungkan ke database menggunakan mongoose
// export async function connectToDatabase(): Promise<void> {
//     const url: string = process.env.MongoDB_Local || '';
//         const dbName = "Database_TestAdhisthana(Main_Server)";
//         const fullUrl = `${url}/${dbName}`
//     try {
//         await mongoose.connect(fullUrl);
//         console.log("MongoDB connected successfully with mongoose");
//     } catch (error) {
//         console.error("Error connecting to MongoDB:", error);
//         throw error;
//     }
// }
