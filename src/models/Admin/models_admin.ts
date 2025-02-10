import mongoose, { Document, Schema } from 'mongoose';



interface IAdmin extends Document {
    title : string;
    username : string;
    password: string;
    role : string;
    status: string;
    active : boolean;
    refresh_token: string;
    createAt : number;
    creatorId: string;
}


const AdminSchema: Schema = new Schema(
    {

        title: {
            type: String,
            required: [true, "name cannot be empty"],
            trim: true
        },
        username: {
            type: String,
            // required: [true, "name cannot be empty"],
            trim: true
        },
        role: {
            type: String,
            enum: ["admin", "superAdmin"], // Sesuaikan dengan role yang diperlukan
            required: true,
            trim: true,
        },        
        status: {
            type: String,
            enum: ["block", "verify","pending"], // Sesuaikan dengan role yang diperlukan
            required: true,
            trim: true,
        },        
        active: {
            type: Boolean,
            // required: [true, "active cannot be empty"],
            trim: true
        },
        password: {
            type: String,
            // required: [true, "password cannot be empty"],
            trim: true
        },
        createAt: {
            type: Date,
            default: Date.now
        },
        refresh_token: {
            type: String,
            required: false
        },

        isDeleted: {
            type: Boolean,
            default: false  
        },


    },

    {
        timestamps: true,
    }

);

const  AdminModel = mongoose.model<IAdmin>('Admin', AdminSchema,'Admin');

export default AdminModel;

