import bcrypt from "bcrypt";
import argon2 from "argon2";
import { v4 as uuidv4 } from 'uuid'; 
import dotenv from "dotenv";
import AdminModel from "../../../models/Admin/models_admin";
import axios, { AxiosError } from 'axios';


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

        const { title , username, password, status, role } = req.body;

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
                { role: true } 
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
}
