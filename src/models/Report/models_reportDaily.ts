
import mongoose, { Document, Schema } from 'mongoose';



export interface IReportDaily extends Document {
    title: string
    category: string;
    content: string;
    creator: string;  
    
}


const ReportDailySchema: Schema = new Schema(
    
    {
    
        title: {
            type: String,
            trim: true,
        },
        category: {
            type: String,
            trim: true,
        },
        content: {
            type: String,
            trim: true,
        },

        creator: {
            type: String,
            required: false
        },

        createAt: {
            type: Number,
            default: Date.now
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


const ReportDailyModel = mongoose.model<IReportDaily>('ReportDaily', ReportDailySchema,'ReportDaily');

export default ReportDailyModel;