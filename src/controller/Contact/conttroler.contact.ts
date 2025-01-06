
import { Request, Response, NextFunction  } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { ContactModel, SubsModel } from '../../models/Contact/models_contact';


export class ContactController {

        static async addContact(req: Request, res: Response) {

            const ContactReq = req.body;
            
            try {
                
                const newContact = new ContactModel(ContactReq);
                const savedContact = await newContact.save();

                res.status(201).json(
                    {
                        requestId: uuidv4(), 
                        data: {
                            acknowledged: true,
                            insertedId: savedContact._id 
                        },
                        message: "Successfully Add Contact.",
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
        static async addSubscribe(req: Request, res: Response) {

            const SubsReq = req.body;
            
            try {
                
                const newSubs = new SubsModel(SubsReq);
                const savedContact = await newSubs.save();

                res.status(201).json(
                    {
                        requestId: uuidv4(), 
                        data: {
                            acknowledged: true,
                            insertedId: savedContact._id 
                        },
                        message: "Successfully adding Member.",
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

        static async getContact(req: Request, res: Response) {

            try {

                let data ;
                data = await ContactModel.find({ isDeleted: false });
                
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

}