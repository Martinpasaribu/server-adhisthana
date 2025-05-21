// controllers/reportController.ts

import ReportModel from '../../../models/Report/models_report';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import { BookingModel } from '../../../models/Booking/models_booking';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { RoomStatusModel } from '../../../models/RoomStatus/models_RoomStatus';
import { DateTime } from "luxon";
import OptionModel from '../../../models/Option/models_option';


export class ReportController {

    static async SaveReport (req: Request, res: Response) {
      
        try {

        const { date } = req.params
        
        const requestDate = new Date(date);
        const today = new Date();

        if (
          requestDate.getDate() !== today.getDate() ||
          requestDate.getMonth() !== today.getMonth() ||
          requestDate.getFullYear() !== today.getFullYear()
        ) {
          return res.status(400).json({
            requestId: uuidv4(),
            success: false,
            message: "Cannot change data other than today!",
            data: null,
          });
        }


        const { villa, incharge, mu_checkout, mu_extend, request, complain, lf, creatorId } = req.body;
    
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0); // jam 00:00:00
    
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999); // jam 23:59:59
    
        // Cari apakah report hari ini sudah ada
        const existingReport = await ReportModel.findOne({
          creatorId,
          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay
          },
          isDeleted: false
        });
    
        if (existingReport) {
          // Update data jika sudah ada
          existingReport.villa = villa;
          existingReport.incharge = incharge;
          existingReport.mu_checkout = mu_checkout;
          existingReport.mu_extend = mu_extend;
          existingReport.request = request;
          existingReport.complain = complain;
          existingReport.lf = lf;
          await existingReport.save();
    
          return res.status(200).json({ message: 'Report updated', data: existingReport });
        
        } else {
          // Buat baru jika belum ada

          const newReport = await ReportModel.create({
            villa,
            incharge,
            mu_checkout,
            mu_extend,
            request,
            complain,
            lf,
            creatorId,
            createAt: Date.now(),
          });
    
          return res.status(201).json({ message: 'Report created', data: newReport });
        }
    
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err });
      }
    };

    static async GetRoomStatusToday (req: Request, res: Response){

        try {

          dayjs.extend(utc);
          dayjs.extend(timezone);
          
          // Set zona waktu lokal yang kamu inginkan (contoh: Asia/Jakarta)
          const zone = 'Asia/Jakarta';

          // Buat start dan end of day berdasarkan timezone
          const startOfDay = dayjs().tz(zone).startOf('day').toDate();
          const endOfDay = dayjs().tz(zone).endOf('day').toDate();

          const startOfDayNonR = dayjs().tz(zone).subtract(1, 'day').startOf('day').toDate();
          const endOfDayNonR = dayjs().tz(zone).subtract(1, 'day').endOf('day').toDate();

          // Debug: tampilkan hasil dalam zona waktu lokal
          console.log("Report room status from", 
            startOfDay.toLocaleString('id-ID', { timeZone: zone }),
            "until", 
            endOfDay.toLocaleString('id-ID', { timeZone: zone })
          );


            // const startOfDay = new Date();
            // startOfDay.setHours(0, 0, 0, 0); // mulai dari jam 00:00:00
        
            // const endOfDay = new Date();
            // endOfDay.setHours(23, 59, 59, 999); // sampai jam 23:59:59
    
          const CheckInToday = await RoomStatusModel.find({
              status: true,
              isDeleted: false,
              checkIn: { $lte: endOfDay.toISOString() },  // <=
              checkOut: { $gt: endOfDay.toISOString() },  // >
          });

          const CheckOutToday = await RoomStatusModel.find({
            status: true,
            isDeleted: false,
            checkOut: {
              $gte: startOfDay.toISOString(), // mulai dari jam 00:00
              $lte: endOfDay.toISOString(),   // sampai jam 23:59:59
            },
          });

          const RoomTypeInToday = {
            CheckIn : CheckInToday,
            CheckOut : CheckOutToday

          }

            console.log(` Room status used today :, ${CheckInToday.length}, in date from : ${startOfDay}  to ${endOfDay} `);
            console.log(` Room status out today :, ${CheckOutToday.length}, in date from : ${startOfDay}  to ${endOfDay} `);
            
            const todayReport = await ReportModel.findOne({
                
                createdAt: {
                    $gte: startOfDay,
                    $lte: endOfDay
                },

                isDeleted: false
            });
            
        
            if (!todayReport) {


                const todayReportNonR = await ReportModel.findOne({
                  createdAt: {
                    $gte: startOfDayNonR,
                    $lte: endOfDayNonR,
                  },
                  isDeleted: false,
                });

                if (!todayReportNonR || !Array.isArray(todayReportNonR.villa)) {
                  return [];
                }

                const night: string[] = todayReportNonR.villa.map((villa: any) => villa.status3);
                
                console.log(" Report Night :", night)
              
                const villa: any[] = [];

                return res.status(200).json({
                    requestId: uuidv4(),
                    data: todayReport,
                    data_room_status: RoomTypeInToday,
                    data_night : night,     
                    message: 'No report found for today, room status today',
                    message2: `report room status from ${startOfDay} until ${endOfDay}`,
                    success: true
                  });
            };
        
            // Kirim hasil response
            return res.status(200).json({
              requestId: uuidv4(),
              data: todayReport,
              data_room_status: RoomTypeInToday,
              message: `report room status from ${startOfDay} until ${endOfDay}`,
              success: true
            });

        } catch (error) {

            console.error('Error fetching today report:', error);
            
            return res.status(500).json({
                requestId: uuidv4(),
                data: null,
                message: (error as Error).message || "Internal Server Error",
                success: false
            });
        }
    };


    static async GetReportByDate (req: Request, res: Response){
      
      try {
        
        const { date } = req.params;

        
        const dateWIB = DateTime.fromJSDate(new Date(date), { zone: 'Asia/Jakarta' });
        
        const previousDateWIB = dateWIB.minus({ days: 1 });

        const startOfDayNonR = previousDateWIB.startOf('day').toJSDate();
        const endOfDayNonR = previousDateWIB.endOf('day').toJSDate();

        if (!dateWIB.isValid) {
            return res.status(400).json({
                requestId: uuidv4(),
                data: null,
                message: "Invalid date format",
                success: false
            });
        }

          const startOfDay = dateWIB.startOf('day').toJSDate();
          const endOfDay = dateWIB.endOf('day').toJSDate();

            const CheckInToday = await RoomStatusModel.find({
                status: true,
                isDeleted: false,
                checkIn: { $lte: endOfDay.toISOString() },  // <=
                checkOut: { $gt: endOfDay.toISOString() },  // >
            });

            const CheckOutToday = await RoomStatusModel.find({
              status: true,
              isDeleted: false,
              checkOut: {
                $gte: startOfDay.toISOString(), // mulai dari jam 00:00
                $lte: endOfDay.toISOString(),   // sampai jam 23:59:59
              },
            });

            const RoomTypeInToday = {
              CheckIn : CheckInToday,
              CheckOut : CheckOutToday

            }

          const todayReport = await ReportModel.findOne({
            createdAt: {
              $gte: startOfDay,
              $lte: endOfDay,
            },
            isDeleted: false,
          });

      
          if (!todayReport) {
    
                const todayReportNonR = await ReportModel.findOne({
                  createdAt: {
                    $gte: startOfDayNonR,
                    $lte: endOfDayNonR,
                  },
                  isDeleted: false,
                });

                if (!todayReportNonR || !Array.isArray(todayReportNonR.villa)) {
                  return [];
                }

                const night: string[] = todayReportNonR.villa.map((villa: any) => villa.status3);
                
                console.log(" Report Night :", night)

                    
                return res.status(200).json({
                    requestId: uuidv4(),
                    data: [],
                    message: `No report found Next Prev for ${startOfDay}`,
                    data_room_status : RoomTypeInToday,
                    data_night : night,
                    date_req: date,
                    success: true
                  });
          }

      
          // Kirim hasil response
          return res.status(200).json({
            requestId: uuidv4(),
            data: todayReport,
            message: `Data Report : ${startOfDay}`,
            data_room_status : RoomTypeInToday,
            date_req: date,
            success: true
          });

      } catch (error) {

          console.error('Error fetching today report:', error);
          
          return res.status(400).json({
              requestId: uuidv4(),
              data: null,
              message: (error as Error).message || "Internal Server Error",
              success: false
          });
      }
  };
  
    static async GetReportByPrevNext (req: Request, res: Response){
        
        try {
          
          const { date } = req.params;

          if (!date || isNaN(new Date(date).getTime())) {
              return res.status(400).json({
                  requestId: uuidv4(),
                  data: null,
                  message: "Invalid Date",
                  success: false
              });
          }
          

            // const dateWIB = DateTime.fromJSDate(new Date(date), { zone: 'Asia/Jakarta' });
            const dateWIB = DateTime.fromISO(date, { zone: 'Asia/Jakarta' });

            const startOfDay = dateWIB.startOf('day').toJSDate();
            const endOfDay = dateWIB.endOf('day').toJSDate();
            // Mundurkan 1 hari
            const previousDateWIB = dateWIB.minus({ days: 1 });

            const startOfDayNonR = previousDateWIB.startOf('day').toJSDate();
            const endOfDayNonR = previousDateWIB.endOf('day').toJSDate();


            const CheckInToday = await RoomStatusModel.find({
                status: true,
                isDeleted: false,
                checkIn: { $lte: endOfDay.toISOString() },  // <=
                checkOut: { $gt: endOfDay.toISOString() },  // >
            });

            const CheckOutToday = await RoomStatusModel.find({
              status: true,
              isDeleted: false,
              checkOut: {
                $gte: startOfDay.toISOString(), // mulai dari jam 00:00
                $lte: endOfDay.toISOString(),   // sampai jam 23:59:59
              },
            });

            const RoomTypeInToday = {
              CheckIn : CheckInToday,
              CheckOut : CheckOutToday

            }

            const todayReport = await ReportModel.findOne({
              createdAt: {
                $gte: startOfDay,
                $lte: endOfDay,
              },
              isDeleted: false,
            });

        
            if (!todayReport) {
                
                const todayReportNonR = await ReportModel.findOne({
                  createdAt: {
                    $gte: startOfDayNonR,
                    $lte: endOfDayNonR,
                  },
                  isDeleted: false,
                });

                if (!todayReportNonR || !Array.isArray(todayReportNonR.villa)) {
                  return [];
                }

                const night: string[] = todayReportNonR.villa.map((villa: any) => villa.status3);
                
                console.log(" Report Night :", night)

                    
                return res.status(200).json({
                    requestId: uuidv4(),
                    data: [],
                    message: `No report found Next Prev for ${startOfDay}`,
                    data_room_status : RoomTypeInToday,
                    data_night : night,
                    date_req: date,
                    success: true
                  });

            }
        
            // Kirim hasil response
            return res.status(200).json({
              requestId: uuidv4(),
              data: todayReport,
              message: `Data Report : ${startOfDay}`,
              data_room_status : RoomTypeInToday,
              date_req: date,
              success: true
            });

        } catch (error) {

            console.error('Error fetching today report:', error);
            
            return res.status(400).json({
                requestId: uuidv4(),
                data: null,
                message: (error as Error).message || "Internal Server Error",
                success: false
            });
        }
    };
    

    //     static async GetReportByPrevNext (req: Request, res: Response){
        
    //     try {
          
    //       const { date } = req.params;

        
    //         // Kirim hasil response
    //         return res.status(200).json({
    //           requestId: uuidv4(),
    //           data: date,
    //           date_req: date,
    //           success: true
    //         });

    //     } catch (error) {

    //         console.error('Error fetching today report:', error);
            
    //         return res.status(400).json({
    //             requestId: uuidv4(),
    //             data: null,
    //             message: (error as Error).message || "Internal Server Error",
    //             success: false
    //         });
    //     }
    // };

    static async GetReportBooking (req: Request, res: Response){

        try {

            const ReportBooking = await BookingModel.find({isDeleted:false}).populate('roomStatusKey');

            // Kirim hasil response
            return res.status(200).json({
              requestId: uuidv4(),
              data: ReportBooking,
              success: true
            });

        } catch (error) {

            console.error('Error fetching report booking:', error);
            
            return res.status(500).json({
                requestId: uuidv4(),
                data: null,
                message: (error as Error).message || "Internal Server Error",
                success: false
            });
        }
    };


    // Pagination
    // static async GetReportBooking(req: Request, res: Response) {
    //   try {
    //     const page = parseInt(req.query.page as string) || 1;
    //     const limit = parseInt(req.query.limit as string) || 25;
    
    //     const skip = (page - 1) * limit;
    
    //     const total = await BookingModel.countDocuments({ isDeleted: false });

    //     const bookings = await BookingModel.find({ isDeleted: false })
    //       .populate('roomStatusKey')
    //       .skip(skip)
    //       .limit(limit);
    
    //     return res.status(200).json({
    //       requestId: uuidv4(),
    //       data: bookings,
    //       page,
    //       limit,
    //       total,
    //       success: true
    //     });
    
    //   } catch (error) {
    //     return res.status(500).json({
    //       requestId: uuidv4(),
    //       data: null,
    //       message: (error as Error).message || "Internal Server Error",
    //       success: false
    //     });
    //   }
    // }

    static async GetReportBookingByDate(req: Request, res: Response) {

      try {

        const { code, start, end, code2 } = req.params;

        // Validasi parameter tanggal
        if (!start || !end || isNaN(Date.parse(start)) || isNaN(Date.parse(end))) {
          return res.status(400).json({
            requestId: uuidv4(),
            data: null,
            message: "Invalid date format. Please use ISO format (e.g., 2024-12-25T00:00:00+07:00)",
            success: false,
          });
        }

        // Gunakan zona waktu Asia/Jakarta (WIB)
        const startLuxon = DateTime.fromISO(start, { zone: "Asia/Jakarta" }).startOf("day");
        const endLuxon = DateTime.fromISO(end, { zone: "Asia/Jakarta" }).endOf("day");

        const startOfDay = startLuxon.toISO(); // string ISO dgn offset WIB
        const endOfDay = endLuxon.toISO();
        
        
        console.log("start:", start);
        console.log("end:", end);
        console.log("startOfDay:", startOfDay); // 2025-05-01T00:00:00.000+07:00
        console.log("endOfDay:", endOfDay);     // 2025-05-05T23:59:59.999+07:00


        let todayReport: string | any[];

        if (code === "BO") {

          todayReport = await BookingModel.find({
            createdAt: {
              $gte: startOfDay,
              $lte: endOfDay,
            },
            isDeleted: false,
          }).populate("roomStatusKey");

        } else if (code2 === "SP" && code === "CI") {

          await OptionModel.updateOne(
            { isDeleted: false },
            {
              $set: {
                price_total: {
                  startOfDay: startOfDay,
                  endOfDay: endOfDay,
                  status: true,
                },
              },
            },
            { upsert: true }
          );

          console.log(' Save Price Date In update !')

          todayReport = await BookingModel.find({
            checkIn: {
              $gte: startOfDay,
              $lte: endOfDay,
            },
            isDeleted: false,
          }).populate("roomStatusKey");

        } else if (code === "CI") {

          todayReport = await BookingModel.find({
            checkIn: {
              $gte: startOfDay,
              $lte: endOfDay,
            },
            isDeleted: false,
          }).populate("roomStatusKey");

        } else if (code === "PY") {
          todayReport = [];
        } else {
          return res.status(400).json({
            requestId: uuidv4(),
            data: null,
            message: "Invalid code type",
            success: false,
          });
        }

        if (!todayReport || todayReport.length === 0) {
          return res.status(200).json({
            requestId: uuidv4(),
            data: [],
            message: `No report found from ${startOfDay} - ${endOfDay}`,
            success: true,
          });
        }

        return res.status(200).json({
          requestId: uuidv4(),
          data: todayReport,
          dataLength: todayReport.length,
          message: `Data Report: ${startOfDay} - ${endOfDay}`,
          success: true,
        });
      } catch (error) {
        console.error("Error fetching report:", error);
        return res.status(500).json({
          requestId: uuidv4(),
          data: null,
          message: (error as Error).message || "Internal Server Error",
          success: false,
        });
      }
    }


    static async UpdatePriceTotalByDate(req: Request, res: Response) {

      try {
        const SavedOption = await OptionModel.findOne({ isDeleted: false });

        if (!SavedOption || !SavedOption.price_total) {
          return res.status(404).json({
            requestId: uuidv4(),
            data: null,
            message: "No price_total data available.",
            success: false,
          });
        }

        const { startOfDay, endOfDay } = SavedOption.price_total;

        const todayReport = await BookingModel.find({

          checkIn: {
                $gte: startOfDay,
                $lte: endOfDay,
          },
          isDeleted: false,
          
        }).populate("roomStatusKey");

        return res.status(200).json({
          requestId: uuidv4(),
          data: todayReport,
          dataLength: todayReport.length,
          message: `Data Report: ${startOfDay} - ${endOfDay}`,
          success: true,
        });

      } catch (error) {

        console.error("Error fetching report:", error);

        return res.status(500).json({
          requestId: uuidv4(),
          data: null,
          message: (error as Error).message || "Internal Server Error",
          success: false,
        });
      }
    }



  // Pagination

  // static async GetReportBookingByDate(req: Request, res: Response) {
  //   try {
  //     const { code, start, end } = req.params;

        
  //     if( !code || !start || !end){
  //       return res.status(400).json({
  //         requestId: uuidv4(),
  //         data: null,
  //         message: "Date and Type date can't empty",
  //         success: false,
  //       });
  //     }

  //     // Validasi parameter tanggal
  //     if (!start || !end || isNaN(new Date(start).getTime()) || isNaN(new Date(end).getTime())) {
  //       return res.status(400).json({
  //         requestId: uuidv4(),
  //         data: null,
  //         message: "Invalid Date",
  //         success: false,
  //       });
  //     }


  //     // Atur rentang waktu hari tersebut (dari jam 00:00 sampai 23:59)
  //     const startOfDay = new Date(start);
  //     startOfDay.setHours(0, 0, 0, 0);

  //     const endOfDay = new Date(end);
  //     endOfDay.setHours(23, 59, 59, 999);

  //     let todayReport: string | any[] 

  //     if (code === "BO") {
  //       // Filter berdasarkan createdAt untuk CI
  //       todayReport = await BookingModel.find({
  //         createdAt: {
  //           $gte: startOfDay,
  //           $lte: endOfDay,
  //         },
  //         isDeleted: false,
  //       });
  //     } else if (code === "CI") {
  //       // Filter berdasarkan checkIn untuk BO
  //       // Pastikan field checkIn dalam format ISO date
  //       todayReport = await BookingModel.find({
  //         checkIn: {
  //           $gte: startOfDay.toISOString(),
  //           $lte: endOfDay.toISOString(),
  //         },
  //         isDeleted: false,
  //       });
  //     } else if (code === "PY") {
  //       // Logika khusus untuk kode PY bisa ditambahkan di sini
  //       todayReport = []; // Misalnya sementara kosong
  //     } else {
  //       return res.status(400).json({
  //         requestId: uuidv4(),
  //         data: null,
  //         message: "Invalid code type",
  //         success: false,
  //       });
  //     }

  //     if (!todayReport || todayReport.length === 0) {
  //       return res.status(200).json({
  //         requestId: uuidv4(),
  //         data: [],
  //         message: `No report found from ${startOfDay.toISOString()} - ${startOfDay.toISOString()}}`,
  //         success: true,
  //       });
  //     }

  //     return res.status(200).json({
  //       requestId: uuidv4(),
  //       data: todayReport,
  //       dataLength: todayReport.length,
  //       message: `Data Report: ${startOfDay.toISOString()} - ${endOfDay.toISOString()}`,
  //       success: true,
  //     });
  //   } catch (error) {
  //     console.error("Error fetching report:", error);
  //     return res.status(500).json({
  //       requestId: uuidv4(),
  //       data: null,
  //       message: (error as Error).message || "Internal Server Error",
  //       success: false,
  //     });
  //   }
  // }
  
}

