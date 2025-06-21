import bcrypt from "bcrypt";
import { Request, Response, NextFunction  } from 'express';
import argon2 from "argon2";
import { v4 as uuidv4 } from 'uuid'; 
import dotenv from "dotenv";
import AdminModel from "../../../models/Admin/models_admin";
import axios, { AxiosError } from 'axios';
import mongoose from 'mongoose';


dotenv.config()

export class AdminUserController {

    static async  getAdmin (req : any, res:any) {

        try {
            const users = await AdminModel.find();
            res.status(200).json(users);

        } catch (error) {
            console.log(error);
        }
    }

    static async  RegisterAdmin  (req : any , res:any)  {

        const { title , username, password, status, role, userID } = req.body;

        try {

            if( !title || !username || !password || !status || !role){
                return  res.status(400).json({
                    requestId: uuidv4(), 
                    message: `All Field can't be empty`,
                })
            }

            // argon2 lebih tahan terhadap serangan GPU brute-force.
            const hashPassword = await argon2.hash(password);

            // const salt = await bcrypt.genSalt();
            // const hashPassword = await bcrypt.hash(password, salt);

            const user = await AdminModel.create({
                title: title,
                username: username,
                userID: userID, 
                role : role,
                status: status,
                active: true,
                password: hashPassword,
        
            });


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

    static async CheckMeAdmin  (req : any, res : any) {

        try {

            if(!req.session.userId){
                return res.status(401).json({ message: "Your session-Id no exists", success: false });
            }

            const user = await AdminModel.findOne(
                { _id: req.session.userId },
                { role: true, username:true } 
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

    static async  GetAdminUser (req : any, res:any) {

        try {

            const users = await AdminModel.find({isDeleted:false});
            
            res.status(200).json({
                requestId: uuidv4(),
                data: users,
                success: true
            });
        
        } catch (error) {

            console.log(error);
            // Kirim hasil response
            return res.status(400).json({
              requestId: uuidv4(),
              data: null,
              message: (error as Error).message || "Internal Server Error",
              success: false
            });

        }
    }

    static async SetBlock(req : any, res:any) {
        try {
        const { id } = req.params;

        // ✅ Validasi jika TransactionId tidak ada
        if (!id) {
            return res.status(400).json({
                requestId: uuidv4(),
                data: null,
                message: "ID is required!",
                success: false
            });

        }

        
    
        // ✅ Cari booking berdasarkan TransactionId
        const User = await AdminModel.findOne({

            _id: new mongoose.Types.ObjectId(id),
            isDeleted: false

        });
    
        if (!User) {
            return res.status(404).json({
            requestId: uuidv4(),
            data: null,
            message: "User not found!",
            success: false
            });
        }
    
        // ✅ Update status verified
        const blockUser = await AdminModel.findOneAndUpdate(
            { 
                _id: new mongoose.Types.ObjectId(id), isDeleted: false },
            {
                active: false
            },
            { new: true } // Mengembalikan data yang sudah diperbarui
        );
    
        if (!blockUser) {
                return res.status(400).json({
                requestId: uuidv4(),
                data: null,
                message: `Failed to block account ${User?.username}`,
                success: false
            });
        }
    
        console.log(`Block account ${User?.username}`);
    
        return res.status(200).json({
            requestId: uuidv4(),
            data: { acknowledged: true },
            message: `Successfully block account ${User?.username}`,
            success: true
        });
    
        } catch (error) {
        console.error("Error block User:", error);
    
        return res.status(500).json({
            requestId: uuidv4(),
            data: null,
            message: (error as Error).message || "Internal Server Error",
            success: false
        });
        }
    }

    static async SetActive(req: Request, res: Response) {
        try {
        const { id } = req.params;
    
        // ✅ Validasi jika TransactionId tidak ada
        if (!id) {

            return res.status(400).json({
            requestId: uuidv4(),
            data: null,
            message: "ID is required!",
            success: false
            });           
        }

    
        // ✅ Cari booking berdasarkan TransactionId
        const User = await AdminModel.findOne({

            _id: new mongoose.Types.ObjectId(id),
            isDeleted: false

        });
    
        if (!User) {
            return res.status(404).json({
            requestId: uuidv4(),
            data: null,
            message: "User not found!",
            success: false
            });
        }
    
        // ✅ Update status verified
        const blockUser = await AdminModel.findOneAndUpdate(
            { 
                _id: new mongoose.Types.ObjectId(id), isDeleted: false },
            {
                active: true
            },
            { new: true } // Mengembalikan data yang sudah diperbarui
        );
    
        if (!blockUser) {
            return res.status(400).json({
                requestId: uuidv4(),
                data: null,
                message: `Failed to active account ${User?.username}!`,
                success: false
            });
        }
    
        console.log(`Booking ${blockUser.username} has been verified`);
    
        return res.status(200).json({
            requestId: uuidv4(),
            data: { acknowledged: true },
            message: `Successfully active account ${User?.username}`,
            success: true
        });
    
        } catch (error) {
        console.error("Error active account:", error);
    
        return res.status(500).json({
            requestId: uuidv4(),
            data: null,
            message: (error as Error).message || "Internal Server Error",
            success: false
        });
        }
    }

    static async DeletedUser(req: Request, res: Response) {
        try {
          const { UserId } = req.params;
    
          // ✅ Validasi jika MessageId tidak ada
          if (!UserId) {
            return res.status(400).json({
              requestId: uuidv4(),
              data: null,
              message: "UserId is required!",
              success: false
            });
          }
    
          // ✅ Cari booking berdasarkan MessageId
          const UserData = await AdminModel.findOneAndUpdate( 
            { _id : new mongoose.Types.ObjectId(UserId), isDeleted: false },
            { isDeleted: true },
            { new: true } // Mengembalikan data yang diperbarui
          );


          if (!UserData) {
            return res.status(404).json({
              requestId: uuidv4(),
              data: null,
              message: "User Data not found!",
              success: false
            });
          }    
          
          return res.status(200).json({
            requestId: uuidv4(),
            data: { acknowledged: true },
            message: `Successfully deleted User: ${UserData.username}`,
            success: true
          });
    
        } catch (error) {
          
          console.error("Error deleted User Data:", error);
          return res.status(500).json({
            requestId: uuidv4(),
            data: null,
            message: (error as Error).message || "Internal Server Error",
            success: false
          });
        }
    }
}
