
import { Request, Response, NextFunction  } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { TransactionModel } from '../../../models/Transaction/models_transaksi';
import { ShortAvailableController } from '../../ShortAvailable/controller_short';
import { PAID, PAID_ADMIN, PAYMENT_ADMIN } from '../../../constant';
import { BookingModel } from '../../../models/Booking/models_booking';


export class AdminBookingController {

        static async GetAllBooking(req: Request, res: Response) {

          try {
           

          const bookings = await BookingModel.find({isDeleted:false});

          const result = await Promise.all(bookings.map(async (booking) => {
              const transaction = await TransactionModel.findOne({ booking_keyId: booking._id, isDeleted:false });
          
              return {
                  ...booking.toObject(),
                  transactionStatus: transaction ? transaction.status : 'Suspended'
              };
          }));

            // Kirim hasil response
            res.status(200).json({
              requestId: uuidv4(),
              data: result,
              success: true
            });
        
          } catch (error) {
            res.status(500).json({ message: "Failed to fetch booking", error });
          }
        }
 
        static async SetVerified(req: Request, res: Response) {
          try {
            const { TransactionId } = req.params;
      
            // ✅ Validasi jika TransactionId tidak ada
            if (!TransactionId) {
              return res.status(400).json({
                requestId: uuidv4(),
                data: null,
                message: "TransactionId is required!",
                success: false
              });
            }
      
            // ✅ Cari booking berdasarkan TransactionId
            const BookingReservation = await BookingModel.findOne({
              orderId: TransactionId,
              isDeleted: false
            });
      
            if (!BookingReservation) {
              return res.status(404).json({
                requestId: uuidv4(),
                data: null,
                message: "Booking not found!",
                success: false
              });
            }
      
            // ✅ Update status verified
            const updatedBooking = await BookingModel.findOneAndUpdate(
              { orderId: TransactionId, isDeleted: false },
              {
                $set: { "verified.status": true, "verified.timeIn": Date.now() }
              },
              { new: true } // Mengembalikan data yang sudah diperbarui
            );
      
            if (!updatedBooking) {
              return res.status(400).json({
                requestId: uuidv4(),
                data: null,
                message: "Failed to update booking verification status!",
                success: false
              });
            }
      
            console.log(`Booking ${updatedBooking.name} has been verified`);
      
            return res.status(200).json({
              requestId: uuidv4(),
              data: { acknowledged: true },
              message: `Successfully verified Booking: ${TransactionId}`,
              success: true
            });
      
          } catch (error) {
            console.error("Error verifying Booking:", error);
      
            return res.status(500).json({
              requestId: uuidv4(),
              data: null,
              message: (error as Error).message || "Internal Server Error",
              success: false
            });
          }
        }

        static async SetCheckOut(req: Request, res: Response) {
          try {
            const { TransactionId } = req.params;
      
            // ✅ Validasi jika TransactionId tidak ada
            if (!TransactionId) {
              return res.status(400).json({
                requestId: uuidv4(),
                data: null,
                message: "TransactionId is required!",
                success: false
              });
            }
      
            // ✅ Cari booking berdasarkan TransactionId
            const BookingReservation = await BookingModel.findOne({
              orderId: TransactionId,
              isDeleted: false
            });
      
            if (!BookingReservation) {
              return res.status(404).json({
                requestId: uuidv4(),
                data: null,
                message: "Booking not found!",
                success: false
              });
            }
      
            // ✅ Update status verified
            const updatedBooking = await BookingModel.findOneAndUpdate(
              { orderId: TransactionId, isDeleted: false },
              {
                $set: { "verified.status": false, "verified.timeOut": Date.now() }
              },
              { new: true } // Mengembalikan data yang sudah diperbarui
            );
      
            if (!updatedBooking) {
              return res.status(400).json({
                requestId: uuidv4(),
                data: null,
                message: "Failed to update booking Check-Out status!",
                success: false
              });
            }
      
            console.log(`Booking ${updatedBooking.name} has been Check-Out`);
      
            return res.status(200).json({
              requestId: uuidv4(),
              data: { acknowledged: true },
              message: `Successfully Check-Out Booking: ${updatedBooking.name}`,
              success: true
            });
      
          } catch (error) {
            console.error("Error Check-Out Booking:", error);
      
            return res.status(500).json({
              requestId: uuidv4(),
              data: null,
              message: (error as Error).message || "Internal Server Error",
              success: false
            });
          }
        }
 

        static async GetTransactionById(req: Request, res: Response) {
          
          try {
            const { TransactionId } = req.params;
      
            // ✅ Validasi jika TransactionId tidak ada
            if (!TransactionId) {
              return res.status(400).json({
                requestId: uuidv4(),
                data: null,
                message: "TransactionId is required!",
                success: false
              });
            }
      
            // ✅ Cari booking berdasarkan TransactionId
            const Transaction = await TransactionModel.findOne({
              booking_keyId: TransactionId,
              isDeleted: false
            });
      
            if (!Transaction) {
              return res.status(404).json({
                requestId: uuidv4(),
                data: null,
                message: "Transaction not found!",
                success: false
              });
            }
      

      
            console.log(`Transaction ${Transaction.name} has been get`);
      
            return res.status(200).json({
              requestId: uuidv4(),
              data: Transaction,
              message: `Successfully get transaction detail: ${Transaction.name}`,
              success: true
            });
      
          } catch (error) {
            console.error("Error get Transaction:", error);
      
            return res.status(500).json({
              requestId: uuidv4(),
              data: null,
              message: (error as Error).message || "Internal Server Error",
              success: false
            });
          }
        }

}