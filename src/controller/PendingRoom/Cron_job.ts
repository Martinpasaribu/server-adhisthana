
import cron  from 'node-cron'
import { PendingRoomModel } from '../../models/PendingRoom/models_PendingRoom';

cron.schedule('*/2 * * * *', async () => {
    
    const nowWIB = new Date();

    // Pastikan zona waktu sesuai WIB
    const options = { timeZone: "Asia/Jakarta" };
    const now = new Date(nowWIB.toLocaleString("en-US", options));


    await PendingRoomModel.updateMany(
      { lockedUntil: { $lte: now.toString() } },
      { isDeleted: true }
    );
    console.log("Kunci stok yang sudah habis waktu berhasil dibersihkan");
  });