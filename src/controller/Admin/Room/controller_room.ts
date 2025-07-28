
import { Request, Response, NextFunction  } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import RoomModel from '../../../models/Room/models_room';

export class RoomController {

        static async addRoom(req: Request, res: Response) {

            const RoomReq = req.body;
            
            try {
                
                const newRoom = new RoomModel(RoomReq);
                const savedRoom = await newRoom.save();

                res.status(201).json(
                    {
                        requestId: uuidv4(), 
                        data: {
                            acknowledged: true,
                            insertedId: savedRoom._id 
                        },
                        message: "Successfully Add Room.",
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

        static async getRoom(req: Request, res: Response) {

            try {

                let data ;
                data = await RoomModel.find({ isDeleted: false });
                
                res.status(201).json(
                    {
                        requestId: uuidv4(), 
                        data: data,
                        message: "Successfully Fetch Data Room.",
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


        
        static async updateRoomPart(req: Request, res: Response) {
            const { id } = req.params;
            const updateData = req.body;
        
            try {
                // Pastikan data yang dikirim tidak kosong
                if (Object.keys(updateData).length === 0) {
                    return res.status(400).json({
                        requestId: uuidv4(),
                        success: false,
                        message: "No data provided for update",
                    });
                }
        
                const updatedRoom = await RoomModel.findByIdAndUpdate(
                    { _id: new mongoose.Types.ObjectId(id) },
                    { $set: updateData }, 
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
                    data: updatedRoom,
                });
        
            } catch (error) {
                res.status(400).json({
                    requestId: uuidv4(),
                    success: false,
                    message: (error as Error).message,
                });
            }
        }
        
        

        static async getAllRoom(req: Request, res: Response) {

            try {

                let data ;

                data = await RoomModel.find(
                    
                    { 
                        isDeleted: false,

                    },

                    {
                        name: true,
                        nameAdditional: true,
                        _id:true,
                        available: true
                    }
                );
                
                res.status(201).json(
                    {
                        requestId: uuidv4(), 
                        data: data,
                        message: "Successfully Fetch Data Room.",
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