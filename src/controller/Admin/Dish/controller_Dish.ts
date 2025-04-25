// controllers/DishController.ts

import ReportModel from '../../../models/Report/models_report';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import DishModel from '../../../models/Dish/models_dish';
import { BookingModel } from '../../../models/Booking/models_booking';
import { InvoiceController } from '../Invoice/controller_invoice';

export class AdminDishController {

    static async AddMenu (req: any, res: any) {

      const { type, code, name, stock, price, desc } = req.body;

      try {

        if (!type || !code || !name || !price || !desc) {
          return res.status(400).json({
              requestId: uuidv4(),
              data: null,
              message: `field can't be empty`,
              success: false
          });
      }

          // 1. Cek apakah email sudah terdaftar
          const dish = await DishModel.findOne({ name });



          if (dish) {
              return res.status(400).json({
                  requestId: uuidv4(),
                  data: null,
                  message: `Dish ${name} sudah terdaftar.`,
                  success: false
              });
          }

          // 4. Simpan user ke DB
          const user = await DishModel.create({
              type,
              code,
              name,
              stock,
              price,
              desc
          });

          // 5. Respon sukses
          return res.status(201).json({
              requestId: uuidv4(),
              data: user,
              message: "Menu berhasil di daftarkan.",
              success: true
          });

      } catch (error) {
          console.error("Add Menu Error:", error);
          return res.status(500).json({
              requestId: uuidv4(),
              data: null,
              message: (error as Error).message || "Terjadi kesalahan pada server.",
              success: false
          });
      }
    }

    static async GetDish (req: Request, res: Response){

        try {

            // Query untuk TransactionModel (ambil semua data)
            const dish = await DishModel.find({isDeleted:false});
            

            // Kirim hasil response
            res.status(200).json({
              requestId: uuidv4(),
              data: dish,
              success: true
            });
        

        } catch (error) {

            console.error('Error fetching dish :', error);
            
            return res.status(500).json({
                requestId: uuidv4(),
                data: null,
                message: (error as Error).message || "Internal Server Error",
                success: false
            });
        }
    };
  
    static async DeletedDishBooking(req: Request, res: Response) {
        const { id_booking, id_dish } = req.params;
      
        try {
          const booking = await BookingModel.findOne({ _id: id_booking, isDeleted: false });
      
          if (!booking) {
            return res.status(404).json({
              requestId: uuidv4(),
              message: "Booking not found",
              success: false
            });
          }
      
          // Anggap booking.dishes adalah array dari objek dish atau array ID dish
          // Hapus dish berdasarkan id_dish
          booking.dish = booking.dish.filter((item: any) => item.id !== id_dish);
      
          // Simpan perubahan
          await booking.save();
      
          const data = {
            id_Booking : id_booking,
            id_Product : id_dish
          }
          const DeleteInvoice = await InvoiceController.DeletedInvoiceBooking(data)
          
          res.status(200).json({
            requestId: uuidv4(),
            message: `Dish : ${id_dish} deleted successfully from booking ${id_booking} `,
            messageInvoice:  DeleteInvoice.message,
            dataInvoice: DeleteInvoice.data,
            success: true
          });
      
        } catch (error) {
          console.error(`Error deleting dish ${id_dish}:`, error);
      
          return res.status(500).json({
            requestId: uuidv4(),
            message: (error as Error).message || "Internal Server Error",
            success: false
          });
        }
      }
      
}

