import mongoose, { Document, Schema } from 'mongoose';


interface IDish extends Document {

    _id: string;
    name: string;
    code: string;
    type: string;
    desc: string;
    stock: number;
    price: number;
    
    createAt: number;
    creatorId: string;
    
}

const DishSchema: Schema = new Schema(
    
    {

        type: {
            type: String,
            trim: true,
        },

        code: {
            type: String,
            trim: true,
        },
        name: {
            type: String,
            trim: true,
        },

        stock: {
            type: Number,
            default: null,
        },

        price: {
            type: Number,
            default: null,
        },

        desc: {
            type: String,
            default: null,
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


const DishModel = mongoose.model<IDish>('Dish', DishSchema,'Dish');

export default DishModel;
