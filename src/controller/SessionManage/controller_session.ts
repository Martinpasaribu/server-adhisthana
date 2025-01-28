
import { Request, Response, NextFunction  } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
// Gunakan dynamic import
import crypto from 'crypto';


import RoomModel from '../../models/Room/models_room';
import { BookingModel } from '../../models/Booking/models_booking';
import { snap } from '../../config/midtransConfig'


import { PENDING_PAYMENT } from '../../utils/constant';
import { SessionModel } from '../../models/Booking/models_session';
import { TransactionModel } from '../../models/Transaction/models_transaksi';
import { ShortAvailableController } from '../ShortAvailable/controller_short';
import moment from 'moment';
import { SiteMinderModel } from '../../models/SiteMinder/models_SitemMinder';
import { calculateTotalPrice, FilterRoomToCheckout } from './calculateTotalPrice';

export class SessionController {


        static async SetNight(req: Request, res: Response) {
            const { night, date } = req.body;
        
            // Validasi input
            if (!night || night <= 0) {
                return res.status(400).json(
                     
                    { message: 'Wrong in set night' }
                );
            }
        
            // Jika cart belum ada, inisialisasi
            if (!req.session.cart) {
                req.session.cart = [];
            }
        
            try {


                req.session.night = night
                req.session.date = date

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

        // Sementara tidak digunakakan
        static async setDate(req: Request, res: Response) {
           
            const { date } = req.body;
        
            // Validasi input
            if (!date || date <= 0) {
                return res.status(400).json(
                     
                    { message: 'Wrong in set date' }
                );
            }
        
            // Jika cart belum ada, inisialisasi
            if (!req.session.cart) {
                req.session.cart = [];
            }
        
            try {


                req.session.date = date
     
                req.session.save(err => {

                if (err) {
                    console.error('Error saving session:', err);
                    return res.status(500).json({ error: 'Failed to save session' });
                }

                res.json({
                    message: date + ' Date adding ',                 
                });

            });
        
            } catch (error) {
                console.error('Error add Date', error);
                
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

        // sudah di tambah siteminder data
        static async GetTotalPrice(req: Request, res: Response) {
            
            try {
                // Debugging: Lihat session yang ada di setiap permintaan
                // console.log('Session:', req.session);
        
                // Cek apakah cart ada di session
                if (!req.session.cart) {
                    req.session.cart = [];
                }
      
                // Ambil data cart dari session
                const cart = req.session.cart;
                const night = req.session.night;
                const date = req.session.date;
                
                // Jika cart kosong, kirimkan respons error
                if (cart.length === 0) {
                    return res.status(404).json({ message: 'There are problems in sessions charts' });
                }

                if (!night) {
                    return res.status(404).json({ message: 'There are problems in sessions night set' });
                }
                                                
                const dateMinderStart = moment.utc(date?.checkin).format('YYYY-MM-DD'); 
                const dateMinderEnd = moment.utc(date?.checkout).subtract(1, 'days').format('YYYY-MM-DD'); 


         



                            

                const siteMinders = await SiteMinderModel.find({
                    isDeleted: false,
                    date: { $gte: dateMinderStart, $lte: dateMinderEnd }, // Filter berdasarkan tanggal
                });

                // console.log('site minder data in server:', siteMinders); // Debugging

                const totalPrice = await calculateTotalPrice(cart, siteMinders);

                const Rooms = await FilterRoomToCheckout(cart, siteMinders);
        

        

                // Debugging totalPrice
                console.log('Total Price:', totalPrice); // Debugging
        
                // Kirim respons dengan cart dan total harga
                return res.status(200).json({
                    requestId: uuidv4(),
                    data: Rooms,
                    totalPrice: totalPrice,
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


        static async RemoveSession(req: Request, res: Response) {
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
                        message: 'Data Session successfully Remove in server.',
                        success: true,
                    });
                });
            } catch (error) {
                console.error('Error in Remove Data Session:', error);
                res.status(500).json({
                    requestId: uuidv4(),
                    data: null,
                    message: (error as Error).message,
                    success: false,
                });
            }
        }
        

        static async DelChartInSession(req: Request, res: Response) {

        
            try {
                
                // Pastikan cart ada dan itemId diberikan
                if (!req.session.cart ) {
                    return res.status(400).json({ message: 'Cart is empty ' });
                }

                req.session.cart = []

                res.status(200).json({
                    requestId: uuidv4(),
                    message: 'Field Chart has Deleted in session', 
                    cart: req.session.cart,
                });

            } catch (error) {
                
                console.error('Error in Deleted Field chart in session:', error);
                res.status(500).json({
                    requestId: uuidv4(),
                    data: null,
                    message: (error as Error).message,
                    success: false,
                });
            }
        }
        

 
}