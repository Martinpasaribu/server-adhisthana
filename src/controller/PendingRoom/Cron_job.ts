
import cron  from 'node-cron'
import { PendingRoomModel } from '../../models/PendingRoom/models_PendingRoom';

cron.schedule('*/5 * * * *', async () => {
    
    const now = new Date();

    await PendingRoomModel.updateMany(
      { lockedUntil: { $lte: now } },
      { isDeleted: true }
    );
    console.log("Kunci stok yang sudah habis waktu berhasil dibersihkan");
  });