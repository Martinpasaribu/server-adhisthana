
import { Request, Response, NextFunction  } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { TransactionModel } from '../../../models/Transaction/models_transaksi';
import { ShortAvailableController } from '../../ShortAvailable/controller_short';
import { PAID, PAID_ADMIN, PAYMENT_ADMIN } from '../../../constant';
import { BookingModel } from '../../../models/Booking/models_booking';
import { InvoiceController } from '../Invoice/controller_invoice';


export class AdminBookingController {

        static async GetAllBooking(req: Request, res: Response) {

          try {
           

          const bookings = await BookingModel.find({isDeleted:false}).populate('roomStatusKey');

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
                message: `Transaction ${TransactionId} not found!`,
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

        static async GetBookingById(req: Request, res: Response) {
          
          try {
            const { id } = req.params;
      
            // ✅ Validasi jika TransactionId tidak ada
            if (!id) {
              return res.status(400).json({
                requestId: uuidv4(),
                data: null,
                message: "TransactionId is required!",
                success: false
              });
            }
      
            // ✅ Cari booking berdasarkan TransactionId
            const Booking = await BookingModel.findOne({
              orderId: id,
              isDeleted: false
            }).select("title name email orderId ota amountTotal checkIn checkOut room bookingId orderId");;  
      
            if (!Booking) {
              return res.status(404).json({
                requestId: uuidv4(),
                data: null,
                message: `Booking ${id} not found!`,
                success: false
              });
            }
      

      
            console.log(`Booking ${Booking.name} has been get`);
      
            return res.status(200).json({
              requestId: uuidv4(),
              data: Booking,
              message: `Successfully get Booking detail: ${Booking.name}`,
              success: true
            });
      
          } catch (error) {
            console.error("Error get Booking:", error);
      
            return res.status(500).json({
              requestId: uuidv4(),
              data: null,
              message: (error as Error).message || "Internal Server Error",
              success: false
            });
          }
        }

        static async SetOrderDish(req: Request, res: Response) {
          try {
            const { id } = req.params;
            const { dish, invoice } = req.body; 
      
            
            console.log("Nanana ",invoice)
            // ✅ Validasi jika TransactionId tidak ada
            if (!id) {
              return res.status(400).json({
                requestId: uuidv4(),
                data: null,
                message: "TransactionId is required!",
                success: false
              });
            }
            
            const invoiceResult =  await InvoiceController.SetInvoice(invoice);
            
            if (!invoiceResult.status) {
              return res.status(400).json({
                requestId: uuidv4(),
                data: null,
                message: invoiceResult.message,
                success: false
              });
            }
            const DataDish = {
              ...dish,
              id_Invoice: invoiceResult.id_Invoice
            };
            
              // Pastikan data yang dikirim tidak kosong
              if (Object.keys(DataDish).length === 0) {
                  return res.status(400).json({
                      requestId: uuidv4(),
                      success: false,
                      message: "No data Dish for update",
                  });
              }
      
              const updatedRoom = await BookingModel.findByIdAndUpdate(
                  { _id: new mongoose.Types.ObjectId(id) },
                  { $push: { dish: DataDish } }, 
                  { new: true, runValidators: true }
              );
      
              if (!updatedRoom) {
                  return res.status(404).json({
                      requestId: uuidv4(),
                      success: false,
                      message: "Booking not found",
                  });
              }
      
            console.log(`Dish Add to  ${updatedRoom.name} `);
      
            return res.status(200).json({
              requestId: uuidv4(),
              data: updatedRoom,
              edit: DataDish,
              resultInvoice: invoiceResult,
              message: `Successfully Add Dish: ${updatedRoom.name}`,
              success: true
            });
      
          } catch (error) {
            console.error("Error Add Dish:", error);
      
            return res.status(500).json({
              requestId: uuidv4(),
              data: null,
              message: (error as Error).message || "Internal Server Error",
              success: false
            });
          }
        }

        static async DeletedInvoiceBooking(req: Request, res: Response) {
          const { id_Booking, id_Invoice } = req.params;
        
          try {
            const booking = await BookingModel.findOne({ _id: id_Booking, isDeleted: false });
        
            if (!booking) {
              return res.status(404).json({
                requestId: uuidv4(),
                message: "Booking not found",
                success: false
              });
            }
        
                // Temukan invoice yang akan dihapus
            const deletedInvoice = booking.invoice.find((item: any) => item.id === id_Invoice);
        
            if (!deletedInvoice) {
    
              return res.status(404).json({
                requestId: uuidv4(),
                message: 'Invoice product not found in booking!',
                success: false
              });
              
            }
        
            // Hapus invoice dari array dish
            booking.invoice = booking.invoice.filter((item: any) => item.id !== id_Invoice);
        
            // Simpan perubahan
            await booking.save();

            res.status(200).json({
              requestId: uuidv4(),
              message: `Successfully deleted invoice: ${id_Invoice}`,
              id_Invoice: id_Invoice,
              data: deletedInvoice,  // mengembalikan data invoice yang dihapus
              success: true
            });
        
          } catch (error) {
            console.error(`Error deleting dish ${id_Invoice}:`, error);
        
            return res.status(500).json({
              requestId: uuidv4(),
              message: (error as Error).message || "Internal Server Error",
              success: false
            });
          }
        }
}