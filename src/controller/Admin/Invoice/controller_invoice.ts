
import { Request, Response, NextFunction  } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { TransactionModel } from '../../../models/Transaction/models_transaksi';
import { ShortAvailableController } from '../../ShortAvailable/controller_short';
import { PAID, PAID_ADMIN, PAYMENT_ADMIN } from '../../../constant';
import { BookingModel } from '../../../models/Booking/models_booking';
import crypto from 'crypto';
import { Invoice } from '../../../models/Invoice/models_invoice';
import { time } from 'console';

export class InvoiceController {


  static async SetInvoice(data: any) {
    try {
      const { id_Booking, id_Product, note, code, less, totalPrice } = data;
  
      if (!id_Booking || !id_Product || !note || !code ||!totalPrice) {
        return {
          status: false,
          message: 'field need invoice'
        };
      }
  
      const invoice = {
        status: less === 0 ? false : true,
        id: 'INV-' + crypto.randomBytes(4).toString('hex'),
        id_Product,
        subject: code === "VLA" ? "Villa" : "Food & Drink",
        note,
        less,
        totalPrice,
        code
      };
  
      const updatedInvoice = await BookingModel.findByIdAndUpdate(
        { _id: new mongoose.Types.ObjectId(id_Booking), isDeleted: false },
        { $push: { invoice } },
        { new: true, runValidators: true }
      );
  
      return {
        status: true,
        message: `Successfully Set Invoice: ${invoice.id}`,
        id_Invoice: invoice.id,
        data: updatedInvoice?.invoice as unknown as Invoice[]  // <- ini kunci
      };
  
    } catch (error) {
      console.error("Error creating Invoice:", error);
      return {
        status: false,
        message: (error as Error).message || "Internal Server Error"
      };
    }
  }

  static async CreateInvoiceBooking(req: Request, res: Response) {
    
    try {
      const { id_Booking, id_Product, code, code2 , less, totalPrice , subject } = req.body;
  
      if (!id_Booking || !id_Product || !code || !less || !totalPrice) {
        return res.status(400).json({
          status: false,
          message: 'field need invoice'
        });
      }
  
      const invoice = {
        status: true,
        id: 'INV-' + crypto.randomBytes(4).toString('hex'),
        id_Product,
        subject,
        note: 'Suspended',
        less,
        totalPrice,
        code,
        code2,
      };
  
      const updatedInvoice = await BookingModel.findByIdAndUpdate(
        { _id: new mongoose.Types.ObjectId(id_Booking), isDeleted: false },
        { $push: { invoice } },
        { new: true, runValidators: true }
      );
  
      return res.status(200).json({
        status: true,
        message: `Successfully Set Invoice: ${invoice.id}`,
        id_Invoice: invoice.id,
        data: updatedInvoice?.invoice as unknown as Invoice[]
      });
  
    } catch (error) {
      console.error("Error creating Invoice:", error);
      return res.status(500).json({
        status: false,
        message: (error as Error).message || "Internal Server Error"
      });
    }
  }


  static async PayInvoice(req: Request, res: Response) {
    try {
      const { id_Booking, code } = req.params;
      const { id_Invoice, paid } = req.body;
  
      if (!id_Booking || !id_Invoice || paid === undefined) {
        return res.status(400).json({
          status: false,
          message: 'Missing required fields',
        });
      }
  
      const booking = await BookingModel.findOne({
        _id: new mongoose.Types.ObjectId(id_Booking),
        isDeleted: false,
      });
  
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
  
      const invoiceIndex = booking.invoice.findIndex(inv => inv.id === id_Invoice);
      if (invoiceIndex === -1) {
        return res.status(404).json({ message: 'Invoice not found' });
      }
  
      const currentLess = booking.invoice[invoiceIndex].less;
      const result = (currentLess <= 0 || paid > currentLess ) ? 0 : currentLess - paid;
  
      booking.invoice[invoiceIndex].less = result;
      booking.invoice[invoiceIndex].status = result !== 0;
      booking.invoice[invoiceIndex].note = result === 0 ? "Paid" : "Suspended";
      booking.invoice[invoiceIndex].timePaid = Date.now();
  
      let ResponseInvoice = "";
      let DataInvoice = {}

      if (code === "FAD") {
        
        const Pay = Number(paid);
        
        const dishIndex = booking.dish.findIndex(dis => dis.id_Invoice === id_Invoice);
        
        if (dishIndex === -1) {
          ResponseInvoice = 'Dish not found';
        } else {
          const dishCurrentLess = booking.dish[dishIndex].amountPrice;
          const dishResult = (dishCurrentLess <= 0 || Pay > dishCurrentLess ) ? 0 :dishCurrentLess - Pay;

          DataInvoice = booking.dish[dishIndex]

          booking.dish[dishIndex].amountPrice = dishResult;
          booking.dish[dishIndex].status = dishResult !== 0;
          booking.dish[dishIndex].note = dishResult === 0 ? "Paid" : "Suspended";
        }
      }
      
      

      await booking.save();
  
      return res.status(200).json({
        message: 'Invoice updated successfully',
        responseInvoice: ResponseInvoice,
        DataInvoice: DataInvoice,
        data: booking.invoice[invoiceIndex],
      });
  
    } catch (error) {
      console.error("Error creating Invoice:", error);
      return res.status(500).json({
        status: false,
        message: (error as Error).message || "Internal Server Error",
      });
    }
  }
  
  static async DeletedInvoiceBooking(data: any) {
    const { id_Booking, id_Product } = data;
  
    try {
      const booking = await BookingModel.findOne({ _id: id_Booking, isDeleted: false });
  
      if (!booking) {
        return {
          status: false,
          message: 'Invoice not found!'
        };
      }
  
      // Temukan invoice yang akan dihapus
      const deletedInvoice = booking.invoice.find((item: any) => item.id_Product === id_Product);
  
      if (!deletedInvoice) {
        return {
          status: false,
          message: 'Invoice product not found in booking!'
        };
      }
  
      // Hapus invoice dari array dish
      booking.invoice = booking.invoice.filter((item: any) => item.id_Product !== id_Product);
  
      // Simpan perubahan
      await booking.save();
  
      
      return {
        status: true,
        message: `Successfully deleted invoice: ${id_Product}`,
        id_Invoice: id_Product,
        data: deletedInvoice  // mengembalikan data invoice yang dihapus
      };
  
    } catch (error) {
      console.error(`Error deleting invoice ${id_Product}:`, error);
  
      return {
        status: false,
        message: (error as Error).message || "Internal Server Error"
      };
    }
  }
  

        // static async SetInvoice(data:any) {
          
        //   try {            

        //       // Destructure req.body
        //       // const {id_Booking, id_Product, note, code, less } = req.body;

        //       const inVoice = {
        //         status:true,
        //         id:'INV-' + crypto.randomBytes(4).toString('hex'),
        //         id_Product:data.id_Product,
        //         note:data.note,
        //         less:data.less,
        //         code:data.code
        //       }
        //       // ✅ Validasi data sebelum disimpan
        //       if (!id_Booking || !id_Product || !note || !code || !less ) {

        //           return res.status(400).json({
        //               requestId: uuidv4(),
        //               data: null,
        //               message: "required need invoice!",
        //               success: false
        //           });
        //       }


        //       const Invoice = await BookingModel.findByIdAndUpdate(
        //         { _id: new mongoose.Types.ObjectId(id_Booking), isDeleted: false},
        //         { $push: { inVoice } }, 
        //         { new: true, runValidators: true }
        //       )

              
        //       if (!Invoice){
        //             return res.status(200).json({
        //               requestId: uuidv4(),
        //               data: null,
        //               message: "Invoice already exists!",
        //               success: false
        //           });
        //       }

        //       // ✅ Berikan respon sukses
        //       return res.status(201).json({
        //           requestId: uuidv4(),
        //           data: {
        //               acknowledged: true
        //           },
        //           message: `Successfully Set Invoice: ${inVoice.id}`,
        //           success: true
        //       });

          
          
        //   } catch (error) {
        //       console.error("Error creating Invoice:", error);

        //       return res.status(500).json({
        //           requestId: uuidv4(),
        //           data: null,
        //           message: (error as Error).message || "Internal Server Error",
        //           success: false
        //       });
        //   }
        // }
     

}