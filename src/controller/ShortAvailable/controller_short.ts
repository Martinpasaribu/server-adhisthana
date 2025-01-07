
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
import { ShortAvailableModel } from '../../models/ShortAvailable/models_ShortAvailable';

export class ShortAvailableController {


        static async getShortVila(req: Request, res: Response) {
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
      
        static async addBookedRoomForAvailable(data: any, res: Response) {
            try {
              // Membuat instance baru dengan data dari parameter
              const newAvailable = new ShortAvailableModel({
                    transactionId: data.transactionId,
                    userId: data.userId, 
                    roomId: data.roomId,
                    status: data.status,
                    checkIn: data.checkIn, 
                    checkOut: data.checkOut, 
                    products: data.products.map((products : { roomId: string; price: number, quantity:number, name:string}) => ({
                        roomId: products.roomId,
                        price: products.price,
                        quantity: products.quantity,
                        name: products.name
                  }))
                })      
              // Menyimpan data ke database
              const savedShort = await newAvailable.save();
        
              // Mengirimkan respon sukses
              res.status(201).json({
                requestId: uuidv4(),
                data: {
                  acknowledged: true,
                  insertedId: savedShort._id,
                },
                message: "Successfully added room.",
                success: true,
              });
            } catch (error) {
              // Menangani kesalahan dan mengirimkan respon gagal
              res.status(400).json({
                requestId: uuidv4(),
                data: null,
                message: (error as Error).message,
                success: false,
              });
            }
          }

        static async getTransactionsById (req: Request, res: Response) {
 
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
        };
        


        
}