
import { Request, Response, NextFunction  } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import RoomModel from '../../models/Room/models_room';
import { getDataInstagramPosting, getDataInstagramProfile } from '../../config/instagram';
import InstagramModel from '../../models/Instagram/models_instagram';

export class InstagramController {

    static async update(req: Request, res: Response) {
        try {
            // Dapatkan data dari API
            const dataProfile = await getDataInstagramProfile();
            const dataContent = await getDataInstagramPosting();
            console.log('Data fetch sementara: ', { dataProfile, dataContent });

            // Mencari data pertama di database
            const existingData = await InstagramModel.findOne();

            if (existingData) {
                // Jika ada, update data profile dan content yang sudah ada
                existingData.profile = dataProfile;
                existingData.content = dataContent;
                await existingData.save();  // Simpan perubahan

                res.status(200).json({
                    message: 'Instagram has update',
                    message2: 'Data updated successfully',
                    data: existingData
                });
            } else {
                // Jika tidak ada, tambahkan data baru
                const newInstagramData = new InstagramModel({
                    profile: dataProfile,
                    content: dataContent,
                });

                await newInstagramData.save();  // Simpan data baru

                res.status(201).json({
                    message: 'Instagram has update',
                    messag2: 'Data created successfully',
                    data: newInstagramData
                });
            }

        } catch (error) {
            console.error('Error in update instagram:', (error as Error).message);
            res.status(500).send('Error fetching Instagram data');
        }
    }

    static async getData(req: Request, res: Response) {

        try {

            let data ;
            data = await InstagramModel.find({ isDeleted: false });
            
            res.status(201).json(
                {
                    requestId: uuidv4(), 
                    data: data,
                    message: "Successfully Fetch Data Instagram.",
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

}