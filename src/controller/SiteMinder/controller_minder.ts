
import { Request, Response, NextFunction  } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import RoomModel from '../../models/Room/models_room';


import { ShortAvailableController } from '../ShortAvailable/controller_short';
import { SiteMinderModel } from '../../models/SiteMinder/models_SitemMinder';
import { ShortAvailableModel } from '../../models/ShortAvailable/models_ShortAvailable';
import { Logging } from '../../log';
import { TransactionModel } from '../../models/Transaction/models_transaksi';


export class SetMinderController {


        static async SetUpPrice(req: Request, res: Response) {
            
            try {
                const { prices } = req.body;
            
                if (!prices || typeof prices !== 'object') {
                  return res.status(400).json({ message: 'Invalid data format' });
                }
            
                const bulkOperations = [];
                for (const roomId in prices) {
                  for (const date in prices[roomId]) {
                    const price = prices[roomId][date];
                    bulkOperations.push({
                      updateOne: {
                        filter: { roomId, date },
                        update: { $set: { price } },
                        upsert: true,
                      },
                    });
                  }
                }
            
                await SiteMinderModel.bulkWrite(bulkOperations);


                res.status(200).json({
                  requestId: uuidv4(),
                  data: null,
                  message: `Prices saved`,
                  success: true,

              });


              } catch (error) {
                res.status(500).json({ message: 'Failed to save prices', error });
              }

        }

        static async GetAllPriceByYear(req: Request, res: Response) {

            try {
                const { year } = req.query;
            
                if (!year ) {
                  return res.status(400).json({ message: 'Year are required' });
                }
            
                const startDate = new Date(`${year}-01-01`); // Awal tahun
                const endDate = new Date(`${year}-12-31`); // Akhir

                endDate.setMonth(endDate.getMonth() + 1);
            
                const prices = await SiteMinderModel.find({
                  date: {
                    $gte: startDate.toISOString().split('T')[0],
                    $lt: endDate.toISOString().split('T')[0],
                  },
                });
            
                const formattedPrices: Record<string, Record<string, number>> = {};
                prices.forEach(({ roomId, date, price }) => {
                  if (!formattedPrices[roomId]) {
                    formattedPrices[roomId] = {};
                  }
                  formattedPrices[roomId][date] = price;
                });
            
                res.status(200).json({
                    requestId: uuidv4(),
                    data: formattedPrices,
                    message: `Set from year ${year} `,
                    success: true,
                });

              } catch (error) {
                res.status(500).json({ message: 'Failed to fetch prices', error });
              }

        }
       
        static async GetAllPrice(req: Request, res: Response) {

            try {
                const { year, month } = req.query;
            
                if (!year || !month) {
                  return res.status(400).json({ message: 'Year and month are required' });
                }
            
                const startDate = new Date(`${year}-${month}-01`);
                const endDate = new Date(startDate);

                endDate.setMonth(endDate.getMonth() + 1);
            
                const prices = await SiteMinderModel.find({
                  date: {
                    $gte: startDate.toISOString().split('T')[0],
                    $lt: endDate.toISOString().split('T')[0],
                  },
                });
            
                const formattedPrices: Record<string, Record<string, number>> = {};
                prices.forEach(({ roomId, date, price }) => {
                  if (!formattedPrices[roomId]) {
                    formattedPrices[roomId] = {};
                  }
                  formattedPrices[roomId][date] = price;
                });
            
                res.status(200).json({
                    requestId: uuidv4(),
                    data: formattedPrices,
                    message: `Successfully retrieved rooms. From year: ${year} month: ${month}`,
                    success: true,
                });

              } catch (error) {
                res.status(500).json({ message: 'Failed to fetch prices', error });
              }

        }
       
       
        static async GetAllRoomWithAvailable(req: Request, res: Response) {
          try {
            const { year, month } = req.query;
        
            // Validasi input
            if (!year || !month) {
              return res.status(400).json({ message: "Year and month are required" });
            }
        
            // Pastikan month selalu dalam format 2 digit
            const formattedMonth = String(month).padStart(2, "0");
        
            // Set tanggal mulai dan akhir
            const startDate = new Date(`${year}-${formattedMonth}-01T00:00:00Z`);
            const endDate = new Date(startDate);
            endDate.setUTCMonth(endDate.getUTCMonth() + 1); // Bulan berikutnya
        
            // Fungsi untuk menghasilkan rentang tanggal
            const generateDateRange = (start: Date, end: Date) => {
              const dates: string[] = [];
              let currentDate = new Date(start);
              while (currentDate < end) {
                dates.push(currentDate.toISOString().split("T")[0]); // Format YYYY-MM-DD
                currentDate.setUTCDate(currentDate.getUTCDate() + 1); // Tambah 1 hari
              }
              return dates;
            };
        
            // Pastikan rentang tanggal dihitung dengan benar
            const dateRange = generateDateRange(startDate, endDate);
        
            // Log hasil rentang tanggal
            Logging(dateRange, "Hasil generate Date range");
        
            // Ambil data dari database
            const roomData = await ShortAvailableModel.find({ isDeleted: false });
        
            const Room = await RoomModel.find()

            const availabilityRoom =  Room.map( room => { return { id: room._id.toString(), availability : room.available } })

            Logging(availabilityRoom, "Hasil availabilityRoom ");

            // Struktur hasil filter
            const resultFilter: Record<string, Record<string, number>> = {};
        

            // Proses data
            roomData.forEach((room: any) => {
              room.products.forEach((product: any) => {
                const roomId = product.roomId;
        
                // Inisialisasi resultFilter dengan rentang tanggal
                if (!resultFilter[roomId]) {
                  resultFilter[roomId] = {};
                  dateRange.forEach((date) => {
                    resultFilter[roomId][date] = 0; // Default 0
                  });
                }
        
                // Rentang tanggal check-in dan check-out
                const checkIn = new Date(room.checkIn).toISOString().split("T")[0];
                const checkOut = new Date(room.checkOut).toISOString().split("T")[0];
        

                const validDates = generateDateRange(
                  new Date(checkIn),
                  new Date(checkOut)
                );
        
                // Perbarui resultFilter dengan tanggal valid
                validDates.forEach((date) => {
                  if (resultFilter[roomId][date] !== undefined) {
                    resultFilter[roomId][date] += product.quantity;
                  }
                });
              });
            });


        
            // Kirimkan hasil response
            res.status(200).json({
              requestId: uuidv4(),
              data: resultFilter,
              message: `Successfully retrieved rooms. From year: ${year}, month: ${month}`,
              success: true,
            });
          } catch (error) {
            res.status(500).json({ message: "Failed to fetch Room", error });
          }
        }
        


        static async GetAllRoomWithUnAvailable(req: Request, res: Response) {
          try {
            const { year, month } = req.query;
        
            // Validasi input
            if (!year || !month) {
              return res.status(400).json({ message: "Year and month are required" });
            }
        
            // Pastikan month selalu dalam format 2 digit
            const formattedMonth = String(month).padStart(2, "0");
        
            // Set tanggal mulai dan akhir
            const startDate = new Date(`${year}-${formattedMonth}-01T00:00:00Z`);
            const endDate = new Date(startDate);
            endDate.setUTCMonth(endDate.getUTCMonth() + 1); // Bulan berikutnya
        
            // Fungsi untuk menghasilkan rentang tanggal
            const generateDateRange = (start: Date, end: Date) => {
              const dates: string[] = [];
              let currentDate = new Date(start);
              while (currentDate < end) {
                dates.push(currentDate.toISOString().split("T")[0]); // Format YYYY-MM-DD
                currentDate.setUTCDate(currentDate.getUTCDate() + 1); // Tambah 1 hari
              }
              return dates;
            };
        
            // Pastikan rentang tanggal dihitung dengan benar
            const dateRange = generateDateRange(startDate, endDate);
        
            // Log hasil rentang tanggal
            Logging(dateRange, "Hasil generate Date range");
        
            // Ambil data dari database
            const roomData = await ShortAvailableModel.find({ isDeleted: false });
        
            const Room = await RoomModel.find()

            const availabilityRoom =  Room.map( room => { return { id: room._id.toString(), availability : room.available } })

            Logging(availabilityRoom, "Hasil availabilityRoom ");

            // Struktur hasil filter
            const resultFilter: Record<string, Record<string, number>> = {};
        

            // Proses data
            roomData.forEach((room: any) => {
              room.products.forEach((product: any) => {
                const roomId = product.roomId;
        
                // Inisialisasi resultFilter dengan rentang tanggal
                if (!resultFilter[roomId]) {
                  resultFilter[roomId] = {};
                  dateRange.forEach((date) => {
                    resultFilter[roomId][date] = 0; // Default 0
                  });
                }
        
                // Rentang tanggal check-in dan check-out
                const checkIn = new Date(room.checkIn).toISOString().split("T")[0];
                const checkOut = new Date(room.checkOut).toISOString().split("T")[0];
        

                const validDates = generateDateRange(
                  new Date(checkIn),
                  new Date(checkOut)
                );
        
                // Perbarui resultFilter dengan tanggal valid
                validDates.forEach((date) => {
                  if (resultFilter[roomId][date] !== undefined) {
                    resultFilter[roomId][date] += 0;
                  }
                });
              });
            });

            // Ganti nilai 0 dengan availability dari availabilityRoom
            Object.keys(resultFilter).forEach((roomId) => {
              const availabilityData = availabilityRoom.find(
                (room) => room.id === roomId
              );
              if (availabilityData) {
                Object.keys(resultFilter[roomId]).forEach((date) => {
                  if (resultFilter[roomId][date] === 0) {
                    resultFilter[roomId][date] = availabilityData.availability;
                  }
                });
              }
            });
        
            // Kirimkan hasil response
            res.status(200).json({
              requestId: uuidv4(),
              data: resultFilter,
              message: `Successfully retrieved rooms. From year: ${year}, month: ${month}`,
              success: true,
            });
          } catch (error) {
            res.status(500).json({ message: "Failed to fetch Room", error });
          }
        }
        
        
        static async GetAllTransactionFromYearAndMonth(req: Request, res: Response) {
          try {
            const { year, month } = req.query;
        
            // Validasi input
            if (!year || !month) {
              return res.status(400).json({ message: "Year and month are required" });
            }
            // Pastikan bulan dua digit
            const monthStr= String(month).padStart(2, "0"); // Menambahkan leading zero jika bulan kurang dari dua digit
            const startDate = new Date(`${year}-${monthStr}-01T07:00:00.000Z`);
            const endDate = new Date(`${year}-${monthStr}-01T15:00:00.000Z`);
            endDate.setMonth(endDate.getMonth() + 1); // Menambahkan 1 bulan untuk mendapatkan batas akhir bulan
        
            // Query untuk mencari transaksi yang terjadi dalam bulan dan tahun tersebut
            const transactions = await TransactionModel.find({
              checkIn: {
                $gte: startDate.toISOString(),  // Lebih besar atau sama dengan 1st day bulan
                $lt: endDate.toISOString()      // Kurang dari 1st day bulan berikutnya
              }
            });
            // const transactions = await TransactionModel.find({}, "checkIn").limit(10);

         
        
            Logging(transactions, "hasil short transaction");
            Logging(startDate, "awal sampai akhir ", endDate);

            // Kirimkan hasil response
            res.status(200).json({
              requestId: uuidv4(),
              data: transactions,
              message: `Successfully retrieved transactions for year: ${year}, month: ${month}`,
              success: true,
            });
          } catch (error) {
            res.status(500).json({ message: "Failed to fetch transactions", error });
          }
        }

        
}