
import { Request, Response, NextFunction  } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import RoomModel from '../../models/Room/models_room';
import { BookingModel } from '../../models/Booking/models_booking';
import { formatISO, setHours, setMinutes, setSeconds } from "date-fns";
import { nanoid } from 'nanoid';
import { transactionService } from './transactionService';
import { PENDING_PAYMENT } from '../../utils/constant';

export class BookingController {

        static async addBooking(req: Request, res: Response) {

            const BookingReq = req.body;

            try {
                       
                const { idRoom } = BookingReq;
                const room = await RoomModel.findOne({ _id: idRoom });    

                if (!room) {
                    return res.status(404).json({ message: "Room not found" });
                }
                
                if (room.available <= 0) {
                    return res.status(400).json({ message: "Room not available" });
                }
                
                // Kurangi quantity
                room.available -= 1;

                // Simpan perubahan
                await room.save();

                const transaction_id = `TRX-${nanoid(4)}-${nanoid(8)}`;


                const roomDetails = await RoomModel.find({ _id: { $in: BookingReq.room.map((r: { roomId: any; }) => r.roomId) } });

                // Validate room availability
                for (const roomBooking of BookingReq.room) {
                    const room = roomDetails.find(r => r._id.toString() === roomBooking.roomId.toString());
                    if (!room) {
                        return res.status(400).json({ status: 'error', message: `Room with ID ${roomBooking.roomId} not found` });
                    }

                    // Check if the room is sold out or requested quantity exceeds availability
                    if (room.available <= 0) {
                        return res.status(400).json({ status: 'error', message: `Room with ID ${roomBooking.roomId} is sold out` });
                    }
                    if (roomBooking.quantity > room.available) {
                        return res.status(400).json({ 
                            status: 'error', 
                            message: `Room with ID ${roomBooking.roomId} has only ${room.available} available, but you requested ${roomBooking.quantity}` 
                        });
                    }
                }

                    // Calculate gross_amount
                const grossAmount = roomDetails.reduce((acc, room) => {
                    const roomBooking = BookingReq.room.find((r : { roomId:any }) => r.roomId.toString() === room._id.toString());
                    return acc + room.price * roomBooking.quantity;
                }, 0);
                

                const bookingId = `TRX-${nanoid(4)}-${nanoid(8)}`;


                // Create transaction
                const transaction = await transactionService.createTransaction({
                    bookingId,
                    status: status || PENDING_PAYMENT,
                    grossAmount,
                    userId: BookingReq.idUser,
                });
                
                // res.status(201).json(
                //     {
                //         requestId: uuidv4(), 
                //         data: {
                //             acknowledged: true,
                //             insertedId: savedBooking._id 
                //         },
                //         message: "Successfully Add Booking ",
                //         success: true
                //     }
                // );

            } catch (error) {

                res.status(400).json(
                    {
                        requestId: uuidv4(), 
                        data: null,
                        message:  (error as Error).message,
                        success: false
                    }
                );
            }

        }

        static async getOffers(req: Request, res: Response) {
            const { checkin, checkout } = req.query;
        
            try {
              // Validasi dan konversi parameter checkin dan checkout
              if (!checkin || !checkout) {
                return res.status(400).json({
                  requestId: uuidv4(),
                  data: null,
                  message: "Check-in and check-out dates are required.",
                  success: false,
                });
              }
        
              // Query ke MongoDB
              const data = await BookingModel.find({
                isDeleted: false,
                checkIn:  checkin ,
                checkOut:  checkout ,
              });
        
              res.status(200).json({
                requestId: uuidv4(),
                data: data,
                message: `Successfully get vila.`,
                success: true,
              });
              
            } catch (error) {
              res.status(500).json({
                requestId: uuidv4(),
                data: null,
                message: (error as Error).message,
                success: false,
              });
            }
          }

        static async getRoomByParams(req: Request, res: Response) {
            
            let data ;

            const { id } = req.params; 
            
            try {
                    
                new mongoose.Types.ObjectId(id), 

                data = await RoomModel.find({ _id : id , isDeleted: false});
                
                res.status(201).json(
                    {
                        requestId: uuidv4(), 
                        data: data,
                        message: "Successfully Fetch Data Room by Params.",
                        success: true
                    }
                );

            } catch (error) {
                
                res.status(400).json(
                    {
                        requestId: uuidv4(), 
                        data: null,
                        message:  (error as Error).message,
                        RoomId: `Room id : ${id}`,
                        success: false
                    }
                );
            }

        }

        static async deletedRoomPermanent(req: Request, res: Response) {

            try {

                const { id } = req.params; 

            
                const deletedRoom = await RoomModel.findOneAndDelete({_id:id});

                
                res.status(201).json(
                    {
                        requestId: uuidv4(), 
                        data: deletedRoom,
                        message: "Successfully DeletedPermanent Data Room as Cascade .",
                        success: true
                    }
                );

            } catch (error) {
                
                res.status(400).json(
                    {
                        requestId: uuidv4(), 
                        data: null,
                        message:  (error as Error).message,
                        success: false
                    }
                );
            }

        }

        static async updatePacketAll(req: Request, res: Response, next:NextFunction ) {

            const { id } = req.params; 
            const updateData = req.body; 
        
            try {
            
                const updatedPacket = await RoomModel.findOneAndUpdate(
                    { _id: id },         
                    updateData,            
                    { new: true, runValidators: true } 
                );
        
                if (!updatedPacket) {
                    return res.status(404).json({
                        requestId: uuidv4(), 
                        success: false,
                        message: "Packet not found",
                    });
                }
        
                res.status(200).json({
                    requestId: uuidv4(), 
                    success: true,
                    message: "Successfully updated Packet data",
                    data: updatedPacket
                });
        
            } catch (error) {
                res.status(400).json({
                    requestId: uuidv4(), 
                    success: false,
                    message: (error as Error).message,
                });
            }
        };
        
        static async updateRoomPart(req: Request, res: Response) {

            const { id } = req.params; 
            const updateData = req.body; 

            // if (updateData._id) {
            //     delete updateData._id;
            // }

            try {
            
                const updatedRoom = await RoomModel.findOneAndUpdate(
                    // new mongoose.Types.ObjectId(id),        
                    {_id:id},
                    updateData,            
                    { new: true, runValidators: true } 
                );
        
                if (!updatedRoom) {
                    return res.status(404).json({
                        requestId: uuidv4(), 
                        success: false,
                        message: "Room not found",
                    });
                }
        
                res.status(200).json({
                    requestId: uuidv4(), 
                    success: true,
                    message: "Successfully updated Room data",
                    data: updatedRoom
                });
        
            } catch (error) {
                res.status(400).json({
                    requestId: uuidv4(), 
                    success: false,
                    message: (error as Error).message,
                });
            }
        };

    // static async deletedSoftRoom(req: Request, res: Response) {

    //     try {

    //         let data ;
    //         const { id } = req.params;

    //         data = await RoomModel.findByIdAndUpdate(id, { isDeleted: true },{ new: true, runValidators: true });
      
    //         if (!data) {
    //             return res.status(404).json({
    //                 requestId: uuidv4(),
    //                 data: null,
    //                 message: "Room not found.",
    //                 success: false
    //             });
    //         }

    //         await ModuleModel.updateMany(
    //             { RoomId: id },
    //             { isDeleted: true }
    //         );

    //         const modules = await ModuleModel.find({ RoomId: id });
    //         const moduleId = modules.map((mod) => mod._id);
    //         await ChapterModel.updateMany(
    //             { moduleId: { $in: moduleId } },
    //             { isDeleted: true }
    //         );

    //         const chapters = await ChapterModel.find({ moduleId: { $in: moduleId } });
    //         const chapterId = chapters.map((ch) => ch._id);
    //         await QuestionModel.updateMany(
    //             { chapterId: { $in: chapterId } },
    //             { isDeleted: true }
    //         );

    //         res.status(201).json(
    //             {
    //                 requestId: uuidv4(), 
    //                 data: data,
    //                 message: `Successfully SoftDeleted Data : ${data} as Cascade `,
    //                 success: true
    //             }
    //         );

    //     } catch (error) {
            
    //         res.status(400).json(
    //             {
    //                 requestId: uuidv4(), 
    //                 data: null,
    //                 message:  (error as Error).message,
    //                 success: false
    //             }
    //         );
    //     }

    // }

}