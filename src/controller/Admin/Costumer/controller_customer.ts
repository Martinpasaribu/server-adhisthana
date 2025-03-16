
import { Request, Response, NextFunction  } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { BookingModel } from '../../../models/Booking/models_booking';
import { ContactModel } from '../../../models/Contact/models_contact';
import UserModel from '../../../models/User/models_user';
import { TransactionModel } from '../../../models/Transaction/models_transaksi';


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

        static async DeletedMessage(req: Request, res: Response) {
          try {
            const { MessageId } = req.params;
      
            // ✅ Validasi jika MessageId tidak ada
            if (!MessageId) {
              return res.status(400).json({
                requestId: uuidv4(),
                data: null,
                message: "MessageId is required!",
                success: false
              });
            }
      
            // ✅ Cari booking berdasarkan MessageId
            const MessageData = await ContactModel.findOneAndUpdate( 
              { _id : MessageId, isDeleted: false },
              { isDeleted: true },
              { new: true } // Mengembalikan data yang diperbarui
            );


            if (!MessageData) {
              return res.status(404).json({
                requestId: uuidv4(),
                data: null,
                message: "MessageData not found!",
                success: false
              });
            }

            console.log(`MessageData ${MessageData} has been get`);
      
            
            return res.status(200).json({
              requestId: uuidv4(),
              data: { acknowledged: true },
              message: `Successfully get MessageData: ${MessageId}`,
              success: true
            });
      
          } catch (error) {
            console.error("Error get MessageData:", error);
      
            return res.status(500).json({
              requestId: uuidv4(),
              data: null,
              message: (error as Error).message || "Internal Server Error",
              success: false
            });
          }
        }

        static async UpdateCustomer(req: Request, res: Response) {
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
      
              // Eksekusi semua update secara paralel
              const [updateCustomer, updateCustomerVBooking, updateCustomerTransaction] = await Promise.all([
                  UserModel.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id) }, { $set: updateData }, { new: true, runValidators: true }),
                  BookingModel.findOneAndUpdate({ userId: new mongoose.Types.ObjectId(id) }, { $set: updateData }, { new: true, runValidators: true }),
                  TransactionModel.findOneAndUpdate({ userId: new mongoose.Types.ObjectId(id) }, { $set: updateData }, { new: true, runValidators: true })
              ]);

              // Jika semua gagal
              if (!updateCustomer && !updateCustomerVBooking && !updateCustomerTransaction) {
                  return res.status(404).json({
                      requestId: uuidv4(),
                      success: false,
                      message: "Customer not found in all collections",
                  });
              }
      
              res.status(200).json({
                  requestId: uuidv4(),
                  success: true,
                  message: "Successfully updated Customer data",
                  data: updateCustomer,
              });
      
          } catch (error) {
              res.status(400).json({
                  requestId: uuidv4(),
                  success: false,
                  message: (error as Error).message,
              });
          }
      }

        
        static async GetCustomerByParams(req: Request, res: Response) {
              
          let data ;

          const { id } = req.params; 
          
          try {
                  
              new mongoose.Types.ObjectId(id), 

              data = await UserModel.find({ _id : id , isDeleted: false});
              
              res.status(201).json(
                  {
                      requestId: uuidv4(), 
                      data: data,
                      message: "Successfully Fetch Data Customer by Params.",
                      success: true
                  }
              );

          } catch (error) {
              
              res.status(400).json(
                  {
                      requestId: uuidv4(), 
                      data: null,
                      message:  (error as Error).message,
                      RoomId: `Customer id : ${id}`,
                      success: false
                  }
              );
          }

      }
}