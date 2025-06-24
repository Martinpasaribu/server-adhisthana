import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import AdminModel from '../models/Admin/models_admin';

interface OnlineUsersMap {
  [userId: string]: string;
}

export let io: SocketIOServer;
const onlineUsers: OnlineUsersMap = {};

export const initializeSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
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

  io.on('connection', (socket) => {
    
    console.log('Socket connected:', socket.id);

    socket.on('user-online', (username: string) => {

      onlineUsers[username] = socket.id;
      console.log('🟢 User online:', username);

      io.emit('update-online-users', Object.keys(onlineUsers));

      // ✅ Notifikasi ke admin kalau user baru login
      io.emit('user-joined', username);

    });

    socket.on('user-offline', async (username) => {
      delete onlineUsers[username];
      console.log('🔴 User offline:', username);

      const lastSeen = await AdminModel.findOneAndUpdate(
        { username },
        { lastSeen: new Date() },
        { new: true }
      );

      if (!lastSeen) {
        console.warn('❌ Gagal update lastSeen, username tidak ditemukan:', username);
      }

      io.emit('update-online-users', Object.keys(onlineUsers));
    });

   socket.on('disconnect', () => {
      const username = Object.keys(onlineUsers).find((id) => onlineUsers[id] === socket.id);
      if (username) {
        delete onlineUsers[username];
        io.emit('update-online-users', Object.keys(onlineUsers));

        // ✅ Simpan lastSeen juga di sini (opsional)
        AdminModel.findOneAndUpdate({username}, {
          lastSeen: new Date()
        }).catch(console.error);
      }
    });
  });
}
