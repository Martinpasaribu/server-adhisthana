
import { Request, Response, NextFunction  } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
// Gunakan dynamic import
import crypto from 'crypto';


import RoomModel from '../../models/Room/models_room';
import { BookingModel } from '../../models/Booking/models_booking';
import { snap } from '../../config/midtransConfig'

import { transactionService } from './transactionService';
import { generateBookingId } from './nanoid'

import { PENDING_PAYMENT } from '../../utils/constant';
import { SessionModel } from '../../models/Booking/models_session';
import { TransactionModel } from '../../models/Transaction/models_transaksi';
import { updateStatusBaseOnMidtransResponse } from './Update_Status';
import { ShortAvailableController } from '../ShortAvailable/controller_short';

export class BookingController {

        static async addBooking(req: Request, res: Response) {

            const BookingReq = req.body;

            try {
                       
                const roomDetails = await RoomModel.find({ _id: { $in: BookingReq.room.map((r: { roomId: any; }) => r.roomId) } });

                // Validate room availability
                for (const roomBooking of BookingReq.room) {
                    const room = roomDetails.find(r => r._id.toString() === roomBooking.roomId.toString());
                    if (!room) {
                        return res.status(400).json({ status: 'error', message: `Room with ID ${roomBooking.roomId} not found` });
                    }

                    // Check if the room is sold out or requested quantity exceeds availability
                    if (room.available <= 0) {
                        return res.status(400).json({ status: 'error', message: `Room with ID ${roomBooking.roomId} is sold out` });
                    }
                    if (roomBooking.quantity > room.available) {
                        return res.status(400).json({ 
                            status: 'error', 
                            message: `Room with ID ${roomBooking.roomId} has only ${room.available} available, but you requested ${roomBooking.quantity}` 
                        });
                    }
                }

                // Calculate gross_amount
                const grossAmount = roomDetails.reduce((acc, room) => {
                    const roomBooking = BookingReq.room.find((r : { roomId:any }) => r.roomId.toString() === room._id.toString());
                    return acc + room.price * roomBooking.quantity;
                }, 0);


                 const bookingId = 'TRX-' + crypto.randomBytes(5).toString('hex');


                
                // Create transaction in Midtrans
                const midtransPayload = {
                    transaction_details: {
                        order_id: bookingId,
                        gross_amount: grossAmount,
                    },  
                    customer_details: {
                        first_name: BookingReq.name, 
                        email: BookingReq.email, 
                    },
                    item_details: roomDetails.map(room => {
                        const roomBooking = BookingReq.room.find((r: { roomId: any }) => r.roomId.toString() === room._id.toString());
                        return {
                            id: room._id,
                            price: room.price,
                            quantity: roomBooking.quantity,
                            name: room.name,
                        };
                    }),
                };
                
                const midtransResponse = await snap.createTransaction(midtransPayload);
              
            
                
                const transaction = await transactionService.createTransaction({
                    bookingId,
                    name : BookingReq.name,
                    email : BookingReq.email,
                    status: PENDING_PAYMENT,
                    checkIn: BookingReq.checkIn, // Tambahkan properti ini jika dibutuhkan
                    checkOut: BookingReq.checkOut, // Tambahkan properti ini jika dibutuhkan
                    grossAmount,
                    userId: uuidv4(),
                    products: roomDetails.map(room => {
                        const roomBooking = BookingReq.room.find(
                          (r: { roomId: any }) => r.roomId.toString() === room._id.toString()
                        );
                        
                        return {
                          roomId: room._id,
                          name: room.name,
                          quantity: roomBooking?.quantity, // Optional chaining jika roomBooking tidak ditemukan
                          price: room.price, // Menambahkan price dari room
                        };
                      }),
                      
                    // snap_token: midtransResponse.token,
                    snap_token: '/',
                    paymentUrl: midtransResponse.redirect_url,
                    payment_type: midtransResponse.payment_type,
                    va_numbers: midtransResponse.va_numbers,
                    bank:midtransResponse.bank,
                    card_type: midtransResponse.card_type,
                });
                


                // Save booking (transaction) to your database
                const bookingData = {
                    name : BookingReq.name,
                    email : BookingReq.email,
                    orderId: bookingId,
                    checkIn: BookingReq.checkIn,
                    checkOut: BookingReq.checkOut,
                    adult: BookingReq.adult,
                    children: BookingReq.children,
                    amountTotal: grossAmount,
                    amountBefDisc: BookingReq.amountBefDisc || grossAmount, // Assuming discount might apply
                    couponId: BookingReq.couponId || null, // Optional coupon ID
                    userId: uuidv4(), // Replace with the actual user ID if available
                    creatorId: uuidv4(), // Replace with actual creator ID if available
                    rooms: roomDetails.map(room => {
                        const roomBooking = BookingReq.room.find(
                            (r: { roomId: any }) => r.roomId.toString() === room._id.toString()
                        );
                        return {
                            roomId: room._id,
                            quantity: roomBooking.quantity,
                        };
                    }),
                };


                const booking = await transactionService.createBooking(bookingData);


                res.status(201).json({
                    status: 'success',
                    data: {
                        message:' successfully On Checkout',
                        id:bookingId,
                        transaction,
                        paymentUrl: midtransResponse.redirect_url,
                        snap_token : midtransResponse.token
                    }
                });
                
                console.log("Successfully Add Booking ")

            } catch (error) {

                res.status(400).json(
                    {
                        requestId: uuidv4(), 
                        data: null,
                        message:  (error as Error).message,
                        success: false
                    }
                );

                console.log(" Error Booking ")
            }

        }
        
        static async getOffers(req: Request, res: Response) {
            const { checkin, checkout } = req.query;
        
            try {
              // Validasi dan konversi parameter checkin dan checkout
              if (!checkin || !checkout) {
                return res.status(400).json({
                  requestId: uuidv4(),
                  data: null,
                  message: "Check-in and check-out dates are required.",
                  success: false,
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
                data: data,
                message: `Successfully get vila.`,
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

        static async getRoomByParams(req: Request, res: Response) {
            
            let data ;

            const { id } = req.params; 
            
            try {
                    
                new mongoose.Types.ObjectId(id), 

                data = await RoomModel.find({ _id : id , isDeleted: false});
                
                res.status(201).json(
                    {
                        requestId: uuidv4(), 
                        data: data,
                        message: "Successfully Fetch Data Room by Params.",
                        success: true
                    }
                );

            } catch (error) {
                
                res.status(400).json(
                    {
                        requestId: uuidv4(), 
                        data: null,
                        message:  (error as Error).message,
                        RoomId: `Room id : ${id}`,
                        success: false
                    }
                );
            }

        }

        static async deletedRoomPermanent(req: Request, res: Response) {

            try {

                const { id } = req.params; 

            
                const deletedRoom = await RoomModel.findOneAndDelete({_id:id});

                
                res.status(201).json(
                    {
                        requestId: uuidv4(), 
                        data: deletedRoom,
                        message: "Successfully DeletedPermanent Data Room as Cascade .",
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

        static async updatePacketAll(req: Request, res: Response, next:NextFunction ) {

            const { id } = req.params; 
            const updateData = req.body; 
        
            try {
            
                const updatedPacket = await RoomModel.findOneAndUpdate(
                    { _id: id },         
                    updateData,            
                    { new: true, runValidators: true } 
                );
        
                if (!updatedPacket) {
                    return res.status(404).json({
                        requestId: uuidv4(), 
                        success: false,
                        message: "Packet not found",
                    });
                }
        
                res.status(200).json({
                    requestId: uuidv4(), 
                    success: true,
                    message: "Successfully updated Packet data",
                    data: updatedPacket
                });
        
            } catch (error) {
                res.status(400).json({
                    requestId: uuidv4(), 
                    success: false,
                    message: (error as Error).message,
                });
            }
        };
        
        static async updateRoomPart(req: Request, res: Response) {

            const { id } = req.params; 
            const updateData = req.body; 

            // if (updateData._id) {
            //     delete updateData._id;
            // }

            try {
            
                const updatedRoom = await RoomModel.findOneAndUpdate(
                    // new mongoose.Types.ObjectId(id),        
                    {_id:id},
                    updateData,            
                    { new: true, runValidators: true } 
                );
        
                if (!updatedRoom) {
                    return res.status(404).json({
                        requestId: uuidv4(), 
                        success: false,
                        message: "Room not found",
                    });
                }
        
                res.status(200).json({
                    requestId: uuidv4(), 
                    success: true,
                    message: "Successfully updated Room data",
                    data: updatedRoom
                });
        
            } catch (error) {
                res.status(400).json({
                    requestId: uuidv4(), 
                    success: false,
                    message: (error as Error).message,
                });
            }
        };

    // static async deletedSoftRoom(req: Request, res: Response) {

    //     try {

    //         let data ;
    //         const { id } = req.params;

    //         data = await RoomModel.findByIdAndUpdate(id, { isDeleted: true },{ new: true, runValidators: true });
      
    //         if (!data) {
    //             return res.status(404).json({
    //                 requestId: uuidv4(),
    //                 data: null,
    //                 message: "Room not found.",
    //                 success: false
    //             });
    //         }

    //         await ModuleModel.updateMany(
    //             { RoomId: id },
    //             { isDeleted: true }
    //         );

    //         const modules = await ModuleModel.find({ RoomId: id });
    //         const moduleId = modules.map((mod) => mod._id);
    //         await ChapterModel.updateMany(
    //             { moduleId: { $in: moduleId } },
    //             { isDeleted: true }
    //         );

    //         const chapters = await ChapterModel.find({ moduleId: { $in: moduleId } });
    //         const chapterId = chapters.map((ch) => ch._id);
    //         await QuestionModel.updateMany(
    //             { chapterId: { $in: chapterId } },
    //             { isDeleted: true }
    //         );

    //         res.status(201).json(
    //             {
    //                 requestId: uuidv4(), 
    //                 data: data,
    //                 message: `Successfully SoftDeleted Data : ${data} as Cascade `,
    //                 success: true
    //             }
    //         );

    //     } catch (error) {
            
    //         res.status(400).json(
    //             {
    //                 requestId: uuidv4(), 
    //                 data: null,
    //                 message:  (error as Error).message,
    //                 success: false
    //             }
    //         );
    //     }

    // }

        static async SetNight(req: Request, res: Response) {
            const { night } = req.body;
        
            // Validasi input
            if (!night || night <= 0) {
                return res.status(400).json(
                     
                    { message: 'UnSet Night' }
                );
            }
        
            // Jika cart belum ada, inisialisasi
            if (!req.session.cart) {
                req.session.cart = [];
            }
        
            try {


                req.session.night = night
     
                req.session.save(err => {

                if (err) {
                    console.error('Error saving session:', err);
                    return res.status(500).json({ error: 'Failed to save session' });
                }

                res.json({
                    message: night + ' Night adding ',                 
                });

            });
        
            } catch (error) {
                console.error('Error add Night', error);
                
                res.status(500).json({ message:  (error as Error).message,});
            }
        }

        static async PostChartRoom(req: Request, res: Response) {
            const { roomId, quantity } = req.body;
        
            // Validasi input
            if (!roomId || quantity <= 0) {
                return res.status(400).json({ error: 'Invalid input' });
            }
        
            // Jika cart belum ada, inisialisasi
            if (!req.session.cart) {
                req.session.cart = [];
            }
        
            try {
                // Cari data kamar berdasarkan roomId
                const room = await RoomModel.findById(roomId);
        
                if (!room) {
                    return res.status(404).json({ error: 'Room not found' });
                }
        
                const availableQty = room.available; // Ambil jumlah kamar yang tersedia
                const price = room.price; // Ambil harga dari database
        
                // Cari apakah roomId sudah ada di cart
                const existingItem = req.session.cart.find(item => item.roomId === roomId);
        
                if (existingItem) {
                    // Hitung jumlah total jika quantity ditambahkan
                    const newQuantity = existingItem.quantity + quantity;
        
                    if (newQuantity > availableQty) {
                        return res.status(400).json({ 
                            message: 'Quantity exceeds available rooms', 
                            available: availableQty 
                        });
                    }
        
                    // Tambahkan quantity jika valid
                    existingItem.quantity = newQuantity;
                } else {
                    // Periksa apakah jumlah yang diminta melebihi jumlah yang tersedia
                    if (quantity > availableQty) {
                        return res.status(400).json({ 
                            message: 'Quantity exceeds available rooms', 
                            available: availableQty 
                        });
                    }
        
                    // Tambahkan sebagai item baru
                    req.session.cart.push({ roomId, quantity, price });
                    req.session.deviceInfo = {
                        userAgent: req.get('User-Agent'), // Menyimpan informasi tentang browser/perangkat
                        ipAddress: req.ip, // Menyimpan alamat IP pengguna
                      };
                }
        
                // Hitung total harga
                const totalPrice = req.session.cart.reduce((total, item) => {
                    const itemPrice = Number(item.price);
                    const itemQuantity = Number(item.quantity);
                    return total + itemPrice * itemQuantity;
                }, 0);
        
                // Simpan perubahan ke session
                req.session.save(err => {

                    if (err) {
                        console.error('Error saving session:', err);
                        return res.status(500).json({ error: 'Failed to save session' });
                    }

                    res.json({
                        message: 'Item added to cart',
                        cart: req.session.cart,
                        totalPrice
                    });
                });
        
            } catch (error) {
                console.error('Error fetching room data:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        }
       

        static async DelChartRoom(req: Request, res: Response) {
            const { itemId } = req.body; // Ambil itemId dari request body
        
            // Pastikan cart ada dan itemId diberikan
            if (!req.session.cart || !itemId) {
                return res.status(400).json({ message: 'Cart is empty or itemId not provided' });
            }
        
            // Temukan item yang ingin dihapus atau dikurangi quantity-nya
            const item = req.session.cart.find(item => item.roomId === itemId);
        
            if (!item) {
                return res.status(404).json({ message: 'Item not found in cart' });
            }
        
            // Jika quantity lebih dari 1, kurangi quantity-nya
            if (item.quantity > 1) {
                item.quantity -= 1;
            } else {
                // Jika quantity 1, hapus item dari cart
                req.session.cart = req.session.cart.filter(item => item.roomId !== itemId);
            }
        
            return res.json({ message: 'Item updated in cart', cart: req.session.cart });
        }
        

        static async GetChartRoom (req : Request, res : Response) {


         try {
            
            const sessionId = req.cookies["connect.sid"];

            if (!sessionId) {
                return res.status(400).json({ error: "Session ID not provided" });
            }

            const session = await SessionModel.findOne({ _id: sessionId });

            return res.status(200).json(

                { 
                    data: session,
                    message: 'Get Chart Sucsessfully'
                }
            );

         } catch (error) {

            console.error('Error in GetChart:', error);
            return res.status(500).json({ error: 'Internal server error' });
         }


        };


        static async GetTotalPrice(req: Request, res: Response) {
            try {
                // Debugging: Lihat session yang ada di setiap permintaan
                console.log('Session:', req.session);
        
                // Cek apakah cart ada di session
                if (!req.session.cart) {
                    req.session.cart = [];
                }
      

                // Ambil data cart dari session
                const cart = req.session.cart;
                const night = req.session.night;
                
                console.log('Cart in server:', cart); // Debugging
        
                // Jika cart kosong, kirimkan respons error
                if (cart.length === 0) {
                    return res.status(404).json({ message: 'There are problems in sessions charts' });
                }
                if (!night) {
                    return res.status(404).json({ message: 'There are problems in sessions night set' });
                }
        
                // Hitung total harga: price * quantity untuk setiap item, lalu jumlahkan
                const totalPrice = cart.reduce((total, item) => {
                    const price = Number(item.price);
                    const malam = Number(night);
                    const quantity = Number(item.quantity);
                    return total + price * quantity * malam ;
                }, 0);
        
                const tax = totalPrice * 0.12;

                // Debugging totalPrice
                console.log('Total Price:', totalPrice); // Debugging
        
                // Kirim respons dengan cart dan total harga
                return res.status(200).json({
                    requestId: uuidv4(),
                    data: cart,
                    totalPrice: totalPrice + tax,
                    amountNight: night,
                    message: 'Successfully calculated total price.',
                    success: true,
                });
            } catch (error) {
                console.error('Error in GetTotalPrice:', error);
              
                res.status(500).json({
                    requestId: uuidv4(),
                    data: null,
                    // message: (error as Error).message,
                    message: 'Error to acumulation price'+ (error as Error).message, 
                    success: false,
                });
            }
        }
        
  
        // Will hit midtrans after payment
        static async TrxNotif(req: Request, res: Response) {
            try {
                const data = req.body;
        
                // console.log("Data from midtrans:", data);
        
                // Menghilangkan prefiks "order-" dari transaction_id
                const formattedTransactionId = data.order_id.replace(/^order-/, "");
        
                // console.log("Formatted Transaction ID:", formattedTransactionId);
        
                // Menunggu hasil findOne dengan bookingId yang sudah diformat
                const existingTransaction = await TransactionModel.findOne({ bookingId: formattedTransactionId });


                if (existingTransaction) {
                    // Properti bookingId sekarang tersedia
                    const result = updateStatusBaseOnMidtransResponse(data.order_id, data, res);
                    console.log('result = ', result);

                } else {

                    console.log('Transaction not found in server, Data =', data);
                }

                res.status(200).json({

                    status: 'success',
                    message: "OK"
    
                })

            } catch (error) {
                console.error('Error handling transaction notification:', error);
                
                res.status(500).json({ 
                    
                    error: 'Internal Server Error' 
                });
            }
        }
        

        static async CekSessions (req : Request, res : Response) {
            console.log('Session data:', req.session);
            res.json(req.session);
        };

          
        static async Checkout  (req : Request, res : Response) {
            
            const cart = req.session.cart;
          
            // Pastikan cart tidak kosong
            if (!cart || cart.length === 0) {
              return res.status(400).json({ error: 'Cart is empty' });
            }
          
            // Validasi ulang data di server (contoh: cek harga dan ketersediaan)
            // const isValid = await validateCart(cart); // Implementasi validasi tergantung kebutuhan
          
            // if (!isValid) {
            //   return res.status(400).json({ error: 'Invalid cart data' });
            // }
          
            // Simpan transaksi ke database
            // const transaction = await saveTransaction(cart);
          
            // Bersihkan session setelah checkout berhasil
            req.session.cart = [];
          
            // res.json({ message: 'Checkout successful', transactionId: transaction.id });
          
        };


        static async RemoveCart(req: Request, res: Response) {
            try {
                req.session.destroy((err) => {
                    if (err) {
                        console.error('Error destroying session:', err);
                        return res.status(500).json({
                            requestId: uuidv4(),
                            data: null,
                            message: 'Failed to delete session.',
                            success: false,
                        });
                    }
        
                    // Hapus cookie session
                    res.clearCookie('connect.sid'); // Ganti 'connect.sid' dengan nama cookie session Anda
        
                    res.status(200).json({
                        requestId: uuidv4(),
                        message: 'Session successfully deleted in server.',
                        success: true,
                    });
                });
            } catch (error) {
                console.error('Error in RemoveCart:', error);
                res.status(500).json({
                    requestId: uuidv4(),
                    data: null,
                    message: (error as Error).message,
                    success: false,
                });
            }
        }
        
        
}