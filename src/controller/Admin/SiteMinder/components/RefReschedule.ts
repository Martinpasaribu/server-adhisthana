
// Helper function untuk generate date range

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
                        await DeletedDataALL(rescheduleBooking);

                        BookingMain = true;


                    }
                    
                    // Jika key tidak sama berarti ini booking reschedulenya 

                    else if (Booking.reschedule.key_reschedule != id){


                        // Hapus data booking reschedulenya 

                        await DeletedDataALL(Booking.reschedule.key_reschedule);

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



export const DeletedDataALL = async (id: any ) => {

        await TransactionModel.updateMany(
            { bookingId: id },
            { isDeleted: true }
        );
        
        await ShortAvailableModel.updateMany(
            { transactionId: id },
            { isDeleted: true }
        );

        await BookingModel.updateMany(
            { orderId: id },
            { isDeleted: true }
        );

        await RoomStatusModel.updateMany(
            { id_Trx: id },
            { isDeleted: true }
        );

}