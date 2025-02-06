import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid'; 
import dotenv from "dotenv";
import AdminModel from "../../../models/Admin/models_admin";



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

        const { title , name, password, status, role } = req.body;

        try {

            if( !title || !name || !password || !status || !role){
                return  res.status(400).json({
                    requestId: uuidv4(), 
                    message: `All Field can't be empty`,
                })
            }


            const salt = await bcrypt.genSalt();
            const hashPassword = await bcrypt.hash(password, salt);

            const user = await AdminModel.create({
                title: title,
                name: name,
                role : role,
                status: true,
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

}