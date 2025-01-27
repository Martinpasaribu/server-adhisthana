
import cron  from 'node-cron'
import { PendingRoomModel } from '../../models/PendingRoom/models_PendingRoom';

cron.schedule('*/2 * * * *', async () => {
    
  const nowUTC = new Date(); // Waktu sekarang UTC server

  // Konversi UTC ke WIB (UTC + 7 jam)
  const wibOffset = 7 * 60 * 60 * 1000; // Offset WIB dalam milidetik (7 jam)
  const wibTime = new Date(nowUTC.getTime() + wibOffset);

  // Format WIB untuk disimpan (contoh: '2025-01-27 15:00:00')
  const wibFormatted = wibTime.toISOString().replace("T", " ").split(".")[0] + " GMT+0700 (WIB)";
  
  const now = wibFormatted;


    await PendingRoomModel.updateMany(
      { lockedUntil: { $lte: now.toString() } },
      { isDeleted: true }
    );
    console.log("Kunci stok yang sudah habis waktu berhasil dibersihkan");
  });