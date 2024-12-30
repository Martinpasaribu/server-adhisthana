import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import { jwtDecode } from 'jwt-decode';

import { AxiosError } from 'axios';
import { v4 as uuidv4 } from 'uuid'; 
import UserModel from "../../models/User/models_user";


dotenv.config();

export class AuthController {


    static async Login (req : any, res :any)  {
        try {
            console.log('Login attempt:', req.body); 

            const user = await UserModel.findOne({ email: req.body.email });

            if (!user) {
                return res.status(404).json({ msg: "User not found" });
            }

            const match = await bcrypt.compare(req.body.password, user.password);
            if (!match) {
                return res.status(400).json({ msg: "Wrong password" });
            }

            if (req.body.password !== req.body.confPassword) {
                return res.status(400).json({ msg: "Passwords are not the same" });
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

            await UserModel.findOneAndUpdate({ uuid: userId, refresh_token: refreshToken },{ new: true, runValidators: true } );

            // res.cookie('refreshToken', refreshToken, {
            //     httpOnly: true,
            //     secure: true,
            //     maxAge: 24 * 60 * 60 * 1000, 
            // });

            res.cookie('refreshToken', refreshToken, { 
                httpOnly: true, 
                secure: true, 
                sameSite: 'None', 
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

    static async Logout (req : any , res : any) { 
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.sendStatus(204);
        
        const user = await UserModel.findOne({ refresh_token: refreshToken });

        if (!user) return res.sendStatus(204);

        const userId = user._id;

        await UserModel.findOneAndUpdate({ refresh_token: null }, { uuid: userId } );

        res.clearCookie('refreshToken');

        req.session.destroy((err :any )=> {
            if (err) {
                return res.status(500).json({
                    message: "Could not log out",
                    success: false
                });
            }
            // Hanya kirim respons ini
            res.status(200).json({
                message: "Anda berhasil Logout",
                data:{
                    pesan: " haloo"
                },
                success: true
            });
        });
    };

}