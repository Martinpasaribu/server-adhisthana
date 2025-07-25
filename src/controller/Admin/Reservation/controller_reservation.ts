
import { Request, Response, NextFunction  } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
const { ObjectId } = mongoose.Types;
import { ShortAvailableModel } from '../../../models/ShortAvailable/models_ShortAvailable';
import crypto from 'crypto';
import { TransactionModel } from '../../../models/Transaction/models_transaksi';
import { CekUser, Register } from './components/Index';
import { ReservationService } from './components/FilterWithRoomPending';
import { PendingRoomController } from '../../PendingRoom/Controller_PendingRoom';
import { ShortAvailableController } from '../../ShortAvailable/controller_short';
import { PAID, PAID_ADMIN, PAYMENT_ADMIN } from '../../../constant';
import { BookingModel } from '../../../models/Booking/models_booking';
import { OTAService } from './components/controller_OTA'
import { InvoiceController } from '../Invoice/controller_invoice';
import { Invoice } from '../../../models/Invoice/models_invoice';
import { CompareDataHasBeenUsedWithRoomStatus, CompareSameDataWithRoomStatus, FilterAvailableWithRoomStatus } from '../RoomStatus/components/Filter';
import { RoomStatusService } from '../RoomStatus/components/Service';
import { DeletedDataALLByID, DeletedDataALLByIDTransaction, FreeRoomAndAvailable } from '../SiteMinder/components/RefReschedule';
import { AddPayment } from './components/AddPayment';

// types/invoice.ts


interface ResponseData<T> {
  status: boolean;
  message: string;
  data?: T;
}

export class ReservationController {

        static async GetAllTransactionReservation(req: Request, res: Response) {

          try {
        
            // const AvailableRoom = await ShortAvailableModel.find(
            //   {
            //     status: { $in: ["PAID", "PAYMENT_ADMIN"] },
            //     isDeleted: false
            //   },
            //   { bookingId: 1, _id: 0 }
            // );
            
            // // Ambil hanya transactionId dari AvailableRoom
            // const transactionIds = AvailableRoom.map(room => room.bookingId);
            
            const filterQuery = {
              status: { $in: [PAYMENT_ADMIN, PAID_ADMIN] },
              reservation:true,
              isDeleted: false,
              // bookingId: { $in: transactionIds } // Mencocokkan bookingId dengan transactionId
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

        static async CountReservation(req: Request, res: Response) {
          try {
            
            const filterQuery = {
              status: { $in: [PAYMENT_ADMIN, PAID_ADMIN] },
              reservation: true,
              isDeleted: false
            };
            
            // HITUNG JUMLAH DOKUMEN TANPA MENGAMBIL DATA
            const count = await TransactionModel.countDocuments(filterQuery);
            
            res.status(200).json({
              requestId: uuidv4(),
              data: count,  // KIRIM JUMLAH SAJA
              success: true
            });

          } catch (error) {
            res.status(500).json({ 
              message: "Failed to count reservations",
              error: error instanceof Error ? error.message : error 
            });
          }
        }

        // static async CountReservationDetails(req: Request, res: Response) {
        //   try {
        //     const result = await TransactionModel.aggregate([
        //       {
        //         $match: {
        //           reservation: true,
        //           isDeleted: false,
        //           status: { $in: [PAYMENT_ADMIN, PAID_ADMIN] }
        //         }
        //       },
        //       {
        //         $group: {
        //           _id: "$status",
        //           count: { $sum: 1 }
        //         }
        //       }
        //     ]);

        //     // Konversi hasil agregasi ke format lebih mudah
        //     const counts = result.reduce((acc, curr) => {
        //       acc[curr._id] = curr.count;
        //       return acc;
        //     }, {});

        //     res.status(200).json({
        //       requestId: uuidv4(),
        //       counts: {
        //         total: result.reduce((sum, curr) => sum + curr.count, 0),
        //         ...counts
        //       },
        //       success: true
        //     });

        //   } catch (error) {
        //     res.status(500).json({ 
        //       message: "Failed to count reservations",
        //       error: error instanceof Error ? error.message : error 
        //     });
        //   }
        // }

        // {
        //   "counts": {
        //     "total": 15,
        //     "PAYMENT_ADMIN": 10,
        //     "PAID_ADMIN": 5
        //   }
        // }

        static async AddTransaction(req: Request, res: Response) {
          try {
              // Destructure req.body
              const {
                  title, 
                  name, 
                  email, 
                  phone, 
                  grossAmount, 
                  otaTotal,
                  reservation, 
                  products, 
                  night, 
                  voucher,
                  checkIn, 
                  checkOut,
                  selectOta,
                  roomType, 
              } = req.body;



              // Melakukan pengecekan apakah room type yang sedang dipilih apaka sudah sedang digunakan
              const dataFilterStatusRoom = await FilterAvailableWithRoomStatus(checkIn,checkOut);
              const CekRoomInUse = await CompareSameDataWithRoomStatus(roomType,dataFilterStatusRoom)
              
              // Jika terdapat data yang sudah digunakan kembalikan false
              if(CekRoomInUse.sameRoomTypeOnly.length > 0){
                return res.status(400).json({
                    requestId: uuidv4(),
                    message: "The room you have selected is currently in use",
                    success: false,
                    data: CekRoomInUse,
                });
              }

              // console.log(`Ini data payload room dari reservation: ${JSON.stringify(products, null, 2)}`);

              // ✅ Validasi data sebelum disimpan
              if (!title || !name || !email || !phone || !grossAmount || !checkIn || !checkOut || !selectOta) {
                  return res.status(400).json({
                      requestId: uuidv4(),
                      message: "All required fields must be provided!",
                      success: false,
                      data: null,
                  });
              }

              // Cek Roompending sebelum membuat reservation transaction 

              const ReservationReadyToBeSaved = await ReservationService.createReservation({products, checkIn, checkOut })

              // Cek Apakah Room Masih dalam tahap Pending semua
              if(ReservationReadyToBeSaved.WithoutPending === 0){
                    return res.status(400).json({
                      requestId: uuidv4(),
                      message: "All Room is Pending",
                      data:`Data Pending : ${ReservationReadyToBeSaved.PendingRoom}`,
                      success: false,
                  });
              }

              console.log(`Ini data reservation after filter : ${JSON.stringify(ReservationReadyToBeSaved.WithoutPending, null, 2)}`);
              
              // Mix data Product with OTA

              // const ProductClean = await OTAService.Mix_OTA(products,ReservationReadyToBeSaved.WithoutPending)

              // console.log(`Ini data reservation after Mix OTA : ${ProductClean}`);
              // Set Up Data Lain

              const bookingId = 'TRX-' + crypto.randomBytes(5).toString('hex');
              const status = PAYMENT_ADMIN



              // Daftarkan terlebih dahulu usernya

              const IsHaveAccount = await CekUser(email);

              let userId ;

              if (!IsHaveAccount){
                  userId = await Register(title, name, email, phone);
              }


              // ✅ Buat objek baru berdasarkan schema
              const newBooking = new BookingModel({
                  orderId : bookingId,
                  userId : IsHaveAccount ?? userId,
                  status,
                  title,
                  name,
                  email,
                  phone,
                  voucher,
                  amountTotal :grossAmount,
                  otaTotal :otaTotal,
                  reservation,
                  ota:selectOta,
                  room: ReservationReadyToBeSaved.WithoutPending,
                  night,
                  checkIn,
                  checkOut
              });

              // ✅ Simpan ke database Booking
              const savedBooking = await newBooking.save();


              // console.log(" add transaction with reservation : ", savedBooking)

              // ✅ Buat objek baru berdasarkan schema
              const newTransaction = new TransactionModel({
                booking_keyId: savedBooking._id,                                    
                bookingId,
                userId : IsHaveAccount ?? userId,
                status,
                title,
                name,
                email,
                phone,
                grossAmount,
                voucher,
                otaTotal,
                reservation,                 
                products: ReservationReadyToBeSaved.WithoutPending,
                night,                                                 
                checkIn,
                checkOut
              });                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       

              // Data untuk membuat status room
              const data = {
                id_Trx: bookingId,
                status: "Use",
                bookingKey:savedBooking._id,
                checkIn,
                checkOut,
                roomType,

              }
              
              // Fungsi untuk membuat status room 
              const createRoomStatus = await RoomStatusService.SetRoomStatus(data);

              if (createRoomStatus && createRoomStatus.roomStatusKey) {
                const roomStatusKey = createRoomStatus.roomStatusKey;

                const updatedInvoice = await BookingModel.findOneAndUpdate(
                  { _id: savedBooking._id, isDeleted: false },
                  { $push: { roomStatusKey } },
                  { new: true, runValidators: true }
                );

                console.log("RoomStatusKey successfully added to booking:", updatedInvoice);
              }


              // // ✅ Simpan ke database Booking
              // const savedBooking = await newBooking.save();

              // ✅ Simpan ke database Transaction
              const savedTransaction = await newTransaction.save()                                                                                                                                                                                                                                                                                                                                                                                                                                                                     

            
              // SetUp Room yang akan masuk dalam Room Pending
              await PendingRoomController.SetPending(ReservationReadyToBeSaved.WithoutPending,bookingId, IsHaveAccount ?? userId, checkIn, checkOut,"reservation", req, res )


              // ✅ Berikan respon sukses
              return res.status(201).json({
                  requestId: uuidv4(),
                  message: "Successfully add transaction to reservation.",
                  success: true,
                  data: {
                      acknowledged: true,
                      insertedTransactionId: savedTransaction._id,
                      insertedBoopkingId: savedBooking._id
                  },
              });

          } catch (error) {
              console.error("Error creating transaction:", error);

              return res.status(500).json({
                  requestId: uuidv4(),
                  message: (error as Error).message || "Internal Server Error",
                  success: false,
                  data: null,
              });
          }
        }

        // Membuat Reschedule 

        static async AddTransactionToReschedule(req: Request, res: Response) {
          try {
              // Destructure req.body
              const {
                  title, 
                  name, 
                  email, 
                  phone, 
                  grossAmount, 
                  otaTotal,
                  reservation, 
                  products, 
                  night, 
                  voucher,
                  checkIn, 
                  checkOut,
                  selectOta,
                  roomType, 
                  reschedule
              } = req.body;



              // Melakukan pengecekan apakah room type yang sedang dipilih apakah sudah sedang digunakan
              const dataFilterStatusRoom = await FilterAvailableWithRoomStatus(checkIn,checkOut);
              const CekRoomInUse = await CompareSameDataWithRoomStatus(roomType,dataFilterStatusRoom)
              
              // Jika terdapat data yang sudah digunakan kembalikan false
              if(CekRoomInUse.sameRoomTypeOnly.length > 0){
                return res.status(400).json({
                    requestId: uuidv4(),
                    message: "The room you have selected is currently in use",
                    success: false,
                    data: CekRoomInUse,
                });
              }

              // console.log(`Ini data payload room dari reservation: ${JSON.stringify(products, null, 2)}`);

              // ✅ Validasi data sebelum disimpan
              if (!title || !name || !email || !phone || !grossAmount || !checkIn || !checkOut || !selectOta) {
                  return res.status(400).json({
                      requestId: uuidv4(),
                      message: "All required fields must be provided!",
                      success: false,
                      data: null,
                  });
              }

              // Cek Room pending sebelum membuat reservation transaction 

              const ReservationReadyToBeSaved = await ReservationService.createReservation({products, checkIn, checkOut })

              // Cek Apakah Room Masih dalam tahap Pending semua
              if(ReservationReadyToBeSaved.WithoutPending === 0){
                    return res.status(400).json({
                      requestId: uuidv4(),
                      message: "All Room is Pending",
                      data:`Data Pending : ${ReservationReadyToBeSaved.PendingRoom}`,
                      success: false,
                  });
              }

              console.log(`Ini data reservation after filter : ${JSON.stringify(ReservationReadyToBeSaved.WithoutPending, null, 2)}`);
              
              // Mix data Product with OTA

              // const ProductClean = await OTAService.Mix_OTA(products,ReservationReadyToBeSaved.WithoutPending)

              // console.log(`Ini data reservation after Mix OTA : ${ProductClean}`);
              // Set Up Data Lain

              const bookingId = 'TRX-' + crypto.randomBytes(5).toString('hex');
              const status = PAYMENT_ADMIN



              // Daftarkan terlebih dahulu usernya

              const IsHaveAccount = await CekUser(email);

              let userId ;

              if (!IsHaveAccount){
                  userId = await Register(title, name, email, phone);
              }


              // ✅ Buat objek baru berdasarkan schema
              const newBooking = new BookingModel({
                  orderId : bookingId,
                  userId : IsHaveAccount ?? userId,
                  status,
                  title,
                  name,
                  email,
                  phone,
                  voucher,
                  amountTotal :grossAmount,
                  otaTotal :otaTotal,
                  reservation,
                  ota:selectOta,
                  room: ReservationReadyToBeSaved.WithoutPending,
                  night,
                  checkIn,
                  checkOut,
                  reschedule
              });

              // ✅ Simpan ke database Booking
              const savedBooking = await newBooking.save();


              // console.log(" add transaction with reservation : ", savedBooking)

              // ✅ Buat objek baru berdasarkan schema
              const newTransaction = new TransactionModel({
                booking_keyId: savedBooking._id,                                    
                bookingId,
                userId : IsHaveAccount ?? userId,
                status,
                title,
                name,
                email,
                phone,
                grossAmount,
                voucher,
                otaTotal,
                reservation,                 
                products: ReservationReadyToBeSaved.WithoutPending,
                night,                                                 
                checkIn,
                checkOut
              });                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       

              // Data untuk membuat status room
              const data = {
                id_Trx: bookingId,
                status: "Use",
                bookingKey:savedBooking._id,
                checkIn,
                checkOut,
                roomType,

              }
              
              // Fungsi untuk membuat status room 
              const createRoomStatus = await RoomStatusService.SetRoomStatus(data);

              if (createRoomStatus && createRoomStatus.roomStatusKey) {
                const roomStatusKey = createRoomStatus.roomStatusKey;

                const updatedInvoice = await BookingModel.findOneAndUpdate(
                  { _id: savedBooking._id, isDeleted: false },
                  { $push: { roomStatusKey } },
                  { new: true, runValidators: true }
                );

                console.log("RoomStatusKey successfully added to booking:", updatedInvoice);
              }


              // // ✅ Simpan ke database Booking
              // const savedBooking = await newBooking.save();

              // ✅ Simpan ke database Transaction
              const savedTransaction = await newTransaction.save()                                                                                                                                                                                                                                                                                                                                                                                                                                                                     

            
              // SetUp Room yang akan masuk dalam Room Pending
              await PendingRoomController.SetPending(ReservationReadyToBeSaved.WithoutPending,bookingId, IsHaveAccount ?? userId, checkIn, checkOut,"reservation", req, res )

              // Update data booking lama
              await BookingModel.findOneAndUpdate(
                { _id: new ObjectId(reschedule.key_reschedule) },
                {
                  $set: {
                    reschedule: reschedule
                  }
                },
                { new: true } // Opsional: untuk return data yang sudah di-update
              );

              // Pada saat Reschedule sudah dibuat Set Isdalate True ( Agar Qty room sebelumnya dilepas )
             const deleted = await FreeRoomAndAvailable(reschedule.key_reschedule);

              if (deleted) {
                console.log('✅ Semua FreeRoomAndAvailable berhasil dihapus.');
              } else {
                console.log('🔴  Gagal menghapus beberapa FreeRoomAndAvailable.');
              }


              // ✅ Berikan respon sukses
              return res.status(201).json({
                  requestId: uuidv4(),
                  message: "Successfully add Reschedule to Reservation.",
                  messageDeletedAll: ` statusnya : ${deleted},  ID Use : ${reschedule.key_reschedule}`,
                  success: true,
                  data: {
                      acknowledged: true,
                      insertedTransactionId: savedTransaction._id,
                      insertedBoopkingId: savedBooking._id
                  },
              });

          } catch (error) {
              console.error("Error creating transaction:", error);

              return res.status(500).json({
                  requestId: uuidv4(),
                  data: null,
                  message: (error as Error).message || "Internal Server Error",
                  requestMessage: 'Error creating Reschedule',
                  success: false,
              });
          }
        }

        static async SetPayment(req: Request, res: Response) {
          
          try {
              // Destructure req.body
              const { TransactionId, code } = req.params;
              const { invoice, payment } = req.body;

              console.log(" invoice : ", invoice)

              // ✅ Validasi data sebelum disimpan
              if (!TransactionId) {

                  return res.status(400).json({
                      requestId: uuidv4(),
                      data: null,
                      message: "required TransactionId!",
                      success: false
                  });
              }

            // Lalu pakai:
            let invoiceResult: ResponseData<Invoice[]> | null = null;


              if(code === "VLA"){
                  
                invoiceResult =  await InvoiceController.SetInvoice(invoice);
    
                  if (!invoiceResult.status) {
                    return res.status(400).json({
                      requestId: uuidv4(),
                      data: null,
                      message: invoiceResult.message,
                      success: false
                    });
                  }
              }

              const BookingReservation = await TransactionModel.find(
                { bookingId:TransactionId,  isDeleted : false, reservation: true}
              )

              
              if (!BookingReservation){
                    return res.status(400).json({
                      requestId: uuidv4(),
                      data: null,
                      message: "Transaction no found or Has Paid!",
                      success: false
                  });
              }

              const IsTransaction = await TransactionModel.findOneAndUpdate(
                {bookingId:TransactionId, isDeleted : false, status : PAYMENT_ADMIN, reservation: true},
                {
                  status: PAID_ADMIN
                }
              )

              if (!IsTransaction){
                    return res.status(400).json({
                      requestId: uuidv4(),
                      data: null,
                      message: "Set Transaction no found !",
                      success: false
                  });
              }

              console.log(`Transaction ${IsTransaction.name} has Pay`)

              await ShortAvailableController.addBookedRoomForAvailable({
                  transactionId: TransactionId,
                  userId: IsTransaction.userId, 
                  status: PAID,
                  checkIn: IsTransaction.checkIn,
                  checkOut: IsTransaction.checkOut,  
                  products: IsTransaction.products.map((product: { roomId: string; price: number; quantity: number; name: string }) => ({
                      roomId: product.roomId,
                      price: product.price,
                      quantity: product.quantity,
                      name: product.name,
                  })),
              }, res);


              // Perbaharui Room Pending pada saat user sudah melakukan transaction atau pembayaran gagal 
              const messagePendingRoom = await PendingRoomController.UpdatePending(TransactionId);

              const id_booking = IsTransaction.booking_keyId

              const StatusAddPayment = await AddPayment(payment, id_booking)
                

              // ✅ Berikan respon sukses
              return res.status(201).json({
                  requestId: uuidv4(),
                  data: {
                      acknowledged: true
                  },
                  resultInvoice: invoiceResult?.data ?? [],
                  message: `Successfully payment transaction : ${TransactionId}`,
                  messagePayment: `Data : ${JSON.stringify(payment)}, Status : ${StatusAddPayment}`,
                  messagePendingRoom: messagePendingRoom,
                  success: true
              });

          
          
          } catch (error) {
              console.error("Error creating transaction:", error);

              return res.status(500).json({
                  requestId: uuidv4(),
                  data: null,
                  message: (error as Error).message || "Internal Server Error",
                  success: false
              });
          }
        }

        

}