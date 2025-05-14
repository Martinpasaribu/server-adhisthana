import RoomModel from "../../models/Room/models_room";
import { ShortAvailableModel } from "../../models/ShortAvailable/models_ShortAvailable";
import mongoose from 'mongoose';



export const FilterAvailable = async ( checkInDate: any , checkOutDate : any   ) => {

                    const In = new Date(checkInDate)
                    const Out = new Date(checkOutDate)

                    // console.log("format checkin yang masuk:" , In )
                    // console.log("format checkout yang masuk:" , Out )

                    // Query untuk mencari unavailable rooms
                    const unavailableRooms = await ShortAvailableModel.find({
                        status: "PAID",
                        $or: [
                            {
                                checkIn: { $lte: Out.toISOString() },
                                checkOut: { $gte: In.toISOString() },
                            },
                        ],
                        isDeleted: false
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


                console.log('HIHIHIHIHIH :', availableRooms);

                return availableRooms ;
                // return `${In} and ${Out}` ;
}




// export const FilterAvailable02 = async (checkInDate: any, checkOutDate: any) => {
//     const In = new Date(checkInDate);
//     const Out = new Date(checkOutDate);

//     const unavailableRooms = await ShortAvailableModel.find({
//         status: "PAID",
//         $or: [
//             {
//                 checkIn: { $lte: Out.toISOString() },
//                 checkOut: { $gte: In.toISOString() },
//             },
//         ],
//         isDeleted: false,
//     });

//     const roomUsagePerDay: Record<string, Record<string, number>> = {}; // roomId => {dateStr => count}

//     unavailableRooms.forEach((transaction) => {
//         const checkIn = new Date(transaction.checkIn);
//         const checkOut = new Date(transaction.checkOut);

//         const current = new Date(checkIn);
//         while (current < checkOut) {
//             const dateStr = current.toISOString().split("T")[0];

//             transaction.products.forEach((product: { roomId: string; quantity: number }) => {
//                 const roomId = product.roomId.toString();

//                 if (!roomUsagePerDay[roomId]) roomUsagePerDay[roomId] = {};
//                 roomUsagePerDay[roomId][dateStr] = (roomUsagePerDay[roomId][dateStr] || 0) + product.quantity;
//             });

//             current.setDate(current.getDate() + 1);
//         }
//     });

//     const allRooms = await RoomModel.find({ isDeleted: false });

//     const isRoomAvailable: Record<string, boolean> = {};

//     allRooms.forEach((room) => {
//         let available = true;
//         const roomId = room._id.toString();

//         const temp = new Date(In);
//         while (temp < Out) {
//             const dateStr = temp.toISOString().split("T")[0];
//             const used = roomUsagePerDay[roomId]?.[dateStr] || 0;

//             if (used >= room.available) {
//                 available = false;
//                 break;
//             }

//             temp.setDate(temp.getDate() + 1);
//         }

//         isRoomAvailable[roomId] = available;
//     });

//     const availableRooms = allRooms.filter((room) =>
//         isRoomAvailable[room._id.toString()]
//     );

//     // return {
//     //     data_yg_tidak_ada: unavailableRooms,
//     //     jumlah_yg_tidak_ada: unavailableRooms.length,
//     //     jumlah_pembagian_data: roomUsagePerDay,
//     //     data_yg_ada: availableRooms,
//     //     tanggal_range: `${In.toISOString()} - ${Out.toISOString()}`,
//     // };

//     return availableRooms

// };

// Final Function

export const FilterAvailable02 = async (checkInDate: any, checkOutDate: any) => {
    
    const In = new Date(checkInDate);
    const Out = new Date(checkOutDate);

    // Ambil transaksi kamar yang tidak tersedia
    const unavailableRooms = await ShortAvailableModel.find({
        status: "PAID",
        $or: [
            {
                checkIn: { $lte: Out.toISOString() },
                checkOut: { $gte: In.toISOString() },
            },
        ],
        isDeleted: false,
    });

    // Simpan pemakaian kamar per hari per roomId
    const roomUsagePerDay: Record<string, Record<string, number>> = {};

    unavailableRooms.forEach((transaction) => {

        const checkIn = new Date(transaction.checkIn);
        const checkOut = new Date(transaction.checkOut);

        const current = new Date(checkIn);
        
        while (current < checkOut) {
            const dateStr = current.toISOString().split("T")[0];

            transaction.products.forEach((product: { roomId: string; quantity: number }) => {
                const roomId = product.roomId.toString();

                if (!roomUsagePerDay[roomId]) roomUsagePerDay[roomId] = {};
                roomUsagePerDay[roomId][dateStr] = (roomUsagePerDay[roomId][dateStr] || 0) + product.quantity;
            });

            current.setDate(current.getDate() + 1);
        }
    });

    // Ambil semua room dari database
    const allRooms = await RoomModel.find({ isDeleted: false });

    // Hitung jumlah yang masih tersedia per room berdasarkan pemakaian maksimum dalam rentang tanggal
    const availableRooms = allRooms.map((room) => {
        const roomId = room._id.toString();
        const usagePerDay = roomUsagePerDay[roomId] || {};

        let maxUsed = 0;
        const temp = new Date(In);

        while (temp < Out) {
            const dateStr = temp.toISOString().split("T")[0];
            const used = usagePerDay[dateStr] || 0;
            if (used > maxUsed) maxUsed = used;
            temp.setDate(temp.getDate() + 1);
        }

        const availableCount = room.available - maxUsed;

        return {
            ...room.toObject(),
            availableCount: availableCount > 0 ? availableCount : 0,
        };
    });

    // Filter room yang masih tersedia minimal 1
    const finalAvailableRooms = availableRooms.filter((room) => room.availableCount > 0);

    return finalAvailableRooms;
    
};




const a = 0

export const FilterAvailableNested = async (checkInDate: any, checkOutDate: any) => {
    const In = new Date(checkInDate);
    const Out = new Date(checkOutDate);

    // Query unavailable rooms
    const unavailableRooms = await ShortAvailableModel.find({
        status: "PAID",
        $or: [
            {
                checkIn: { $lte: Out.toISOString() },
                checkOut: { $gte: In.toISOString() },
            },
        ],
        isDeleted: false,
    });

    // Track room usage per day (roomId => {dateStr => count})
    const roomUsagePerDay: Record<string, Record<string, number>> = {};

    unavailableRooms.forEach((transaction) => {
        const checkIn = new Date(transaction.checkIn);
        const checkOut = new Date(transaction.checkOut);

        const current = new Date(checkIn);
        while (current < checkOut) {
            const dateStr = current.toISOString().split("T")[0];

            transaction.products.forEach((product: { roomId: string; quantity: number }) => {
                const roomId = product.roomId.toString();

                if (!roomUsagePerDay[roomId]) roomUsagePerDay[roomId] = {};
                roomUsagePerDay[roomId][dateStr] = (roomUsagePerDay[roomId][dateStr] || 0) + product.quantity;
            });

            current.setDate(current.getDate() + 1);
        }
    });

    // Get all rooms from the database
    const allRooms = await RoomModel.find({ isDeleted: false });

    // Check availability for each room per day in the range
    const roomAvailability: Record<string, Record<string, boolean>> = {}; // roomId => {dateStr => isAvailable}
    const roomAvailableCount: Record<string, Record<string, number>> = {}; // roomId => {dateStr => availableCount}

    allRooms.forEach((room) => {
        const roomId = room._id.toString();
        roomAvailability[roomId] = {};
        roomAvailableCount[roomId] = {};

        const temp = new Date(In);
        while (temp < Out) {
            const dateStr = temp.toISOString().split("T")[0];
            const used = roomUsagePerDay[roomId]?.[dateStr] || 0;
            
            // Calculate available count for that room on that day
            const availableCount = room.available - used;
            roomAvailability[roomId][dateStr] = availableCount > 0;
            roomAvailableCount[roomId][dateStr] = availableCount;

            temp.setDate(temp.getDate() + 1);
        }
    });

    // Filter rooms that are available on all required days
    const availableRooms = allRooms.filter((room) => {
        const roomId = room._id.toString();
        
        // Check if the room is available on all required days
        return Object.keys(roomAvailability[roomId]).every(dateStr => roomAvailability[roomId][dateStr]);
    });

    // Create a nested structure for available rooms with availableCount per day
    const finalResult = availableRooms.map(room => {
        const roomId = room._id.toString();
        
        // Define availabilityPerDay and availableCountPerDay with the correct types
        const availabilityPerDay: Record<string, boolean> = {};
        const availableCountPerDay: Record<string, number> = {};
        const temp = new Date(In);
        while (temp < Out) {
            const dateStr = temp.toISOString().split("T")[0];
            availabilityPerDay[dateStr] = roomAvailability[roomId][dateStr];
            availableCountPerDay[dateStr] = roomAvailableCount[roomId][dateStr];

            temp.setDate(temp.getDate() + 1);
        }

        return {
            ...room.toObject(),
            availability: availabilityPerDay,
            availableCount: availableCountPerDay, // Nested availableCount
        };
    });

    console.log('Available Rooms with Nested Availability and Counts:', finalResult);
    return finalResult;
};




// return {
//     data_yg_tidak_ada: unavailableRooms,
//     jumlah_yg_tidak_ada: unavailableRooms.length,
//     jumlah_pembagian_data: roomUsagePerDay,
//     data_yg_ada: availableRooms,
//     tanggal_range: `${In.toISOString()} - ${Out.toISOString()}`,
// };


// export const FilterAvailable = async (checkInDate: any, checkOutDate: any) => {
//     const In = new Date(checkInDate);
//     const Out = new Date(checkOutDate);

//     const unavailableRooms = await ShortAvailableModel.find({
//         status: "PAID",
//         $or: [
//             {
//                 checkIn: { $lte: Out.toISOString() },
//                 checkOut: { $gte: In.toISOString() },
//             },
//         ],
//         isDeleted: false,
//     });

//     const roomUsagePerDay: Record<string, Record<string, number>> = {}; // roomId => {dateStr => count}

//     unavailableRooms.forEach((transaction) => {
//         const checkIn = new Date(transaction.checkIn);
//         const checkOut = new Date(transaction.checkOut);

//         const current = new Date(checkIn);
//         while (current < checkOut) {
//             const dateStr = current.toISOString().split("T")[0];

//             transaction.products.forEach((product: { roomId: string; quantity: number }) => {
//                 const roomId = product.roomId.toString();

//                 if (!roomUsagePerDay[roomId]) roomUsagePerDay[roomId] = {};
//                 roomUsagePerDay[roomId][dateStr] = (roomUsagePerDay[roomId][dateStr] || 0) + product.quantity;
//             });

//             current.setDate(current.getDate() + 1);
//         }
//     });

//     const allRooms = await RoomModel.find({ isDeleted: false });

//     const isRoomAvailable: Record<string, boolean> = {};

//     allRooms.forEach((room) => {
//         let available = true;
//         const roomId = room._id.toString();

//         const temp = new Date(In);
//         while (temp < Out) {
//             const dateStr = temp.toISOString().split("T")[0];
//             const used = roomUsagePerDay[roomId]?.[dateStr] || 0;

//             if (used >= room.available) {
//                 available = false;
//                 break;
//             }

//             temp.setDate(temp.getDate() + 1);
//         }

//         isRoomAvailable[roomId] = available;
//     });

//     const availableRooms = allRooms.filter((room) =>
//         isRoomAvailable[room._id.toString()]
//     );


//     const data = {
//         data_yg_tidak_ada: unavailableRooms,
//         jumlah_yg_tidak_ada: unavailableRooms.length,
//         jumlah_pembagian_data: roomUsagePerDay,
//         data_yg_ada: availableRooms,
//         tanggal_range: `${In.toISOString()} - ${Out.toISOString()}`,
//     }
//     return data
// };