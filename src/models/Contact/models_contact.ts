import mongoose, { Document, Schema } from 'mongoose';



interface IContact extends Document {
    _id: string;
    name : string;
    email : string;
    phone : number;
    subject : string;
    message : string;
    createAt : number;
    creatorId: string;
   
    
    
}


const ContactSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, "name cannot be empty"],
            trim: true
        },
        email: {
            type: String,
            required: [true, "name cannot be empty"],
            trim: true
        },
        phone: {
            type: Number,
            required: false,
            min: [1, 'size must more then 0'],
            trim: true
        },
        subject: {
            type: String,
            required: false,
            trim: true
        },
        message: {
            type: String,
            required: false,
            trim: true
        },

        createAt: {
            type: Number,
            default: Date.now
        },
        creatorId: {
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


export const ContactModel = mongoose.model<IContact>('Contact', ContactSchema,'Contact');






interface ISubs extends Document {
    _id: string;
    email : string;
    createAt : number;
    creatorId: string;
   
    
    
}


const SubsSchema: Schema = new Schema(
    {

        email: {
            type: String,
            required: [true, "name cannot be empty"],
            trim: true
        },
       
        createAt: {
            type: Number,
            default: Date.now
        },
        creatorId: {
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


export const  SubsModel = mongoose.model<ISubs>('Subscribe', SubsSchema,'Subscribe');


