
import mongoose, { Document, Schema } from 'mongoose';


interface ISess extends Document {
    _id: string;
    bookingId : string;
    status : string;
    grossAmount: number;
    userId: string;
    
}


const SessionSchema: Schema = new Schema(
    {

        expires: {
            type: Date,
            required: [true, "bookingId cannot be empty"],
            trim: true
        },
        session: [
            {
                cookie :{
                    type: String,
                    trim:true
                },

                cart :[
                        {
                            roomId : { type : String},
                            quantity : { type : Number},
                            price : { type : Number}
                        }
                    ]
            }
        ],

       
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


export const  SessionModel = mongoose.model<ISess>('Session', SessionSchema,'Session');


