
// Helper function untuk generate date range
import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;
import { ObjectId, isValidObjectId } from 'mongoose';

import { BookingModel } from "../../../../models/Booking/models_booking";
import { RoomStatusModel } from "../../../../models/RoomStatus/models_RoomStatus";
import { ShortAvailableModel } from "../../../../models/ShortAvailable/models_ShortAvailable";
import { TransactionModel } from "../../../../models/Transaction/models_transaksi";

export const RefReschedule =  async (id :  any | '') => {

    let Booking ;
    let BookingMain = false;
    let BookingReschedule = false;


        Booking = await BookingModel.findOne({ orderId: id, isDeleted: false });

    
            if (!Booking) {
                throw new Error(`Booking not found in Ref Reschedule :${id}`);
            }

                if (Booking.reschedule?.status) {

                    // Jika key sama berarti ini main booking-nya
                    if (Booking.reschedule.key_reschedule === id) {

                        // Menghapus data Booking Reschedule
                        const BookingRes = await BookingModel.find(
                            {
                                isDeleted: false,
                                "reschedule.key_reschedule": id
                            },
                            {
                                _id: 1,
                                reschedule: 1
                            }
                        );

                        if (!BookingRes || BookingRes.length !== 2) {
                            throw new Error(`Expected 2 bookings with key_reschedule: ${id}, got ${BookingRes.length}`);
                        }

                        // Pisahkan menjadi main dan reschedule
                        const mainBooking = BookingRes.find(item => item._id.toString() === id);
                        const rescheduleBooking = BookingRes.find(item => item._id.toString() !== id);

                        // Validasi hasil
                        if (!mainBooking || !rescheduleBooking) {
                            throw new Error("Could not separate bookings correctly");
                        }

                        // Output hasil
                        console.log("Main Booking:", mainBooking);
                        console.log("Reschedule Booking:", rescheduleBooking);


                        // Panggil fungsi untuk menghapus seluruh data rescheduleBooking terkait
                        await DeletedDataALLByIDTransaction(rescheduleBooking);

                        BookingMain = true;


                    }
                    
                    // Jika key tidak sama berarti ini booking reschedulenya 

                    else if (Booking.reschedule.key_reschedule != id){


                        // Hapus data booking reschedulenya 

                        await DeletedDataALLByIDTransaction(Booking.reschedule.key_reschedule);

                        // await DeletedDataALL(Booking.resc || "");
                        
                        BookingReschedule = true;
                    }

                    else {

                        console.log('Hasil deleted reschedule tidak diketahui');

                    }

                
                }   else {

                    console.log(" Tidak ada informasi reschedule")
                    BookingMain = true;
                }
        

    const response = {
        BookingMain, BookingReschedule
    }

    return response ;

};



export const DeletedDataALLByIDTransaction = async (id: any): Promise<boolean> => {
  try {
 
    const trxRes = await TransactionModel.updateMany(
      { bookingId: id },
      { isDeleted: true }
    );

    const shortRes = await ShortAvailableModel.updateMany(
      { transactionId: id },
      { isDeleted: true }
    );

    const bookingRes = await BookingModel.updateMany(
      { orderId: id },
      { isDeleted: true }
    );

    const roomStatusRes = await RoomStatusModel.updateMany(
      { id_Trx: id },
      { isDeleted: true }
    );

    console.log("🏝 TransactionModel updated:", trxRes.modifiedCount);
    console.log("🏝 ShortAvailableModel updated:", shortRes.modifiedCount);
    console.log("🏝 BookingModel updated:", bookingRes.modifiedCount);
    console.log("🏝 RoomStatusModel updated:", roomStatusRes.modifiedCount);
    console.log("🗽 ID Transaction Yang digunakan :", id,);

    return true;
  } catch (error) {
    console.error('❌ Error in DeletedDataALL:', error, 'and ID Use :', id);
    return false;
  }
};


export const DeletedDataALLByID = async (id: any): Promise<boolean> => {
  try {
    // Validasi dulu sebelum new ObjectId
    if (typeof id !== 'string' || !ObjectId.isValid(id)) {
      throw new Error("❌ Invalid ObjectId format");
    }

    const objectId = new ObjectId(id);

    // Ambil dulu booking untuk dapatkan orderId
    const booking = await BookingModel.findOne({ _id: objectId });
    if (!booking) {
      throw new Error("❌ Booking tidak ditemukan");
    }

    const id_Trx = booking.orderId;

    // Update booking
    const bookingRes = await BookingModel.updateOne(
      { _id: objectId },
      { isDeleted: true }
    );

    // Update lainnya berdasarkan orderId
    const trxRes = await TransactionModel.updateMany(
      { bookingId: id_Trx },
      { isDeleted: true }
    );

    const shortRes = await ShortAvailableModel.updateMany(
      { transactionId: id_Trx },
      { isDeleted: true }
    );

    const roomStatusRes = await RoomStatusModel.updateMany(
      { id_Trx: id_Trx },
      { isDeleted: true }
    );

    console.log("🏝 TransactionModel updated:", trxRes.modifiedCount);
    console.log("🏝 ShortAvailableModel updated:", shortRes.modifiedCount);
    console.log("🏝 BookingModel updated:", bookingRes.modifiedCount);
    console.log("🏝 RoomStatusModel updated:", roomStatusRes.modifiedCount);
    console.log(`✏️ ID Use : ${objectId}`);

    return true;

  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Error in DeletedDataALLByID:', error.message);
    } else {
      console.error('❌ Unknown error in DeletedDataALLByID:', error);
    }
    return false;
  }
};

export const FreeRoomAndAvailable = async (id: any): Promise<boolean> => {
  try {
    // Validasi dulu sebelum new ObjectId
    if (typeof id !== 'string' || !ObjectId.isValid(id)) {
      throw new Error("❌ Invalid ObjectId format");
    }

    const objectId = new ObjectId(id);

    // Ambil dulu booking untuk dapatkan orderId
    const booking = await BookingModel.findOne({ _id: objectId });
    if (!booking) {
      throw new Error("❌ Booking tidak ditemukan");
    }

    const id_Trx = booking.orderId;


    const shortRes = await ShortAvailableModel.updateMany(
      { transactionId: id_Trx },
      { isDeleted: true }
    );

    const roomStatusRes = await RoomStatusModel.updateMany(
      { id_Trx: id_Trx },
      { isDeleted: true }
    );

    console.log("🏝 ShortAvailableModel updated:", shortRes.modifiedCount);
    console.log("🏝 RoomStatusModel updated:", roomStatusRes.modifiedCount);
    console.log(`✏️ ID Use : ${objectId}`);

    return true;

  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Error in FreeRoomAndAvailable:', error.message);
    } else {
      console.error('❌ Unknown error in FreeRoomAndAvailable:', error);
    }
    return false;
  }
};
