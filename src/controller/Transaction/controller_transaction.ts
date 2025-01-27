
import { Request, Response, NextFunction  } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
// Gunakan dynamic import
import crypto from 'crypto';


import RoomModel from '../../models/Room/models_room';
import { BookingModel } from '../../models/Booking/models_booking';
import { snap } from '../../config/midtransConfig'


import { EXPIRE, PENDING_PAYMENT } from '../../utils/constant';
import { TransactionModel } from '../../models/Transaction/models_transaksi';

import { ShortAvailableController } from '../ShortAvailable/controller_short';
import { updateStatusBaseOnMidtransResponse } from './Update_Status';

export class TransactionController {

        static async TrxNotif(req: Request, res: Response) {
            try {
                const data = req.body;
        
                // console.log("Data from midtrans:", data);
        
                // Menghilangkan prefiks "order-" dari transaction_id
                const formattedTransactionId = data.order_id.replace(/^order-/, "");
        
                // console.log("Formatted Transaction ID:", formattedTransactionId);
        
                // Menunggu hasil findOne dengan bookingId yang sudah diformat
                const existingTransaction = await TransactionModel.findOne({ bookingId: formattedTransactionId });

                let resultUpdate : any 

                if (existingTransaction) {
                    // Properti bookingId sekarang tersedia
                    const result = await updateStatusBaseOnMidtransResponse(data.order_id, data, res);
                    console.log('result = ', result);
                    resultUpdate = result

                } else {

                    console.log('Transaction not found in server, Data =', data);
                }

                res.status(200).json({

                    status: 'success',
                    message: "OK",
                    data: resultUpdate

                })

            } catch (error) {
                console.error('Error handling transaction notification:', error);
                
                res.status(500).json({ 
                    
                    error: 'Internal Server Error' 
                });
            }
        }

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

        static async updateTransactionFailed(req: Request, res: Response) {
 
            try {
                const transactionId = req.params.order_id
                
                const update = await TransactionModel.findOneAndUpdate({bookingId : transactionId}, {status:EXPIRE});

            
                if(!update) {
                    return res.status(404).json({
                        status: 'error',
                        message: `Transaction not found by TRX :  ${transactionId}`
                    })
                }
            

                res.status(202).json({
                    status: 'success',
                    data: update,
                    message: "success set expire transaction"
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