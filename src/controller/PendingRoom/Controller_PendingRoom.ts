
import { Request, Response, NextFunction  } from 'express';

import { PendingRoomModel } from '../../models/PendingRoom/models_PendingRoom';
import RoomModel from '../../models/Room/models_room';
import { v4 as uuidv4 } from 'uuid';


export class PendingRoomController {

        static async GetData(req: Request, res: Response){
            try {

                const RoomPending = await PendingRoomModel.find({isDeleted:false});

                res.status(200).json({
                    requestId: uuidv4(),
                    message: `Successfully retrieved before payment amount. ${RoomPending}.length`,
                    success: true,
                    data: RoomPending,
                });
                
            } catch (error) {
                res.status(500).json({
                    requestId: uuidv4(),
                    message: (error as Error).message,
                    success: false,
                    data: null,
                });
            }
        }

        static async SetPending(room: any[], bookingId : any, userId: any, dateIn: any, dateOut: any, code:any,  req: Request, res: Response) {
            try {
                // Validasi input
                if (!userId || !room || !dateIn || !dateOut) {
                    return res.status(400).json({ message: 'Room, date, or userId is Empty' });
                }
        
                const nowUTC = new Date(); // Waktu sekarang UTC server

                // Konversi UTC ke WIB (UTC + 7 jam)
                const wibTime = new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000);
                
                if (code === "website") wibTime.setMinutes(wibTime.getMinutes() + 5);
                if (code === "reservation") wibTime.setMinutes(wibTime.getMinutes() + 15);
              
                // Menambahkan 5 menit ke waktu WIB
             

                // Format WIB untuk disimpan (contoh: '2025-01-27 15:00:00')
                const lockedUntil = wibTime.toISOString().replace("T", " ").split(".")[0] + " GMT+0700 (WIB)";

                
                // console.log(` Data SetPending room Date lockedUntil ${lockedUntil}: `)

                // Iterasi melalui setiap room
                // for (const r of room) {
                //     // Pastikan room memiliki properti yang diperlukan
                //     if (!r.roomId || !r.quantity) {
                //         return res.status(400).json({ message: `Room data is invalid for roomId: ${r.roomId}` });
                //     }

                //     // Buat entri baru di PendingRoomModel
                //     await PendingRoomModel.create({
                //         bookingId,
                //         userId,
                //         roomId: r.roomId,
                //         start: dateIn,
                //         end: dateOut,
                //         stock: r.quantity,
                //         lockedUntil
                //     });
                // }

            await Promise.all(
                room.map((r) => {
                    if (!r.roomId || !r.quantity) {
                        throw new Error(`Room data is invalid for roomId: ${r.roomId}`);
                    }
                
                    return PendingRoomModel.create({
                    bookingId,
                    userId,
                    roomId: r.roomId,
                    start: dateIn,
                    end: dateOut,
                    stock: r.quantity,
                    lockedUntil
                    });
                })
            );

            } catch (error) {
                console.error(error);
                throw new Error('Function SetPending not implemented.');
            }
        }

        static async FilterForUpdateBookingWithPending (rooms : any, dateIn : any, dateOut : any) {
 
            const start = new Date(dateIn);
            const end = new Date(dateOut);

            try {
                
                const nowUTC = new Date(); // Waktu sekarang UTC server

                // Konversi UTC ke WIB (UTC + 7 jam)
                const wibOffset = 7 * 60 * 60 * 1000; // Offset WIB dalam milidetik (7 jam)
                const wibTime = new Date(nowUTC.getTime() + wibOffset);
              
                // Format WIB untuk disimpan (contoh: '2025-01-27 15:00:00')
                const wibFormatted = wibTime.toISOString().replace("T", " ").split(".")[0] + " GMT+0700 (WIB)";
                
                const now = wibFormatted;


            const DataPendingRoom = await PendingRoomModel.find({
                $or: [
                    {
                        start: { $lte: end.toISOString() },
                        end: { $gte: start.toISOString() },
                        lockedUntil: { $gte: now }
                    },
                ],
                isDeleted: false
            });

            // console.log(` Data Pending room start ${dateIn}, end ${dateOut} : `, DataPendingRoom)
            // console.log(` Data Pending room Now ${now}: `, DataPendingRoom)
            console.log(` Data Filter Pending room Date Now ${now}: `)
            // console.log(` Data room Now : `, rooms)


              
            const PendingRoom = rooms.filter((room: any) => {
                const roomId = room._id ? room._id.toString() : room.roomId;
              
                // Hitung total stock untuk roomId yang sama di DataPendingRoom
                const totalStock = DataPendingRoom
                  .filter((data: any) => data.roomId === roomId) // Ambil data dengan roomId yang sama
                  .reduce((sum: number, data: any) => sum + data.stock, 0); // Jumlahkan stock
              
                // Periksa apakah totalStock lebih besar atau sama dengan availableCount
                return totalStock >= (room.availableCount ?? room.quantity);
              });


            // console.log(" result filter Pending room : ", availableRoomsWithoutPending)
            // console.log(" result filter PendingRoom : ", PendingRoom)

             const result = {
                PendingRoom

            } ;

            return result

        } catch (error) {
                
            console.error(error);
            throw new Error('Function SetPending not implemented.');

            }
        };

        static async FilterForUpdateVilaWithPending (rooms : any, dateIn : any, dateOut : any) {
 
            const start = new Date(dateIn);
            const end = new Date(dateOut);

            try {
                
                const nowUTC = new Date(); // Waktu sekarang UTC server

                // Konversi UTC ke WIB (UTC + 7 jam)
                const wibOffset = 7 * 60 * 60 * 1000; // Offset WIB dalam milidetik (7 jam)
                const wibTime = new Date(nowUTC.getTime() + wibOffset);
              
                // Format WIB untuk disimpan (contoh: '2025-01-27 15:00:00')
                const wibFormatted = wibTime.toISOString().replace("T", " ").split(".")[0] + " GMT+0700 (WIB)";
                
                const now = wibFormatted;


            const DataPendingRoom = await PendingRoomModel.find({
                $or: [
                    {
                        start: { $lte: end.toISOString() },
                        end: { $gte: start.toISOString() },
                        lockedUntil: { $gte: now }
                    },
                ],
                isDeleted: false
            });

            // console.log(` Data Pending room start ${dateIn}, end ${dateOut} : `, DataPendingRoom)
            // console.log(` Data Pending room Now ${now}: `, DataPendingRoom)
            // console.log(` Data Filter Pending room Date Now ${now}: `)
            // console.log(` Data room Now : `, rooms)


            const UpdatedRooms = rooms.filter((room: any) => {
                const roomId = room._id ? room._id.toString() : room.roomId;
              
                // Hitung total stock untuk roomId yang sama di DataPendingRoom
                const totalStock = DataPendingRoom
                  .filter((data: any) => data.roomId === roomId) // Ambil data dengan roomId yang sama
                  .reduce((sum: number, data: any) => sum + data.stock, 0); // Jumlahkan stock
              
                // Periksa apakah availableCount lebih besar dari totalStock
                return (room.availableCount ?? room.quantity) > totalStock;
              });
              

            // 1. Kelompokkan DataPendingRoom berdasarkan roomId
            const groupedPendingStock = DataPendingRoom.reduce((acc: any, data: any) => {
                const roomId = data.roomId;
                if (!acc[roomId]) {
                  acc[roomId] = 0;
                }
                acc[roomId] += data.stock; // Jumlahkan stock untuk setiap roomId
                return acc;
              }, {});
              

            //   console.log(" result filter groupedPendingStock : ", groupedPendingStock)
                
            // 2. Filter dan perbarui rooms
            const WithoutPending = UpdatedRooms.filter((room: any) => {

                const roomId = room._id ? room._id.toString() : room.roomId;

                return !groupedPendingStock[roomId] || groupedPendingStock[roomId] < (room.availableCount ?? room.quantity);

            }).map((room: any) => {

                const roomId = room._id ? room._id.toString() : room.roomId;

                const pendingStock = groupedPendingStock[roomId] || 0; // Ambil stock pending jika ada

                return {
                    ...room,
                    availableCount: (room.availableCount ?? room.quantity) - pendingStock, // Kurangi stock pending
                };
            });
            
            // console.log(" result filter WithoutPending : ", WithoutPending)
            
            const PendingRoom = rooms.filter((room: any) => {
                
                const roomId = room._id ? room._id.toString() : room.roomId;
              
                // Hitung total stock untuk roomId yang sama di DataPendingRoom
                const totalStock = DataPendingRoom
                  .filter((data: any) => data.roomId === roomId) // Ambil data dengan roomId yang sama
                  .reduce((sum: number, data: any) => sum + data.stock, 0); // Jumlahkan stock
              
                // Periksa apakah totalStock lebih besar atau sama dengan availableCount
                return totalStock >= (room.availableCount ?? room.quantity);
              });
              
              
              
            // console.log(" result filter Pending room : ", availableRoomsWithoutPending)
            // console.log(" result filter PendingRoom : ", PendingRoom)

             const result = {
                WithoutPending,
                PendingRoom

            } ;

            console.log('WKWKWKWKWKW : ', DataPendingRoom);
            console.log('WKWKWKWKWKW PendingRoom: ', result.PendingRoom);
            console.log('WKWKWKWKWKW WithoutPending : ', result.WithoutPending);
            console.log('WKWKWKWKWKW Rooms Req : ', rooms);
            return result



        } catch (error) {
                
            console.error(error);
            throw new Error('Function SetPending not implemented.');

            }
        };

        static async UpdatePending(TransactionId: any) {
            
            try {
                // Menunggu hasil pembaruan dengan `await`
                const ResultUpdate = await PendingRoomModel.findOneAndUpdate(
                    { bookingId: TransactionId, isDeleted: false },
                    { isDeleted: true },
                    { new: true } // Mengembalikan data yang diperbarui
                );
        
                // Memeriksa apakah data berhasil diperbarui
                if (ResultUpdate) {
                    // console.log("Data Room Pending has been updated", ResultUpdate);
                    const message = `Transaction: ${TransactionId} set no pending`;
                    return message;
                } else {
                    const message = `Transaction: ${TransactionId} not found or already deleted`;
                    console.warn(message);
                    return message;
                }
            } catch (error) {
                console.error("Error updating room pending:", error);
                const message = `Transaction: ${TransactionId} error setting no pending: ${error}`;
                return message;
            }
        }
        
        
}
