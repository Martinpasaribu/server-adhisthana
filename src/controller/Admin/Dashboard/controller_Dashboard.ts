import { v4 as uuidv4 } from 'uuid';
import RoomModel from '../../../models/Room/models_room';
import { TransactionModel } from '../../../models/Transaction/models_transaksi';
import UserModel from '../../../models/User/models_user';
import { ShortAvailableModel } from '../../../models/ShortAvailable/models_ShortAvailable';
import AdminModel from '../../../models/Admin/models_admin';
import { RoomStatusModel } from '../../../models/RoomStatus/models_RoomStatus';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import { RoomConditionModel } from '../../../models/RoomCondition/models_RoomCondition';
import { BookingModel } from '../../../models/Booking/models_booking';
import { getRoomsWithIssues } from './compoents/GetRoomsWithIssues';
import { PAID_ADMIN, PAYMENT_ADMIN } from '../../../constant';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export class DashboardController {

    static async ChartTransaction(req: any, res: any) {
        try {
          // Ambil semua transaksi dari database
          const transactions = await TransactionModel.find({ isDeleted : false});
    
          if (transactions.length === 0) {
            return res.status(200).json({
              requestId: uuidv4(),
              data: {},
              success: true,
            });
          }
    
          // Objek untuk menyimpan hasil per tahun
          const yearlyData: Record<string, number[]> = {};
    
          // Iterasi transaksi untuk mengelompokkan berdasarkan tahun & bulan
          transactions.forEach((transaction) => {

            if (transaction.createdAt) {
              const transactionDate = new Date(transaction.checkIn);
              const transactionYear = transactionDate.getFullYear();
              const monthIndex = transactionDate.getMonth(); // 0 = Januari, 11 = Desember
    
              // Jika tahun belum ada di objek, buat array 12 bulan dengan default 0
              if (!yearlyData[transactionYear]) {
                yearlyData[transactionYear] = new Array(12).fill(0);
              }
    
              // Tambahkan transaksi ke bulan yang sesuai (hanya menghitung jumlahnya)
              yearlyData[transactionYear][monthIndex] += 1;
            }
          });
    
          // Kirim hasil response
          res.status(200).json({
            requestId: uuidv4(),
            data: yearlyData,
            success: true,
          });
        } catch (error) {
          res.status(500).json({
            requestId: uuidv4(),
            message: `Failed to fetch transaction data: ${error}`,
            success: false,
          });
        }
      }

    static async ChartPriceTransaction(req: any, res: any) {
        try {
          // Ambil semua transaksi dari database
          const transactions = await TransactionModel.find({ isDeleted : false});
    
          if (transactions.length === 0) {
            return res.status(200).json({
              requestId: uuidv4(),
              data: {},
              success: true,
            });
          }
    
          // Objek untuk menyimpan hasil per tahun
          const yearlyData: Record<string, number[]> = {};
    
          // Iterasi transaksi untuk mengelompokkan berdasarkan tahun & bulan
          transactions.forEach((transaction) => {
            if (transaction.createdAt) {
              const transactionDate = new Date(transaction.createdAt);
              const transactionYear = transactionDate.getFullYear();
              const monthIndex = transactionDate.getMonth(); // 0 = Januari, 11 = Desember
    
              // Jika tahun belum ada di objek, buat array 12 bulan dengan default 0
              if (!yearlyData[transactionYear]) {
                yearlyData[transactionYear] = new Array(12).fill(0);
              }
    
              // Tambahkan transaksi ke bulan yang sesuai
              yearlyData[transactionYear][monthIndex] += transaction.grossAmount;
            }
          });
    
          // Kirim hasil response
          res.status(200).json({
            requestId: uuidv4(),
            data: yearlyData,
            success: true,
          });
        } catch (error) {
          res.status(500).json({
            requestId: uuidv4(),
            message: `Failed to fetch transaction data: ${error}`,
            success: false,
          });
        }
      }

    static async TotalProduct(req: any, res: any) {

      try {
        
        // Query untuk TransactionModel (ambil semua data)
        const room = await RoomModel.find({ isDeleted : false});

        // Kirim hasil response
        res.status(200).json({
          requestId: uuidv4(),
          data: room.length,
          success: true
        });
    
      } catch (error) {
        res.status(500).json({
            requestId: uuidv4(),
            message: `Failed to fetch total room ${error}`,
            success: false 
        });
      }
    }

    static async TotalUser(req: any, res: any) {

      try {
        
        
        const user = await UserModel.find({ isDeleted : false});

        // Kirim hasil response
        res.status(200).json({
          requestId: uuidv4(),
          data: user.length,
          success: true
        });
    
      } catch (error) {
        res.status(500).json({
            requestId: uuidv4(),
            message: `Failed to fetch total user ${error}`,
            success: false 
        });
      }
    }

    static async TotalUserAdmin(req: any, res: any) {

      try {
        
        
        const user = await AdminModel.find({ isDeleted : false});

        // Kirim hasil response
        res.status(200).json({
          requestId: uuidv4(),
          data: user.length,
          success: true
        });
    
      } catch (error) {
        res.status(500).json({
            requestId: uuidv4(),
            message: `Failed to fetch total user ${error}`,
            success: false 
        });
      }
    }

    static async MostPurchased(req: any, res: any) {



      try {

        const RoomSold = await ShortAvailableModel.find({ isDeleted : false}).select('products');


        const roomCount: Record<string, number> = {}; 
  
        RoomSold.forEach(transaction => {
          transaction.products.forEach((product : any) => {
            if (roomCount[product.name]) {
              roomCount[product.name] += product.quantity;
            } else {
              roomCount[product.name] = product.quantity;
            }
          });
        });
  
        // Mengubah hasil ke dalam bentuk array
        const resultArray = Object.values(roomCount);
  
        console.log("cek : ", resultArray)
        
        // Kirim hasil response
        res.status(200).json({

          requestId: uuidv4(),
          data: resultArray,
          success: true
          
        });
    
      } catch (error) {

        res.status(500).json({
            requestId: uuidv4(),
            message: `Failed to fetch most purchased ${error}`,
            success: false 
        });
      }
    }


    // Information Dashboard One ( Total booking(1month), Profit(1month), reservation)
    static async InfoDashboardOne(req: any, res: any) {

      dayjs.extend(utc);
      dayjs.extend(timezone);

      const zone = 'Asia/Jakarta';

      // Dapatkan tahun dan bulan saat ini
      const year = dayjs().year();
      const month = dayjs().month(); // 0-based (Juli = 6)

      // Buat waktu UTC dari waktu lokal Asia/Jakarta TANPA pergeseran mundur
      const startOfMonth = dayjs.utc(new Date(Date.UTC(year, month, 1, 0, 0, 0)));
      const endOfMonth = dayjs.utc(new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999)));

      // Output ke string ISO
      const startOfMonthF = startOfMonth.toISOString();
      const endOfMonthF = endOfMonth.toISOString();

          try {

            // 1. Hitung jumlah booking langsung di database
            const BookingOneMOnth = await BookingModel.countDocuments(
              { 
                isDeleted: false,
                checkIn: {
                    $gte: startOfMonthF,
                    $lte: endOfMonthF,
                },
              }
            );
            
            const filterQuery = {
              status: { $in: [PAYMENT_ADMIN, PAID_ADMIN] },
              reservation: true,
              isDeleted: false
            };
            
            // 2. HITUNG JUMLAH DOKUMEN TANPA MENGAMBIL DATA
            const ReservationTotal = await TransactionModel.countDocuments(filterQuery);
            

            // 3. HITUNG JUMLAH PROFIT Booking
            const ProfitMonth = await BookingModel.find(

              { 
                isDeleted: false,
                checkIn: {
                    $gte: startOfMonthF,
                    $lte: endOfMonthF,
                },
              }
              
            ).lean();

            const CountLessVilla = (data : any) =>  {
                const AmountLess = data
                    .filter((cek : any) => cek.code === "VLA")
                    .reduce((total : any, cek : any) => total + (cek.less || 0), 0); // tambahkan nilai awal = 0

                return AmountLess
            }

            // 1. Buat array penampung
            const valueToAddList: number[] = [];

            // console.log("===== START DEBUGGING totalAmountNormal() =====");


            ProfitMonth.forEach((item,index) => {
              const reschedule = item.reschedule;
              const voucher = item.voucher;
              const amountTotal = item.amountTotal || 0;
              const otaTotal = item.otaTotal || 0;
              const countLess = CountLessVilla(item.invoice) || 0;

              let valueToAdd = 0;

              // console.log(`\n--- Item ${index + 1} ---`);
              // console.log("_id:", item._id);
              // console.log("amountTotal:", amountTotal);
              // console.log("otaTotal:", otaTotal);
              // console.log("countLess:", countLess);

              if (reschedule?.status) {
                  // console.log("Reschedule STATUS: ACTIVE");
                  // console.log("reschedule.key_reschedule:", reschedule.key_reschedule);
                  // console.log("item._id:", item._id);
                  
                  // Perbaikan utama di sini:
                  if (reschedule.key_reschedule === item._id.toString()) { // Gunakan === dan pastikan tipe data sama
                      valueToAdd = amountTotal - otaTotal - countLess;
                      // console.log("✅ Normal Calculation (matching IDs):", valueToAdd);
                  } else {
                      valueToAdd = reschedule.reschedule_fee || 0;
                      // console.log("❌ Applying Reschedule Fee (non-matching IDs):", valueToAdd);
                  }

              } else {
                //  console.log("Reschedule STATUS: INACTIVE");
                if (voucher?.personal_voucher) {
                  valueToAdd = 0;
                  //  console.log("Voucher Applied (Personal Voucher) → valueToAdd = 0");
                } else {
                  valueToAdd = amountTotal - otaTotal - countLess;
                  //  console.log("No Voucher → Normal Calculation:", valueToAdd);
            
                }
              }



              // Masukkan ke array
              valueToAddList.push(valueToAdd);
              //  console.log("Final valueToAdd:", valueToAdd);
               
            });

            // console.log(valueToAddList)
            // 2. Hitung total jika perlu
            const TotalPrice = valueToAddList.reduce((sum, value) => sum + value, 0);

            // console.log("\n===== FINAL RESULT =====");
            // console.log("valueToAddList:", valueToAddList);
            // console.log("Total Amount:", valueToAddList.reduce((sum, value) => sum + value, 0));
            // console.log("=========================");


            // console.log(`✅ Profit start date from : ${startOfMonthF}  to : ${endOfMonthF}`,)

            // Kirim response
            res.status(200).json({
              requestId: uuidv4(),
              data: [],
              BookingOneMOnth: BookingOneMOnth,
              ReservationTotal: ReservationTotal,
              ProfitBookingPerMonth : TotalPrice,
              messageProfit:`Profit start date from : ${startOfMonthF}  to : ${endOfMonthF}`,
              success: true
            });
            
          } catch (error) {
            res.status(500).json({ 
              message: "Failed to count booking", 
              error: error instanceof Error ? error.message : error 
            });
          }
    }


    static async ModalRoomAvailable(req: any, res: any) {
      try {
        const monthParam = req.query.month // contoh: "2025-07"
        
        if (!monthParam) {
          return res.status(400).json({ message: 'Month is required' })
        }

        const startOfMonth = dayjs(monthParam).startOf('month')
        const endOfMonth = dayjs(monthParam).endOf('month')

        // Ambil semua data booking yang aktif (overlap) di bulan tersebut
        const data = await RoomStatusModel.find({
                          
          isDeleted: false,
          $or: [
                        
            {
                checkOut: { $gte: startOfMonth.toISOString() },
                checkIn: { $lte: endOfMonth.toISOString() }
              },
          ],

        })

        const AmountReschedule = await BookingModel.find({
                          
          isDeleted: false,
          "reschedule.status": { $eq: true },
          $or: [
                        
            {
                checkOut: { $gte: startOfMonth.toISOString() },
                checkIn: { $lte: endOfMonth.toISOString() }
              },
          ],

        })

        const AmountChancelBooking = await BookingModel.find({
                          
          isDeleted: true,
          "reschedule.status": { $eq: true },
          $or: [
                        
            {
                checkOut: { $gte: startOfMonth.toISOString() },
                checkIn: { $lte: endOfMonth.toISOString() }
              },
          ],

        })

        console.log('[Found Bookings]', data.length)
          data.forEach((item) => {
            console.log(
              `[${item.code}] From: ${dayjs(item.checkIn).format('YYYY-MM-DD')} To: ${dayjs(item.checkOut).format('YYYY-MM-DD')}`
            )
        });

        console.log(monthParam)
        console.log(startOfMonth.toDate())
        console.log(endOfMonth.toDate())
        console.log('data :', data)

        const daysInMonth = startOfMonth.daysInMonth()
        const result = []

        for (let i = 0; i < daysInMonth; i++) {
          const currentDate = startOfMonth.add(i, 'day')

          // Ambil semua villa yang aktif di tanggal ini
          const villasOnThisDay = data
            .filter(item =>
              dayjs(item.checkIn).isSameOrBefore(currentDate, 'day') &&
              dayjs(item.checkOut).isAfter(currentDate, 'day')
            )
            .map(item => item.code) // atau item.name kalau mau pakai nama

          // Kelompokkan per 3 kode villa
          const chunked = []
          for (let j = 0; j < villasOnThisDay.length; j += 3) {
            chunked.push({ vila: villasOnThisDay.slice(j, j + 3), color: 'use' })
          }

          result.push({
            date: currentDate.format('YYYY-MM-DD'),
            target_use: chunked
          })
        }

        return res.status(200).json({
          requestId: uuidv4(),
          data: result,
          dataAmountReschedule : AmountReschedule.length,
          dataAmountChancelBooking : AmountChancelBooking.length,
          success: true
        })
      } catch (err) {
        console.error('[ModalRoomAvailable Error]', err)
        return res.status(500).json({ message: 'Server error' })
      }
    }


    static async SaveRoomCondition(req: any, res: any) {
      try {
        const { data } = req.body

        if (!Array.isArray(data)) {
          return res.status(400).json({
            requestId: uuidv4(),
            success: false,
            message: 'Data harus berupa array'
          })
        }

        // Kosongkan koleksi dulu (jika replace all)
        await RoomConditionModel.deleteMany({})

        // Simpan semua data baru ke DB
        const inserted = await RoomConditionModel.insertMany(data)

        return res.status(200).json({
          requestId: uuidv4(),
          success: true,
          data: inserted
        })
      } catch (err) {
        console.error('[RoomCondition Save Error]', err)
        return res.status(500).json({
          requestId: uuidv4(),
          success: false,
          message: 'Terjadi kesalahan server'
        })
      }
    }


    static async GetRoomConditions(req: any, res: any) {
      try {
        const result = await RoomConditionModel.find({ isDeleted: false })

        return res.status(200).json({
          requestId: uuidv4(),
          success: true,
          data: result
        })
      } catch (err) {
        console.error('[RoomCondition GET Error]', err)
        return res.status(500).json({ message: 'Server error' })
      }
    }







    




}