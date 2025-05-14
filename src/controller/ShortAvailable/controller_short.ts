
import { Request, Response, NextFunction  } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
// Gunakan dynamic import

import RoomModel from '../../models/Room/models_room';
import { BookingModel } from '../../models/Booking/models_booking';

import { TransactionModel } from '../../models/Transaction/models_transaksi';
import { ShortAvailableModel } from '../../models/ShortAvailable/models_ShortAvailable';
import moment from 'moment';
import { SiteMinderModel } from '../../models/SiteMinder/models_SitemMinder';
import { FilterAvailable, FilterAvailable02, FilterAvailableNested } from './FilterAvailableRoom';
import { SetPriceDayList } from './SetPriceDayList';
import { SetResponseShort } from './SetResponseShort';
import { FilterUnAvailable } from './FilterUnAvailable';
import { PendingRoomController } from '../PendingRoom/Controller_PendingRoom';
import { FilterAvailableWithRoomStatus, CompareDataHasBeenUsedWithRoomStatus } from '../Admin/RoomStatus/components/Filter';

export class ShortAvailableController {


        // Short Available Room from hash checkout
        static async getAvailableRooms(req: Request, res: Response) {

            try {
                const { checkIn, checkOut } = req.body;
        
                if (!checkIn || !checkOut) {
                    return res.status(400).json({ message: "Tanggal check-in dan check-out diperlukan." });
                }
        
                // Konversi tanggal ke UTC
                const checkInDate = new Date(checkIn);
                const checkOutDate = new Date(checkOut);
        
                if (checkInDate >= checkOutDate) {
                    return res.status(400).json({ message: "Tanggal check-out harus lebih besar dari tanggal check-in." });
                }
        
                // Debug: Log input tanggal dalam UTC
                // console.log("CheckIn UTC:", checkInDate.toISOString());
                // console.log("CheckOut UTC:", checkOutDate.toISOString());
        
                // Fiks Booking { checkIn dan CheckOut} : { 12 PM & 15 PM }

                // Query untuk mencari unavailable rooms
                const unavailableRooms = await ShortAvailableModel.find({
                    status: "PAID",
                    $or: [
                        {
                            checkIn: { $lt: checkOutDate.toISOString() }, 
                            checkOut: { $gt: checkInDate.toISOString() }, 
                        },
                    ],
                });
        
                // Debug: Log hasil query unavailableRooms
                // console.log("Unavailable Rooms:", unavailableRooms);
        
                // Hitung jumlah room yang sudah dipesan
                const roomUsageCount: Record<string, number> = {};

                unavailableRooms.forEach((transaction) => {
                    transaction.products.forEach((product: { roomId: mongoose.Types.ObjectId | string; quantity: number }) => {
                        const roomId = product.roomId.toString();
                        roomUsageCount[roomId] = (roomUsageCount[roomId] || 0) + product.quantity;
                    });
                });
        
                // Debug: Log hasil roomUsageCount
                // console.log("Room Usage Count:", roomUsageCount);
        
                // Ambil semua room dari database
                const allRooms = await RoomModel.find({ isDeleted: false });
        
                // Debug: Log semua room
                // console.log("All Rooms:", allRooms);
        
                // Filter room yang tersedia
                const availableRooms = allRooms
                    .map((room) => {
                        
                        const usedCount = roomUsageCount[room._id.toString()] || 0;
                        const availableCount = room.available - usedCount;
        
                        return {
                            ...room.toObject(),
                            availableCount: availableCount > 0 ? availableCount : 0,
                        };
                    })
                    .filter((room) => room.availableCount > 0);
        
                // Debug: Log room yang tersedia
                // console.log("Available Rooms:", availableRooms);
        
                res.status(200).json({
                    requestId: uuidv4(),
                    message: `Successfully retrieved rooms. From Date: ${checkInDate.toISOString()} To: ${checkOutDate.toISOString()}`,
                    success: true,
                    data: availableRooms,
                });
            } catch (error) {
                console.error(error);
                res.status(500).json({
                    requestId: uuidv4(),
                    message: (error as Error).message,
                    success: false,
                    data: null,
                });
            }
        }
        
        static async getShortVila(req: Request, res: Response) {
            const { checkin, checkout } = req.query;
        
            try {
            // Validasi dan konversi parameter checkin dan checkout
            if (!checkin || !checkout) {
                return res.status(400).json({
                    requestId: uuidv4(),
                    message: "Check-in and check-out dates are required.",
                    success: false,
                    data: null,
                });
            }
        
            // Query ke MongoDB
            const data = await BookingModel.find({
                isDeleted: false,
                checkIn:  checkin ,
                checkOut:  checkout ,
            });
        
            res.status(200).json({
                requestId: uuidv4(),
                message: `Successfully get vila.`,
                success: true,
                data: data,
            });
            
            } catch (error) {
            res.status(500).json({
                requestId: uuidv4(),
                message: (error as Error).message,
                success: false,
                data: null,
            });
            }
        }
      
        // In Use Controller Booking status update
        static async addBookedRoomForAvailable(data: any, res: Response) {
            try {

                // Cek apakah data dengan transactionId & userId sudah ada
                const existingAvailable = await ShortAvailableModel.findOne({
                    transactionId: data.transactionId,
                    userId: data.userId,
                    "products.roomId": { $in: data.products.map((p: any) => p.roomId) }
                });


                // Jika data sudah ada, kembalikan null agar fungsi pemanggil tahu tidak perlu menyimpan
                if (existingAvailable) {
                    return null;
                }

                // Membuat instance baru dengan data dari parameter
                const newAvailable = new ShortAvailableModel({
                    transactionId: data.transactionId,
                    userId: data.userId,
                    status: data.status,
                    checkIn: data.checkIn,
                    checkOut: data.checkOut,
                    products: data.products.map((product: { roomId: string; price: number; quantity: number; name: string }) => ({
                        roomId: product.roomId,
                        price: product.price,
                        quantity: product.quantity,
                        name: product.name
                    }))
                });

                // Simpan ke database
                const savedShort = await newAvailable.save();

                // Kembalikan data yang sudah disimpan
                // return savedShort;
                console.log("Successfully to save short Available :",savedShort );

            } catch (error) {
              // Menangani kesalahan dan mengirimkan respon gagal
              // Lemparkan error untuk ditangani oleh fungsi pemanggil
              throw new Error((error as Error).message);
            }
          }

        static async getTransactionsById (req: Request, res: Response) {
 
            const { transaction_id } = req.params;
            const transaction = await TransactionModel.findOne({bookingId : transaction_id});
        
            if(!transaction) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Transaction not found'
                })
            }
        
            res.status(202).json({
                status: 'success',
                data: transaction
            })
        };
        

        // Short Available Room from hash checkout In  { USE } 
        static async getAvailableRoomsWithSiteMinder(req: Request, res: Response) {

            try {
                const { checkIn, checkOut } = req.body;
        
                if (!checkIn || !checkOut) {
                    return res.status(400).json({ message: "Check-in and check-out dates are required." });
                }
        
                // Konversi tanggal ke UTC
                const checkInDate = new Date(checkIn);
                const checkOutDate = new Date(checkOut);

                const dateMinderStart = moment.utc(checkIn).format('YYYY-MM-DD'); 
                const dateMinderEnd = moment.utc(checkOut).subtract(1, 'days').format('YYYY-MM-DD'); 
                
                const dateMinderEnds = moment.utc(checkOut).format('YYYY-MM-DD');
                
                const Day =  {
                    In : dateMinderStart,
                    Out : dateMinderEnds
                }

                // console.log('test in :', checkIn, 'convert :', dateMinderStart);
                // console.log('test out :', checkOut, 'convert :', dateMinderEnd);
            
                
                if (checkInDate >= checkOutDate) {
                    return res.status(400).json({ message: "The check-out date must be greater than the check-in date." });
                }
              
                const siteMinders = await SiteMinderModel.find({
                    isDeleted: false,
                    date: { $gte: dateMinderStart, $lte: dateMinderEnd }, 
                });


                if (!siteMinders || siteMinders.length === 0) {
                    return res.status(404).json({ message: "No SiteMinder data found for that date." });
                }

                // const CekAja = await FilterAvailable02(checkInDate,checkOutDate)

                // Filter Room yang Available
                // const availableRooms = await FilterAvailable(checkInDate,checkOutDate)
                const availableRooms = await FilterAvailable02(checkInDate,checkOutDate);
                // const availableRooms = await FilterAvailableNested(checkInDate,checkOutDate);

                // Filter Room yang sudah penuh 

                // const unavailableRooms = await FilterUnAvailable(availableRooms.data_yg_ada)
                const unavailableRooms = await FilterUnAvailable(availableRooms)

                // Filter Room yang sudah tersedia namun butuh pengecekan apakah ada room yang masih dipending
                const availableRoomsWithoutPending = await PendingRoomController.FilterForUpdateVilaWithPending(availableRooms,checkInDate,checkOutDate)
                
                // Filter Room dengan harga yang sudah singkron dengan siteMinder
                const setPriceDayList = await SetPriceDayList(availableRoomsWithoutPending?.WithoutPending,siteMinders, Day)

                // Filter untuk singkron price per Item dengan lama malam -nya menjadi priceDateList
                const updateRoomsAvailable =  await SetResponseShort(availableRoomsWithoutPending?.WithoutPending,setPriceDayList)

                // Filter Terahkir untuk menentukan jenis room yang masih tersedia 
                const dataFilterStatusRoom = await FilterAvailableWithRoomStatus(checkInDate,checkOutDate);
                const FilterFinish = await CompareDataHasBeenUsedWithRoomStatus(updateRoomsAvailable,dataFilterStatusRoom);
                 
                res.status(200).json({
                    requestId: uuidv4(),
                    message: `Successfully retrieved rooms. From Date: ${checkInDate.toISOString()} To: ${checkOutDate.toISOString()}`,
                    success: true,
                   
                    availableRooms:availableRooms,
                    availableRoomsWithoutPending: availableRoomsWithoutPending,
                    dataUnAvailable: unavailableRooms?.length === 0  ? availableRoomsWithoutPending?.PendingRoom : unavailableRooms.concat(availableRoomsWithoutPending?.PendingRoom),
                    updateRoomsAvailable: updateRoomsAvailable,
                    data : FilterFinish,
                });
                
            } catch (error) {
                console.error(error);
                res.status(500).json({
                    requestId: uuidv4(),
                    message: (error as Error).message,
                    success: false,
                    data: null,
                });
            }
        }
        
}