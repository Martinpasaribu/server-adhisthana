import mongoose, { Document, Schema } from 'mongoose';



interface IUser extends Document {
    _id: string;
    title : string;
    name : string;
    password: string;
    email : string;
    block : boolean;
    phone : number;
    subject : string;
    message : string;
    BookingId: string;
    TransactionId: string;
    refresh_token: string;
    createAt : number;
    creatorId: string;
   
    
    
}




const UserSchema: Schema = new Schema(
    {

        title: {
            type: String,
            required: [true, "name cannot be empty"],
            trim: true
        },
        name: {
            type: String,
            // required: [true, "name cannot be empty"],
            trim: true
        },
        email: {
            type: String,
            required: [true, "email cannot be empty"],
            trim: true
        },
        password: {
            type: String,
            // required: [true, "password cannot be empty"],
            trim: true
        },
        phone: {
            type: Number,
            required: false,
            min: [8, 'size must more then 8'],
            trim: true
        },
       
        createAt: {
            type: Number,
            default: Date.now
        },

        block: {
            type: Boolean,
            default: false
        },

        BookingId: {
            type: String,
            required: false
        },

        TransactionId: {
            type: String,
            required: false
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

const  UserModel = mongoose.model<IUser>('User', UserSchema,'User');

export default UserModel;

