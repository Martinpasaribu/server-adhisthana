import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import { jwtDecode } from 'jwt-decode';

import axios, { AxiosError } from 'axios';
import { v4 as uuidv4 } from 'uuid'; 
import UserModel from "../../models/User/models_user";
import { BookingModel } from "../../models/Booking/models_booking";
import { TransactionModel } from "../../models/Transaction/models_transaksi";
import { ShortAvailableModel } from "../../models/ShortAvailable/models_ShortAvailable";


dotenv.config();

export class AuthController {


    static async Login (req : any, res :any)  {

        try {

            const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
            
            const recaptchaResponse = await axios.get(
                `https://www.google.com/recaptcha/api/siteverify`,
                {
                    params: {
                        secret: recaptchaSecret,
                        response: req.body.recaptchaToken,
                    },
                }
            );
            

            const recaptchaData = recaptchaResponse.data;

            // Periksa status reCAPTCHA
            if (!recaptchaData.success || recaptchaData.score < 0.5) {
                return res.status(400).json({ message: "reCAPTCHA verification failed. Please try again." });
            }


            const user = await UserModel.findOne({ email: req.body.email });

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            if (!user.password) {
                return res.status(500).json({ message: "Set Password New", status:false });
            }

            const match = await bcrypt.compare(req.body.password, user.password);

            if (!match) {
                return res.status(400).json({ message: "Wrong password" });
            }


            if (req.body.password !== req.body.password) {
                return res.status(400).json({ message: "Passwords are not the same" });
            }

            const userId = user._id;
            const name = user.name;
            const email = user.email;
            req.session.userId = userId;

            const accessToken = jwt.sign({ userId, name, email }, process.env.ACCESS_TOKEN_SECRET as string, {
                expiresIn: '20s'
            });

            const refreshToken = jwt.sign({ userId, name, email }, process.env.REFRESH_TOKEN_SECRET as string, {
                expiresIn: '1d'
            });

            await UserModel.findOneAndUpdate(
                { _id: userId }, // Cari berdasarkan userId saja
                { refresh_token: refreshToken }, // Update refresh_token
                { new: true, runValidators: true } // Opsional: agar dokumen yang diperbarui dikembalikan
            );
            

            // res.cookie('refreshToken', refreshToken, {
            //     httpOnly: true,
            //     secure: true,
            //     maxAge: 24 * 60 * 60 * 1000, 
            // });

            res.cookie('refreshToken', refreshToken, { 
            secure: true,
            sameSite: 'none',
            httpOnly: false, 
                maxAge: 24 * 60 * 60 * 1000 
            });

            const decodedRefreshToken = jwtDecode(refreshToken);
            const expiresIn = decodedRefreshToken.exp;

            console.log(decodedRefreshToken);
            
            res.json({
                requestId: uuidv4(),
                data: {
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    expiresIn: expiresIn, 
                    user: user 
                },
                message: "Successfully Login",
                success: true
            });

        } catch (error) {
            const axiosError = error as AxiosError;
            const errorResponseData = axiosError.response ? axiosError.response.status : null;

            console.error('Error during login:', error); 

            res.status(500).json({
                message: "An error occurred during login",
                error: axiosError.message,
                error2: errorResponseData,
                stack: axiosError.stack 
            });
        }
    };

    static async Logout(req: any, res: any) {
        try {
          const refreshToken = req.cookies.refreshToken;
      
          // Jika tidak ada refresh token di cookie, langsung kirim status 204 (No Content)
          if (!refreshToken) {
            return res.status(404).json({
                message: "RefreshToken not found",
                success: false,
              });
          }
      
          // Cari user berdasarkan refresh token
          const user = await UserModel.findOne({ refresh_token: refreshToken });
      
          if (!user) {
          
            return res.status(404).json({
                message: "User not found",
                success: false,
              });
          }
      
          const userId = user._id;
      
          // Update refresh token menjadi null untuk user tersebut
          await UserModel.findOneAndUpdate(
            { _id: userId },
            { refresh_token: null }
          );
      
          // Hapus cookie refreshToken
          res.clearCookie('refreshToken');
      
          // Hancurkan sesi
          req.session.destroy((err: any) => {
            if (err) {
              // Jika terjadi error saat menghancurkan sesi
              return res.status(500).json({
                message: "Could not log out",
                success: false,
              });
            }
      
            // Kirim respons logout berhasil
            res.status(200).json({
              message: "Success logout",
              data: {
                pesan: "Logout berhasil",
              },
              success: true,
            });
          });

        } catch (error : any) {
          // Tangani error lainnya
          res.status(500).json({
            message: "An error occurred during logout",
            success: false,
            error: error.message,
          });
        }
      }
      

    
    static async Me  (req : any, res : any) {

        try {

            if(!req.session.userId){
                return res.status(401).json({ message: "Your session-Id no exists", success: false });
            }

            const user = await UserModel.findOne(
                {_id: req.session.userId},
                {
                    uuid:true,
                    name:true,
                    phone:true,
                    email:true,
                   
                }
        
            );

            if(!user) return res.status(404).json({ message: "Your session-Id no register", success: false });

            
        
            res.status(200).json({
                requestId: uuidv4(),
                data: user,
                message: "Your session-Id exists",
                success: true
            });
            
        } catch (error) {
            
            const axiosError = error as AxiosError;
            const errorResponseData = axiosError.response ? axiosError.response.status : null;

            console.error('Error during Session-Id:', error); 

            res.status(500).json({
                message: "An error occurred during Session-Id:",
                error: axiosError.message,
                error2: errorResponseData,
                stack: axiosError.stack,
                success: false
            });
            
        }
    }


    static async LoginCheckout (req : any, res :any)  {
        try {

            const user = await UserModel.findOne({ email: req.body.email, });

            
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const userId = user._id;
            const name = user.name;
            const email = user.email;
            req.session.userId = userId;
   
            // $ne adalah operator MongoDB yang berarti "not equal" (tidak sama).

            // // Update pada BookingModel
            // const bookingUpdate = await BookingModel.updateMany(
            //     { email, userId: { $ne: userId } }, 
            //     { userId } 
            // );

      
            // if (bookingUpdate.matchedCount === 0) {
            //     return res.status(200).json({ message: "No bookings updated. All matching records already have the same userId." });
            // }

            // // Update pada TransactionModel
            // const transactionUpdate = await TransactionModel.updateMany(
            //     { email, userId: { $ne: userId } }, 
            //     { userId } 
            // );

       
            // if (transactionUpdate.matchedCount === 0) {
            //     return res.status(200).json({ message: "No transactions updated. All matching records already have the same userId." });
            // }


            // await ShortAvailableModel.findOneAndUpdate({ email: req.body.email, },{userId:req.userId});            
            // if (!ShortAvailableModel) {
            //     return res.status(404).json({ message: "ShortAvailable not update" });
            // }
            

            const accessToken = jwt.sign({ userId, name, email }, process.env.ACCESS_TOKEN_SECRET as string, {
                expiresIn: '20s'
            });

            const refreshToken = jwt.sign({ userId, name, email }, process.env.REFRESH_TOKEN_SECRET as string, {
                expiresIn: '1d'
            });

            await UserModel.findOneAndUpdate(
                { _id: userId }, // Cari berdasarkan userId saja
                { refresh_token: refreshToken }, // Update refresh_token
                { new: true, runValidators: true } // Opsional: agar dokumen yang diperbarui dikembalikan
            );
            

            // res.cookie('refreshToken', refreshToken, {
            //     httpOnly: true,
            //     secure: true,
            //     maxAge: 24 * 60 * 60 * 1000, 
            // });

            res.cookie('refreshToken', refreshToken, { 
                httpOnly: false, 
                secure: true, 
                sameSite: 'None', 
                maxAge: 24 * 60 * 60 * 1000 
            });

            const decodedRefreshToken = jwtDecode(refreshToken);
            const expiresIn = decodedRefreshToken.exp;

            console.log(decodedRefreshToken);
            
            res.json({
                requestId: uuidv4(),
                // data: {
                //     accessToken: accessToken,
                //     refreshToken: refreshToken,
                //     expiresIn: expiresIn, 
                //     user: user 
                // },
                message: "Successfully Login",
                success: true
            });

        } catch (error) {
            const axiosError = error as AxiosError;
            const errorResponseData = axiosError.response ? axiosError.response.status : null;

            console.error('Error during login:', error); 

            res.status(500).json({
                message: "An error occurred during login",
                error: axiosError.message,
                error2: errorResponseData,
                stack: axiosError.stack 
            });
        }
    };
}