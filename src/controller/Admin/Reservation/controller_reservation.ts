
import { Request, Response, NextFunction  } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { ShortAvailableModel } from '../../../models/ShortAvailable/models_ShortAvailable';
import crypto from 'crypto';
import { TransactionModel } from '../../../models/Transaction/models_transaksi';
import { CekUser, Register } from './components/Index';
import { ReservationService } from './components/FilterWithRoomPending';
import { PendingRoomController } from '../../PendingRoom/Controller_PendingRoom';
import { ShortAvailableController } from '../../ShortAvailable/controller_short';
import { PAID, PAID_ADMIN, PAYMENT_ADMIN } from '../../../constant';
import { BookingModel } from '../../../models/Booking/models_booking';
import { OTAService } from './components/controller_OTA'

export class ReservationController {

        static async GetAllTransactionReservation(req: Request, res: Response) {

          try {
        
            // const AvailableRoom = await ShortAvailableModel.find(
            //   {
            //     status: { $in: ["PAID", "PAYMENT_ADMIN"] },
            //     isDeleted: false
            //   },
            //   { bookingId: 1, _id: 0 }
            // );
            
            // // Ambil hanya transactionId dari AvailableRoom
            // const transactionIds = AvailableRoom.map(room => room.bookingId);
            
            const filterQuery = {
              status: { $in: [PAYMENT_ADMIN, PAID_ADMIN] },
              reservation:true,
              isDeleted: false,
              // bookingId: { $in: transactionIds } // Mencocokkan bookingId dengan transactionId
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
                  otaTotal,
                  reservation, 
                  products, 
                  night, 
                  checkIn, 
                  checkOut 
              } = req.body;

              console.log(`Ini data payload room dari reservation: ${JSON.stringify(products, null, 2)}`);

              // ✅ Validasi data sebelum disimpan
              if (!title || !name || !email || !phone || !grossAmount || !checkIn || !checkOut) {
                  return res.status(400).json({
                      requestId: uuidv4(),
                      data: null,
                      message: "All required fields must be provided!",
                      success: false
                  });
              }

              // Cek Roompending sebelum membuat reservation transaction 

              const ReservationReadyToBeSaved = await ReservationService.createReservation({products, checkIn, checkOut })

              if(ReservationReadyToBeSaved.WithoutPending === 0){

              }

              console.log(`Ini data reservation after filter : ${JSON.stringify(ReservationReadyToBeSaved.WithoutPending, null, 2)}`);
              
              // Mix data Product with OTA

              // const ProductClean = await OTAService.Mix_OTA(products,ReservationReadyToBeSaved.WithoutPending)

              // console.log(`Ini data reservation after Mix OTA : ${ProductClean}`);
              // Set Up Data Lain

              const bookingId = 'TRX-' + crypto.randomBytes(5).toString('hex');
              const status = PAYMENT_ADMIN



              // Daftarkan terlebih dahulu usernya

              const IsHaveAccount = await CekUser(email);

              let userId ;

              if (!IsHaveAccount){
                  userId = await Register(title, name, email, phone);
              }


              // ✅ Buat objek baru berdasarkan schema
              const newBooking = new BookingModel({
                  orderId : bookingId,
                  userId : IsHaveAccount ?? userId,
                  status,
                  title,
                  name,
                  email,
                  phone,
                  amountTotal :grossAmount,
                  otaTotal :otaTotal,
                  reservation,
                  room: ReservationReadyToBeSaved.WithoutPending,
                  night,
                  checkIn,
                  checkOut
              });

              // ✅ Simpan ke database Booking
              const savedBooking = await newBooking.save();


              console.log(" add transaction with reservation : ", savedBooking)

              // ✅ Buat objek baru berdasarkan schema
              const newTransaction = new TransactionModel({
                booking_keyId: savedBooking._id,
                bookingId,
                userId : IsHaveAccount ?? userId,
                status,
                title,
                name,
                email,
                phone,
                grossAmount,
                otaTotal,
                reservation,
                products: ReservationReadyToBeSaved.WithoutPending,
                night,
                checkIn,
                checkOut
              });

              // ✅ Simpan ke database Transaction
              const savedTransaction = await newTransaction.save();


              // SetUp Room yang akan masuk dalam Room Pending
              await PendingRoomController.SetPending(ReservationReadyToBeSaved.WithoutPending,bookingId, IsHaveAccount ?? userId, checkIn, checkOut, req, res )

              // ✅ Berikan respon sukses
              return res.status(201).json({
                  requestId: uuidv4(),
                  data: {
                      acknowledged: true,
                      insertedTransactionId: savedTransaction._id,
                      insertedBoopkingId: savedBooking._id
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

        static async SetPayment(req: Request, res: Response) {
          
          try {
              // Destructure req.body
              const {
                TransactionId
              } = req.params;

              // ✅ Validasi data sebelum disimpan
              if (!TransactionId) {

                  return res.status(400).json({
                      requestId: uuidv4(),
                      data: null,
                      message: "required TransactionId!",
                      success: false
                  });
              }


              const BookingReservation = await TransactionModel.find(
                { bookingId:TransactionId,  isDeleted : false, reservation: true}
              )

              
              if (!BookingReservation){
                    return res.status(400).json({
                      requestId: uuidv4(),
                      data: null,
                      message: "Transaction no found !",
                      success: false
                  });
              }

              const IsTransaction = await TransactionModel.findOneAndUpdate(
                {bookingId:TransactionId, isDeleted : false, status : PAYMENT_ADMIN, reservation: true},
                {
                  status: PAID_ADMIN
                }
              )

              if (!IsTransaction){
                    return res.status(400).json({
                      requestId: uuidv4(),
                      data: null,
                      message: "Set Transaction no found !",
                      success: false
                  });
              }

              console.log(`Transaction ${IsTransaction.name} has Pay`)

              await ShortAvailableController.addBookedRoomForAvailable({
                  transactionId: TransactionId,
                  userId: IsTransaction.userId, 
                  status: PAID,
                  checkIn: IsTransaction.checkIn,
                  checkOut: IsTransaction.checkOut,  
                  products: IsTransaction.products.map((product: { roomId: string; price: number; quantity: number; name: string }) => ({
                      roomId: product.roomId,
                      price: product.price,
                      quantity: product.quantity,
                      name: product.name,
                  })),
              }, res);


              // ✅ Berikan respon sukses
              return res.status(201).json({
                  requestId: uuidv4(),
                  data: {
                      acknowledged: true
                  },
                  message: `Successfully payment transaction : ${TransactionId}`,
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