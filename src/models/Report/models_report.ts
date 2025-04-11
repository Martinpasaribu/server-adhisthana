import mongoose, { Document, Schema } from 'mongoose';



interface villa {
    roomId:string;
    type:string;
    name:string;
    status1:string;
    status2:string;
    r_receptionist:number;
    r_housekeeping:number;
}

interface IReport extends Document {
    _id: string;
    villa: villa[];
    incharge: string;
    mu_checkout: string;
    mu_extend: string;
    request: string;
    complain: string;
    lf: string;
    createAt: number;
    creatorId: string;  
    
}


const ReportSchema: Schema = new Schema(
    
    {
        villa: [{
            roomId: {type: String},
            type: {type: String},
            name: {type: String},
            status1: {type: String},
            status2: {type: String},
            r_receptionist: {type: String},
            r_housekeeping: {type: String},
        }],

        incharge: {
            type: String,
            trim: true,
        },

        mu_checkout: {
            type: String,
            trim: true,
        },
        mu_extend: {
            type: String,
            trim: true,
        },

        request: {
            type: String,
            trim: true,
        },

        complain: {
            type: String,
            trim: true,
        },

        lf: {
            type: String,
            trim: true,
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


const ReportModel = mongoose.model<IReport>('Report', ReportSchema,'Report');

export default ReportModel;
