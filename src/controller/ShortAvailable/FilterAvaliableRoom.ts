import RoomModel from "../../models/Room/models_room";
import { ShortAvailableModel } from "../../models/ShortAvailable/models_ShortAvailable";
import mongoose from 'mongoose';



export const FilterAvailable = async ( checkInDate: any , checkOutDate : any   ) => {

                    const In = new Date(checkInDate)
                    const Out = new Date(checkOutDate)

                    console.log("format checkin yang masuk:" , In )
                    console.log("format checkout yang masuk:" , Out )

                    // Query untuk mencari unavailable rooms
                    const unavailableRooms = await ShortAvailableModel.find({
                        status: "PAID",
                        $or: [
                            {
                                checkIn: { $lte: In.toISOString() },
                                checkOut: { $gte: Out.toISOString() },
                            },
                        ],
                    });
    
                    // console.log("Room yang sudah dibooking :" , unavailableRooms)
                    // console.log("format checkin:" , checkInDate.toISOString() )
                    // console.log("format checkout :" , checkOutDate.toISOString() )

                    const roomUsageCount: Record<string, number> = {};
    
                    unavailableRooms.forEach((transaction) => {
                        transaction.products.forEach((product: { roomId: string; quantity: number }) => {
                            const roomId = product.roomId.toString();
                            roomUsageCount[roomId] = (roomUsageCount[roomId] || 0) + product.quantity;
                        });
                    });
    
    
    
                    // Ambil semua room dari database
                    const allRooms = await RoomModel.find({ isDeleted: false });
    
                    // Filter room yang tersedia
                    const availableRooms = allRooms.map((room) => {
                            
                            const usedCount = roomUsageCount[room._id.toString()] || 0;
                            const availableCount = room.available - usedCount;
            
                            return {
                                ...room.toObject(),
                                availableCount: availableCount > 0 ? availableCount : 0,
                            };
                        }) .filter((room) => room.availableCount > 0);


                return availableRooms ;
}