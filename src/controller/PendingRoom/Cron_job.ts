
import cron  from 'node-cron'
import { PendingRoomModel } from '../../models/PendingRoom/models_PendingRoom';
import { ShortAvailableModel } from '../../models/ShortAvailable/models_ShortAvailable';
import { TransactionModel } from '../../models/Transaction/models_transaksi';
import { BookingModel } from '../../models/Booking/models_booking';
import { RoomStatusModel } from '../../models/RoomStatus/models_RoomStatus';

cron.schedule('*/1 * * * *', async () => {

        try {
                    
            const nowUTC = new Date(); // Waktu sekarang UTC server

            // Konversi UTC ke WIB (UTC + 7 jam)
            const wibOffset = 7 * 60 * 60 * 1000; // Offset WIB dalam milidetik (7 jam)
            const wibTime = new Date(nowUTC.getTime() + wibOffset);

            // Format WIB untuk disimpan (contoh: '2025-01-27 15:00:00')
          
            const now = wibTime.toISOString().replace("T", " ").split(".")[0] + " GMT+0700 (WIB)";


                // Ambil semua data yang lockedUntil <= sekarang
                const expiredRooms = await PendingRoomModel.find({
                  lockedUntil: { $lte: now },
                  isDeleted: false,
                }).select('bookingId'); // Hanya ambil bookingId

                
            // Ambil hanya ID unik dari expiredRooms
            const uniqueBookingIds = [...new Set(expiredRooms.map((item) => item.bookingId.toString()))];

            console.log('Booking ID yang expired:', uniqueBookingIds);

            // Cari ID yang masih aktif di ShortAvailableModel
            // cari cara yang lebih effesian
            const existingShorts = await ShortAvailableModel.find(
              { transactionId: { $in: uniqueBookingIds }, isDeleted: false },
              'transactionId' // hanya ambil id-nya
            );

            // Ambil hanya ID dari hasil query ShortAvailable
            const blockedIds = existingShorts.map((item) => item.transactionId.toString());

            // Filter ID yang tidak muncul di blockedIds
            const deletableIds = uniqueBookingIds.filter((id) => !blockedIds.includes(id));

            console.log('Booking ID yang BOLEH dihapus:', deletableIds);




              // Jalankan proses penghapusan data lain berdasarkan bookingId
              // for (const id of uniqueBookingIds) {
              //   try {
              //     await DeletedBookingTransaction(id);
              //     console.log(`Sukses hapus transaksi terkait BookingID: ${id}`);
              //   } catch (err) {
              //     console.error(`Gagal hapus transaksi BookingID ${id}:`, (err as Error).message);
              //   }
              // }



              if(deletableIds.length > 0){

                await Promise.all(
                  deletableIds.map(async (id) => {
                    try {

                      await DeletedBookingTransaction(id);
                      await DeletePendingRoomPermanently(id);

                      console.log(`Sukses hapus transaksi terkait BookingID: ${id}`);
                    } catch (err) {
                      console.error(`Gagal hapus transaksi BookingID ${id}:`, (err as Error).message);
                    }
                  })
                );

              }
              

              console.log("Proses pembersihan stok dan data selesai.");

        } catch (error) {
          
            console.error("Error saat menjalankan cron job PendingRoom:", error);

        }

  });

   const DeletedBookingTransaction = async ( id : any) => {

      try {
        
        let ShortAvailable ;
        let Transaction ;
        let Booking;


        Transaction = await TransactionModel.findOneAndUpdate({bookingId :  id},{ isDeleted: false },{ new: true, runValidators: true });
      
        if (!Transaction) {

            throw new Error('Transaction not found.');
        }
        await TransactionModel.updateMany(
          { bookingId: id },
          { isDeleted: true }
        );

        Booking = await BookingModel.findOneAndUpdate({orderId :  id},{ isDeleted: false },{ new: true, runValidators: true });
      
        if (!Booking) {
          throw new Error('Booking not found.');
        }
        await BookingModel.updateMany(
          { orderId: id },
          { isDeleted: true }
        );

        console.log(`Successfully Deleted Transaction : ${Transaction.name} `);


      } catch (error) {
        

        const message =  (error as Error).message

        throw new Error(`Error : ${message} `);
        
      }

  }


  export const DeletePendingRoomPermanently = async (bookingId: string) => {
    try {
      const pendingData = await PendingRoomModel.findOne({ bookingId });
  
      if (!pendingData) {
        throw new Error('PendingRoom data not found.');
      }
  
      // Cari semua data yang akan dihapus
      const pendingRoomsToDelete = await PendingRoomModel.find({ bookingId });
      const roomStatusesToDelete = await RoomStatusModel.find({ id_Trx: bookingId });
  
      console.log('🔍 PendingRoom yang akan dihapus:', pendingRoomsToDelete);
      console.log('🔍 RoomStatus yang akan dihapus:', roomStatusesToDelete);
  
      // Hapus datanya setelah ditemukan
      await Promise.all([
        PendingRoomModel.deleteMany({ bookingId }),
        RoomStatusModel.deleteMany({ id_Trx: bookingId })
      ]);
  
      console.log(`✅ Data dengan bookingId ${bookingId} berhasil dihapus secara permanen.`);
  
      return { 
        message: 'Success delete permanently', 
        bookingId, 
        deletedPendingRooms: pendingRoomsToDelete,
        deletedRoomStatuses: roomStatusesToDelete 
      };
  
    } catch (error) {
      const message = (error as Error).message;
      console.error(`❌ Error saat menghapus PendingRoom: ${message}`);
      throw new Error(`Error deleting PendingRoom: ${message}`);
    }
  };
  