
import { Request, Response, NextFunction  } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import RoomModel from '../../../models/Room/models_room';

import { NationalHolidays } from '../../../utils/constant'
import { ShortAvailableController } from '../../ShortAvailable/controller_short';
import { SiteMinderModel } from '../../../models/SiteMinder/models_SitemMinder';
import { ShortAvailableModel } from '../../../models/ShortAvailable/models_ShortAvailable';
import { Logging } from '../../../log';
import { TransactionModel } from '../../../models/Transaction/models_transaksi';


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


        static async SetPriceForHolidays(req: Request, res: Response) {
          try {
              const { id, price } = req.query;
      
              // Validasi input
              if (!id || price == null) {
                  return res.status(400).json({
                      message: 'Room ID and price are required',
                  });
              }
      
              // Ambil daftar tanggal hari libur nasional
              const nationalHolidayDates = Object.keys(NationalHolidays).filter(
                  (date) => NationalHolidays[date].holiday === true
              );
      
              if (nationalHolidayDates.length === 0) {
                  return res.status(404).json({
                      message: 'No national holidays found for the provided year',
                  });
              }
      
              // Siapkan operasi bulk untuk pembaruan harga
              const bulkOperations = nationalHolidayDates.map((date) => ({
                  updateOne: {
                      filter: { roomId: id, date },
                      update: { $set: { price } },
                      upsert: true, // Jika data belum ada, tambahkan
                  },
              }));
      
              // Jalankan operasi bulk
              if (bulkOperations.length > 0) {
                  await SiteMinderModel.bulkWrite(bulkOperations);
              }
      
              res.status(200).json({
                  requestId: uuidv4(),
                  data: null,
                  message: `Prices updated for national holidays`,
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

        static async SetPriceForCustomDate(req: Request, res: Response) {
          try {
              const { roomId, price, dates } = req.body;
      
              // Validasi input
              if (!roomId || price == null) {
                  return res.status(400).json({
                      message: 'Room ID Or Price are required',
                  });
              }

              if (dates.length === 0) {
                  return res.status(404).json({
                      message: 'No found Date custom',
                  });
              }
      
              const dateArray = Array.isArray(dates) ? dates : [dates]; // Pastikan selalu array

              // Siapkan operasi bulk untuk pembaruan harga
              const bulkOperations = dateArray.map((date : any) => ({
                  updateOne: {
                      filter: { roomId, date },
                      update: { $set: { price } },
                      upsert: true, // Jika data belum ada, tambahkan
                  },
              }));
      
              // Jalankan operasi bulk
              if (bulkOperations.length > 0) {
                  await SiteMinderModel.bulkWrite(bulkOperations);
              }
      
              res.status(200).json({
                  requestId: uuidv4(),
                  data: null,
                  message: `Prices ${roomId} updated for Custom date`,
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
      

        static async SetPriceWeekDay(req: Request, res: Response) {
          try {
              const { year, id, price } = req.query;
      
              // Validasi input
              if (!id || !price || !year) {
                  return res.status(400).json({
                      message: 'Room ID and price are required by Weekday',
                  });
              }
      
              // Ambil semua tanggal dalam tahun tertentu kecuali Jumat dan Sabtu

              const allDatesInYear = [];
              const startDate = new Date(`${year}-01-01`); // Awal tahun
              const endDate = new Date(`${year}-12-31`); // Akhir
      
              // Metode setDate() sering digunakan untuk memanipulasi tanggal dalam sebuah loop, seperti saat membuat daftar tanggal dalam satu tahun.
              for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) // getDate mengembalikan angka yang merepresentasikan hari dalam seminggu 
                
                {
                  // getDay() Mengembalikan hari dalam seminggu dari tanggal dan bulan tertentu sebagai nilai numerik
                  const dayOfWeek = d.getDay(); // Ex : 0 = Minggu, 1 = Senin, ..., 6 = Sabtu

                  if (dayOfWeek !== 5 && dayOfWeek !== 6) { // Kecualikan Jumat (5) dan Sabtu (6) untuk disimpan

                    //  mengembalikan tanggal dalam format ISO (contoh: 2025-01-01T00:00:00.000Z). .split('T')[0] mengambil bagian tanggal saja (contoh: 2025-01-01).
                      allDatesInYear.push(d.toISOString().split('T')[0]); 

                  }
              }
      
              // Siapkan operasi bulk untuk pembaruan harga
              const bulkOperations = allDatesInYear.map((date) => ({
                  updateOne: {
                      filter: { roomId: id, date },
                      update: { $set: { price } },
                      upsert: true, // Jika data belum ada, tambahkan
                  },
              }));
      
              // Jalankan operasi bulk
              if (bulkOperations.length > 0) {
                  await SiteMinderModel.bulkWrite(bulkOperations);
              }
      
              res.status(200).json({
                  requestId: uuidv4(),
                  data: null,
                  message: `Prices updated for all weekdays except Fridays and Saturdays`,
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

        static async SetPriceWeekend(req: Request, res: Response) {
          try {
            const { year, id, price } = req.query;
      
            // Validasi input
            if (!id || !price || !year) {
                return res.status(400).json({
                    message: 'Room ID and price are required by Weekday',
                });
            }
        
            // Ambil semua tanggal dalam tahun tertentu hanya untuk Jumat dan Sabtu

            const allDatesInYear = [];
            const startDate = new Date(`${year}-01-01`); // Awal tahun
            const endDate = new Date(`${year}-12-31`); // Akhir
    
        
            // Loop untuk mengidentifikasi tanggal yang jatuh pada Jumat dan Sabtu
            for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
              const dayOfWeek = d.getDay(); // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
        
              if (dayOfWeek === 5 || dayOfWeek === 6) { // Jumat (5) atau Sabtu (6)
                allDatesInYear.push(d.toISOString().split('T')[0]); // Menyimpan tanggal dalam format ISO
              }
            }
        
            // Siapkan operasi bulk untuk pembaruan harga
            const bulkOperations = allDatesInYear.map((date) => ({
              updateOne: {
                filter: { roomId: id, date },
                update: { $set: { price } },
                upsert: true, // Jika data belum ada, tambahkan
              },
            }));
        
            // Jalankan operasi bulk
            if (bulkOperations.length > 0) {
              await SiteMinderModel.bulkWrite(bulkOperations);
            }
        
            res.status(200).json({
              requestId: uuidv4(),
              data: null,
              message: `Prices updated for Fridays and Saturdays only`,
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
            // Logging(dateRange, "Hasil generate Date range");
        
            // Ambil data dari database
            const roomData = await ShortAvailableModel.find({ isDeleted: false });
        

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
            // Logging(dateRange, "Hasil generate Date range");
        
            // Ambil data dari database
            const roomData = await ShortAvailableModel.find({ isDeleted: false });
        
            const Room = await RoomModel.find({ isDeleted: false })

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
        
            // Format bulan agar selalu dua digit
            const monthStr = String(month).padStart(2, "0");
        
            // Dapatkan tanggal pertama bulan ini
            const startDate = new Date(`${year}-${monthStr}-01T00:00:00.000Z`);
        
            // Dapatkan tanggal terakhir bulan ini
            const endDate = new Date(startDate); 
            endDate.setMonth(endDate.getMonth() + 1); // Tambah 1 bulan
            endDate.setDate(0); // Set ke hari terakhir bulan sebelumnya (misal, 31 Januari)
            endDate.setUTCHours(23, 59, 59, 999);
            console.log("Query range:", startDate.toISOString(), " - ", endDate.toISOString());
        

            const AvailableRoom = await ShortAvailableModel.find(
              {
                status: "PAID",
                checkIn: {
                  $gte: startDate.toISOString(),
                  $lt: endDate.toISOString(),
                },
                isDeleted: false
              },
              { transactionId: 1, _id: 0 }
            );
            
            // console.log('data availble room :', AvailableRoom);
            
            // Ambil hanya transactionId dari AvailableRoom
            const transactionIds = AvailableRoom.map(room => room.transactionId);
            
            const filterQuery = {
              status: "PAID",
              checkIn: {
                $gte: startDate.toISOString(),
                $lt: endDate.toISOString(),
              },
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
              message: `Transaction ${year}-${monthStr}`,
              message2: `Query range:", ${startDate.toISOString()},  - , ${endDate.toISOString()}`,
              success: true
            });
        
          } catch (error) {
            res.status(500).json({ message: "Failed to fetch transactions", error });
          }
        }

        static async GetAllTransaction(req: Request, res: Response) {

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
        
        static async DeletedTransaction(req: Request, res: Response){

          try {
            let ShortAvailable ;
            let Transaction ;

            const { id } = req.query;
            
            ShortAvailable= await ShortAvailableModel.findOneAndUpdate({transactionId :  id},{ isDeleted: false },{ new: true, runValidators: true });
          
            if (!ShortAvailable) {
                return res.status(404).json({
                    requestId: uuidv4(),
                    data: null,
                    message: "Data ShortAvailable not found.",
                    success: false
                });
            }

             await ShortAvailableModel.updateMany(
                { transactionId: id },
                { isDeleted: true }
              );

            Transaction = await TransactionModel.findOneAndUpdate({bookingId :  id},{ isDeleted: false },{ new: true, runValidators: true });
          
            if (!Transaction) {
                return res.status(404).json({
                    requestId: uuidv4(),
                    data: null,
                    message: "Transaction not found.",
                    success: false
                });
            }
            await TransactionModel.updateMany(
              { bookingId: id },
              { isDeleted: true }
            );


            res.status(201).json(
                {
                    requestId: uuidv4(), 
                    data: [],
                    message: `Successfully Deleted ID : ${id}  `,
                    success: true
                }
            );


          } catch (error) {
            
            res.status(400).json(
                {
                    requestId: uuidv4(), 
                    data: null,
                    message:  (error as Error).message,
                    success: false
                }
            );

          }

        }

        static async UpdateTransactionDate(req: Request, res: Response){

          const {id_TRX ,Edit_Date} = req.body;
          
          const SetcheckIn = Edit_Date[0];
          const SetcheckOut = Edit_Date[Edit_Date.length - 1];

          // Konversi ke format ISO 8601
          const checkIn = new Date(`${SetcheckIn}T08:00:00.000Z`).toISOString();
          const checkOut = new Date(`${SetcheckOut}T05:00:00.000Z`).toISOString();

          // new Date() akan otomatis mengonversi string ISO 8601 menjadi objek Date di JavaScript.
          // Jika Mongoose mendeteksi bahwa field dalam skema bertipe Date, maka MongoDB akan menyimpannya dalam format ISO 8601 seperti berikut:

          try {

            // Jalankan dua update secara paralel menggunakan Promise.all() agar lebih cepat
            const [ShortAvailable, Transaction] = await Promise.all([
                ShortAvailableModel.findOneAndUpdate(
                    { transactionId: id_TRX, isDeleted: false },
                    { checkIn, checkOut },
                    { new: true, runValidators: true }
                ),
                TransactionModel.findOneAndUpdate(
                    { bookingId: id_TRX, isDeleted: false },
                    { checkIn, checkOut },
                    { new: true, runValidators: true }
                )
            ]);

            // Cek apakah data ditemukan
            if (!ShortAvailable || !Transaction) {
                return res.status(404).json({
                    requestId: uuidv4(),
                    data: null,
                    message: !ShortAvailable ? "Data ShortAvailable tidak ditemukan." : "Transaction tidak ditemukan.",
                    success: false
                });
            }


            res.status(201).json(
                {
                    requestId: uuidv4(), 
                    data: [],
                    // message: `Data yang akan diset ${checkIn}, dan ${checkOut}`,
                    message: `Data ${id_TRX}, has update`,
                    success: true
                }
            );


          } catch (error) {
            
            res.status(400).json(
                {
                    requestId: uuidv4(), 
                    data: null,
                    message:  (error as Error).message,
                    success: false
                }
            );

          }

        }
       

        static async UpdateStockRooms(req: Request, res: Response) {
          try {
            const { roomId, available } = req.body;
        
            if (!mongoose.Types.ObjectId.isValid(roomId)) {
              return res.status(400).json({
                requestId: uuidv4(),
                data: null,
                message: "Invalid roomId",
                success: false,
              });
            }
        
            const _id = new mongoose.Types.ObjectId(roomId);
        
            // Lakukan update dengan opsi new: true agar mendapatkan data terbaru
            const UpdateRoomsStock = await RoomModel.findOneAndUpdate(
              { _id, isDeleted: false },
              { available },
              { new: true } // Mengembalikan data terbaru
            );
        
            if (!UpdateRoomsStock) {
              return res.status(404).json({
                requestId: uuidv4(),
                data: null,
                message: "Room not found",
                success: false,
              });
            }
        
            res.status(200).json({
              requestId: uuidv4(),
              data: UpdateRoomsStock, // Kembalikan data terbaru
              message: `Stock ${UpdateRoomsStock.name} has been updated`,
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
}