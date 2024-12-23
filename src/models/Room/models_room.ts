import mongoose, { Document, Schema } from 'mongoose';



interface Review {
    name: number;
    email: string;
    image: string;
    comment: string;
}


interface Image {
    row:number;
    image:string;
}

interface IRoom extends Document {
    _id: string;
    name: string;
    image: Image [],
    imageShort:string,
    imagePoster: string;
    maxCapacity: number;
    price:number;
    size: number;
    bedType: string;
    available: number;
    used: number;
    describe:string;
    shortDesc:string
    facility: string [];
    review: Review[];
    createAt: number;
    creatorId: string;
    rating: number;
    
    
}


const RoomSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, "name cannot be empty"],
            trim: true
        },
        maxCapacity: {
            type: Number,
            required: false,
            trim: true
        },
        shortDesc: {
            type: String,
            required: false,
            trim: true
        },
        
        describe: {
            type: String,
            required: false,
            trim: true
        },
        
        price: {
            type: Number,
            required: false,
            min: [1, 'price must more then 0'],
            trim: true
        },
        size: {
            type: Number,
            required: false,
            min: [1, 'size must more then 0'],
            trim: true
        },
        bedType: {
            type: String,
            required: false,
            trim: true
        },
        available: {
            type: Number,
            required: false,
            trim: true
        },
        image: [{
            row: {type: Number},
            image: {type: String}
        }],

        imagePoster: {
            type : String,
            required:false,
            trim: true,
        },
        imageShort: {
            type : String,
            required:false,
            trim: true,
        },

        facility: [{
            type: String
        }],

        rating: {
            type: String,
            required: false,
            trim: true
        },

        review: {
            type: String,
            required: false,
            trim: true
        },

        used: {
            type: Number,
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


const RoomModel = mongoose.model<IRoom>('Room', RoomSchema,'Room');

export default RoomModel;
