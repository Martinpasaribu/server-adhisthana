
import { Request, Response, NextFunction  } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
// Gunakan dynamic import
import crypto from 'crypto';


import RoomModel from '../../models/Room/models_room';
import { BookingModel } from '../../models/Booking/models_booking';
import { snap } from '../../config/midtransConfig'


import { PENDING_PAYMENT } from '../../utils/constant';
import { SessionModel } from '../../models/Booking/models_session';
import { TransactionModel } from '../../models/Transaction/models_transaksi';

import { ShortAvailableController } from '../ShortAvailable/controller_short';

export class TransactionController {


        static async getTransactionsById (req: Request, res: Response) {
 
            try {
                const { transaction_id } = req.params;
                const transaction = await TransactionModel.findOne({bookingId : transaction_id});
            
                if(!transaction) {
                    return res.status(404).json({
                        status: 'error',
                        message: 'Transaction not found'
                    })
                }
            
                res.status(202).json({
                    status: 'success',
                    data: transaction
                })
                
            } catch (error) {
                
                res.status(400).json(
                    {
                        requestId: uuidv4(), 
                        data: null,
                        message:  (error as Error).message,
                        success: false
                    }
                );

                console.log(" Error get data by ID ")
            }
        };

        static async getTransactionsByMember(req: Request, res: Response) {
 
            try {
                const userId = req.session.userId
                
                const transaction = await TransactionModel.find({userId : userId});
            
                if(!transaction) {
                    return res.status(404).json({
                        status: 'error',
                        message: `Transaction not found by Member ${userId}`
                    })
                }
            
                res.status(202).json({
                    status: 'success',
                    data: transaction
                })
                
            } catch (error) {
                
                res.status(400).json(
                    {
                        requestId: uuidv4(), 
                        data: null,
                        message:  (error as Error).message,
                        success: false
                    }
                );

                console.log(" Error get data by User ")
            }
        };

        static async getTransactionsByUser (req: Request, res: Response) {
 
            try {
                const { user } = req.params;
       

                const transaction = await TransactionModel.find({userId : user});
            
                if(!transaction) {
                    return res.status(404).json({
                        status: 'error',
                        message: `Transaction not found by Name ${user}`
                    })
                }
            
                res.status(202).json({
                    status: 'success',
                    data: transaction
                })
                
            } catch (error) {
                
                res.status(400).json(
                    {
                        requestId: uuidv4(), 
                        data: null,
                        message:  (error as Error).message,
                        success: false
                    }
                );

                console.log(" Error get data by User ")
            }
        };



        
}