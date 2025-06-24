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
exports.initializeSocket = exports.io = void 0;
const socket_io_1 = require("socket.io");
const models_admin_1 = __importDefault(require("../models/Admin/models_admin"));
const onlineUsers = {};
const initializeSocket = (server) => {
    exports.io = new socket_io_1.Server(server, {
        cors: {
            origin: [
                "http://localhost:3000",
                "http://localhost:3001",
                "https://adhistahan.vercel.app"
            ],
            methods: ["GET", "POST"],
            credentials: true
        }
    });
    exports.io.on('connection', (socket) => {
        console.log('Socket connected:', socket.id);
        socket.on('user-online', (username) => {
            onlineUsers[username] = socket.id;
            console.log('🟢 User online:', username);
            exports.io.emit('update-online-users', Object.keys(onlineUsers));
            // ✅ Notifikasi ke admin kalau user baru login
            exports.io.emit('user-joined', username);
        });
        socket.on('user-offline', (username) => __awaiter(void 0, void 0, void 0, function* () {
            delete onlineUsers[username];
            console.log('🔴 User offline:', username);
            const lastSeen = yield models_admin_1.default.findOneAndUpdate({ username }, { lastSeen: new Date() }, { new: true });
            if (!lastSeen) {
                console.warn('❌ Gagal update lastSeen, username tidak ditemukan:', username);
            }
            exports.io.emit('update-online-users', Object.keys(onlineUsers));
        }));
        socket.on('disconnect', () => {
            const username = Object.keys(onlineUsers).find((id) => onlineUsers[id] === socket.id);
            if (username) {
                delete onlineUsers[username];
                exports.io.emit('update-online-users', Object.keys(onlineUsers));
                // ✅ Simpan lastSeen juga di sini (opsional)
                models_admin_1.default.findOneAndUpdate({ username }, {
                    lastSeen: new Date()
                }).catch(console.error);
            }
        });
    });
};
exports.initializeSocket = initializeSocket;
