
import { Request, Response, NextFunction  } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { ShortAvailableModel } from '../../../models/ShortAvailable/models_ShortAvailable';
import crypto from 'crypto';
import { TransactionModel } from '../../../models/Transaction/models_transaksi';
import { CekUser, Register } from './components/Index';


export class ReservationController {

        static async GetAllTransactionReservation(req: Request, res: Response) {

          try {
        
            const AvailableRoom = await ShortAvailableModel.find(
              {
                status: "PAID", isDeleted: false
              },
              { transactionId: 1, _id: 0 }
            );
            
            // Ambil hanya transactionId dari AvailableRoom
            const transactionIds = AvailableRoom.map(room => room.transactionId);
            
            const filterQuery = {
              status: "PAID",
              isDeleted: false,
              bookingId: { $in: transactionIds } // Mencocokkan bookingId dengan transactionId
            };
            
            // Query untuk TransactionModel (ambil semua data)
            const transactions = await TransactionModel.find(filterQuery);
            
            // console.log('data availble transactions :', transactions);


            // Kirim hasil response
            res.status(200).json({
              requestId: uuidv4(),
              data: transactions,
              success: true
            });
        
          } catch (error) {
            res.status(500).json({ message: "Failed to fetch transactions", error });
          }
        }

        static async AddTransaction(req: Request, res: Response) {
          try {
              // Destructure req.body
              const {
                  title, 
                  name, 
                  email, 
                  phone, 
                  grossAmount, 
                  reservation, 
                  products, 
                  night, 
                  checkIn, 
                  checkOut 
              } = req.body;

              // ✅ Validasi data sebelum disimpan
              if (!title || !name || !email || !phone || !grossAmount || !checkIn || !checkOut) {
                  return res.status(400).json({
                      requestId: uuidv4(),
                      data: null,
                      message: "All required fields must be provided!",
                      success: false
                  });
              }

              // Set Up Data Lain

              const bookingId = 'TRX-' + crypto.randomBytes(5).toString('hex');
              const status = "PAYMENT_PENDING"



              // Daftarkan terlebih dahulu usernya

              const IsHaveAccount = await CekUser(email);

              let userId ;

              if (!IsHaveAccount){
                  userId = await Register(title, name, email, phone);
              }


              // ✅ Buat objek baru berdasarkan schema
              const newTransaction = new TransactionModel({
                  bookingId,
                  userId : IsHaveAccount ?? userId,
                  status,
                  title,
                  name,
                  email,
                  phone,
                  grossAmount,
                  reservation,
                  products,
                  night,
                  checkIn,
                  checkOut
              });

              // ✅ Simpan ke database
              const savedTransaction = await newTransaction.save();

              // ✅ Berikan respon sukses
              return res.status(201).json({
                  requestId: uuidv4(),
                  data: {
                      acknowledged: true,
                      insertedId: savedTransaction._id
                  },
                  message: "Successfully add transaction to reservation.",
                  success: true
              });

          } catch (error) {
              console.error("Error creating transaction:", error);

              return res.status(500).json({
                  requestId: uuidv4(),
                  data: null,
                  message: (error as Error).message || "Internal Server Error",
                  success: false
              });
          }
      }

}