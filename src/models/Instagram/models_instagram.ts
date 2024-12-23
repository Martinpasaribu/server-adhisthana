import mongoose, { Document, Schema } from 'mongoose';


interface Profile {
    _id: string;
    id: string;
    username: string;
    media_count: string;
    followers_count: number;
    follows_count: number;
    biography: string;
    website: string;
  }
  
  interface Content {
    _id: string;
    id: string;
    caption: string;
    media_type: string;
    media_url: string; 
    permalink: string; 
  }
  
  interface IInstagram extends Document {
    _id: string;
    profile: Profile; 
    content: Content[];
    createAt: number;
    creatorId: string;
  }
  
const InstagramSchema: Schema = new Schema(
    {
        profile: {
            type: Object,
            required: false,
            trim: true
        },

        content: [{
            type: Object,  
            required: false,
        }],
        
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


const InstagramModel = mongoose.model<IInstagram>('Instagram', InstagramSchema,'Instagram');

export default InstagramModel;
