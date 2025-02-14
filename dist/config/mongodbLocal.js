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
exports.connectToDatabase = connectToDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let mongoDb;
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
function connectToDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        const url = process.env.MongoDB_Local || '';
        const dbName = "Database_TestAdhisthana(Main_Server)";
        const fullUrl = `${url}/${dbName}`;
        try {
            yield mongoose_1.default.connect(fullUrl);
            console.log("MongoDB connected successfully with mongoose");
        }
        catch (error) {
            console.error("Error connecting to MongoDB:", error);
            throw error;
        }
    });
}
