import { SetAvailableCount } from "../../../Booking/SetAvailableCounts";
import { PendingRoomController } from "../../../PendingRoom/Controller_PendingRoom";
import { FilterAvailable, FilterAvailable02 } from "../../../ShortAvailable/FilterAvailableRoom";

interface ReservationModel {
    checkIn: Date,
    checkOut: Date,
    products: Room[]
}

interface Room {
    roomId: string;
    quantity: number;
    price: number;
    ota: number;
    priceTotal: number;
    name: string;
    image: string;
}

class reservationService {

    // Fungsi untuk membuat Data Transaksi 
    async createReservation({products , checkIn, checkOut} : ReservationModel) {

            const RoomCanUse = await FilterAvailable02(checkIn, checkOut);
        
            // Ambil hanya data room yang sesuai dari RoomCanUse berdasarkan roomId di BookingReq
            const roomDetails = RoomCanUse.filter((room: any) => 
                products.some((r: { roomId: any }) => r.roomId.toString() === room._id.toString())
            );

            if (!roomDetails) {
                // return res.status(400).json({ status: 'error', message: `Filter Room Available not found` });
                throw new Error('Filter Room Available not found');
            }


            // Validate again room availability
            for (const roomBooking of products) {
                const room = roomDetails.find(r => r._id.toString() === roomBooking.roomId.toString());

                if (!room) {
                    // return res.status(400).json({ status: 'error', message: `Room with ID ${roomBooking.roomId} not found` });
                    throw new Error(`Room with ID ${roomBooking.roomId} not found`);
                }

                // Check if the room is sold out or requested quantity exceeds availability
                if (room.available <= 0) {
                    // return res.status(400).json({ status: 'error', message: `Room with ID ${roomBooking.roomId} is sold out` });
                    throw new Error(`Room with ID ${roomBooking.roomId} is sold out`);
                }
                

                if (roomBooking.quantity > room.available) {
                    // return res.status(400).json({ 
                    //     status: 'error', 
                    //     message: `Room with ID ${roomBooking.roomId} has only ${room.available} available, but you requested ${roomBooking.quantity}` 
                    // });
                    throw new Error(`Room with ID ${roomBooking.roomId} has only ${room.available} available, but you requested ${roomBooking.quantity}`);
                }
            }

            // Filter Room dari req Booking dari ketersedia room dan menambahkan poerpty stock ketersedian room dengan range tanggal tersebut
            const RoomsAvailableCount = await SetAvailableCount(products, checkIn, checkOut);
            
            // Filter Is there a pending room?
            const availableRoomsWithoutPending = await PendingRoomController.FilterForUpdateVilaWithPending(RoomsAvailableCount,checkIn, checkOut)

            if(availableRoomsWithoutPending?.PendingRoom.length > 0) {
                // return res.status(400).json({ status: 'error', message: `Some of the rooms you select have already been purchased`, data :availableRoomsWithoutPending?.PendingRoom });
                throw new Error( `Some of the rooms you select have already been purchased ${JSON.stringify(availableRoomsWithoutPending?.PendingRoom)}`);
            }
            
            console.log(` hasil filter reservation dengan room pending : ${availableRoomsWithoutPending.PendingRoom}`)
        return availableRoomsWithoutPending;
    }


}

export const ReservationService = new reservationService();
