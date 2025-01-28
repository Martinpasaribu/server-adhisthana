import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid'; 
import  UserModel  from "../../models/User/models_user";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { AxiosError } from 'axios';

import axios from "axios"; // Pastikan axios sudah terinstal



dotenv.config()

export class UserController {


    static async  getUser (req : any, res:any) {

        try {
            const users = await UserModel.find();
            res.status(200).json(users);
        } catch (error) {
            console.log(error);
        }
    }

    static async  cekUser (req : any, res:any) {

        try {

            const { email } = req.params;

            const users = await UserModel.findOne({email: email});

            if(users){
                res.status(200).json(
                    {
                        requestId: uuidv4(), 
                        message: "User Available.",
                        success: true,
                        data: users
                    }
                );
            }else {
                res.status(200).json(
                    {
                        requestId: uuidv4(), 
                        message: "User Unavailable.",
                        success: false,
                        data: users
                    }
                );
            }

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


    static async  Register  (req : any , res:any)  {
        const { title , name, email, password, phone } = req.body;

        // if (password !== confPassword) {
        //     return res.status(400).json({ msg: "Passwords are not the same" });
        // }
        let user

        if( password && password ){

            const salt = await bcrypt.genSalt();
            const hashPassword = await bcrypt.hash(password, salt);
    
            user = await UserModel.create({
            
                title: title,
                name: name,
                email: email,
                password: hashPassword,
                phone: phone
        
            });
        } else {

            user = await UserModel.create({
                title: title,
                name: name,
                email: email,
                phone: phone
        
            });

        }

        try {

            res.status(201).json(
                {
                    requestId: uuidv4(), 
                    data: user,
                    message: "Successfully register user.",
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


    static async ConfirmReset(req: any, res: any) {
        
        const { email, recaptchaToken } = req.body; // Tambahkan `recaptchaToken` dari klien

        try {
            // 1. Verifikasi reCAPTCHA
            const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
            
            const recaptchaResponse = await axios.get(
                `https://www.google.com/recaptcha/api/siteverify`,
                {
                    params: {
                        secret: recaptchaSecret,
                        response: recaptchaToken,
                    },
                }
            );
            

            const recaptchaData = recaptchaResponse.data;

            // Periksa status reCAPTCHA
            if (!recaptchaData.success || recaptchaData.score < 0.5) {
                return res.status(400).json({ message: "reCAPTCHA verification failed. Please try again." });
            }

            // 2. Cari user berdasarkan email
            const user = await UserModel.findOne({ email: email });

            if (!user) {
                return res.status(404).json({ message: `User with Email ${email} is not registered` });
            }

            // 3. Generate reset token
            const resetToken = jwt.sign({ email }, process.env.JWT_SECRET as string, { expiresIn: "1h" });
            const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

            // 4. Kirim email
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.APP_EMAIL,
                    pass: process.env.APP_PASS,
                },
            });

            await transporter.sendMail({
                from: `"Adhisthana Vila" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: "Password Reset Request",
                html: `
                    <p>Hello,</p>
                    <p>You have requested to reset your password. Please click the link below to reset your password:</p>
                    <a href="${resetLink}">Link you reset password</a>
                    <p>If you did not request this, please ignore this email.</p>
                `,
            });

            // 5. Respon sukses
            res.status(200).json({ message: "Password reset link has been sent to your email." });
        } catch (error) {
            res.status(500).json({ message: "An error occurred.", error: (error as Error).message });
        }
    }


    static async ResetPassword(req: any, res: any) {
        const { token, password, confirmPassword } = req.body;

        try {
            if (!token) {
                return res.status(400).json({ message: "Invalid or missing token." });
            }

            // Verify token
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
            const email = decoded.email;

            const user = await UserModel.findOne({ email });

            if (!user) {
                return res.status(404).json({ message: `User with Email ${email} is not registered` });
            }

            if (password !== confirmPassword) {
                return res.status(400).json({ message: "Passwords do not match." });
            }

            // Hash new password
            const salt = await bcrypt.genSalt();
            const hashPassword = await bcrypt.hash(password, salt);

            // Update password
            await UserModel.findOneAndUpdate({ email }, { password: hashPassword });

            res.status(200).json({ message: "Password has been successfully updated." });
        } catch (error) {

            const axiosError = error as AxiosError;

            if (axiosError.name === "JsonWebTokenError" || axiosError.name === "TokenExpiredError") {
                return res.status(400).json({ message: "Invalid or expired token." });
            }

            res.status(500).json({ message: "An error occurred.", error: axiosError.message });
        }
    }

}