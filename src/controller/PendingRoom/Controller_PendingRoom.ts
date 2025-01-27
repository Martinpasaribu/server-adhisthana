
import { Request, Response, NextFunction  } from 'express';

import { PendingRoomModel } from '../../models/PendingRoom/models_PendingRoom';

export class PendingRoomController {

        static async SetPending(room: any[], bookingId : any, userId: any, dateIn: any, dateOut: any, req: Request, res: Response) {
            try {
                // Validasi input
                if (!userId || !room || !dateIn || !dateOut) {
                    return res.status(400).json({ message: 'Room, date, or userId is not available' });
                }
        
                const now = new Date();
                const EndLockedUntil = new Date(now.getTime() + 7 * 60 * 1000); // Menambah 7 menit
                const options = { timeZone: "Asia/Jakarta" };
                const lockedUntilWIB = new Date(
                    EndLockedUntil.toLocaleString("en-US", options)
                );

                const lockedUntil = lockedUntilWIB.toString();
                
                // Iterasi melalui setiap room
                for (const r of room) {
                    // Pastikan room memiliki properti yang diperlukan
                    if (!r.roomId || !r.quantity) {
                        return res.status(400).json({ message: `Room data is invalid for roomId: ${r.roomId}` });
                    }
        

                    // Mengatur zona waktu WIB secara manual
                    


                    // Buat entri baru di PendingRoomModel
                    await PendingRoomModel.create({
                        bookingId,
                        userId,
                        roomId: r.roomId,
                        start: dateIn,
                        end: dateOut,
                        stock: r.quantity,
                        lockedUntil
                    });
                }
        
            } catch (error) {
                console.error(error);
                throw new Error('Function SetPending not implemented.');
            }
        }
    

        static async FilterWithPending (rooms : any, dateIn : any, dateOut : any,  req: Request, res: Response) {
 
            const start = new Date(dateIn);
            const end = new Date(dateOut);

            try {
                
            const nowWIB = new Date();

            // Pastikan zona waktu sesuai WIB
            const options = { timeZone: "Asia/Jakarta" };
            const now = new Date(nowWIB.toLocaleString("en-US", options));


            const DataPendingRoom = await PendingRoomModel.find({
                $or: [
                    {
                        start: { $lte: end.toISOString() },
                        end: { $gte: start.toISOString() },
                        lockedUntil: { $gte: now.toString() }
                    },
                ],
                isDeleted: false
            });

            // console.log(` Data Pending room start ${dateIn}, end ${dateOut} : `, DataPendingRoom)
            // console.log(` Data Pending room Now ${now}: `, DataPendingRoom)
            // console.log(` Data room Now : `, rooms)

            const WithoutPending = rooms.filter((room: any) => {
                return !DataPendingRoom.some((data: any) => {
                  const roomId = room._id ? room._id.toString() : room.roomId; // Jika `_id` tidak ada, gunakan `roomId`
                  return data.roomId === roomId && data.stock >= (room.availableCount ?? room.quantity);
                });
              });
              
              const PendingRoom = rooms.filter((room: any) => {
                return DataPendingRoom.some((data: any) => {
                  const roomId = room._id ? room._id.toString() : room.roomId; // Sama seperti di atas
                  return data.roomId === roomId && data.stock >= (room.availableCount ?? room.quantity);
                });
              });
              


            // console.log(" result filter Pending room : ", availableRoomsWithoutPending)
            // console.log(" result filter PendingRoom : ", PendingRoom)

             const result = {
                WithoutPending,
                PendingRoom

            } ;

            return result

        } catch (error) {
                
            console.error(error);
            throw new Error('Function SetPending not implemented.');

            }
        };



        static async UpdatePending (TransactionId: any,) {
 
            try {
                
                const ResultUpdate = PendingRoomModel.findOneAndUpdate({ roomId : TransactionId, isDeleted :false}, {isDeleted: true})

                console.log(" Data Room Pending has update ", ResultUpdate);

            } catch (error) {

                console.error(error);

            }
        };
        
}
