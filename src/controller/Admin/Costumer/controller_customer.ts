
import { Request, Response, NextFunction  } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { BookingModel } from '../../../models/Booking/models_booking';
import { ContactModel } from '../../../models/Contact/models_contact';


export class AdminCustomerController {

        static async GetMessage(req: Request, res: Response) {

          try {
           
            const filterQuery = {
              isDeleted: false,
            };
            
            // Query untuk TransactionModel (ambil semua data)
            const Message = await ContactModel.find(filterQuery);
            
            // console.log('data availble transactions :', transactions);


            // Kirim hasil response
            res.status(200).json({
              requestId: uuidv4(),
              data: Message,
              success: true
            });
        
          } catch (error) {
            res.status(500).json({ message: "Failed to fetch Message", error });
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
              oderId: TransactionId,
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
              { oderId: TransactionId, isDeleted: false },
              {
                verified: { status: true, time: Date.now() }
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

}