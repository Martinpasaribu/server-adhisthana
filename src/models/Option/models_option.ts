import mongoose, { Document, Schema } from 'mongoose';



interface IOption extends Document {
  _id: string;
  price_total?: {
    startOfDay?: string;
    endOfDay?: string;
    status?: boolean;
    roomId?: string;
  };
  version_app?: {
    version: number | string;
    status: boolean;
    subject: string;
  };
  isDeleted: boolean;
  createAt: number;
  creatorId?: string;
}



const OptionSchema: Schema = new Schema(
  {
    price_total: {

        type: {

            status: { type: Boolean, default: false },
            roomId: { type: String, trim: true },
            startOfDay: { type: String, trim: true },
            endOfDay: { type: String, trim: true },

        },
        required: false, // <= ini penting
        default: undefined // <= pastikan tidak auto dibuat kosong
    },

    version_app: {
        type: {
            status: { type: Boolean },
            version: { type: String },
            subject: { type: String },
        },
        required: false, // <= ini penting
        default: undefined // <= pastikan tidak auto dibuat kosong
    },

    createAt: {
      type: Number,
      default: Date.now,
    },

    creatorId: {
      type: String,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);


const OptionModel = mongoose.model<IOption>('Option', OptionSchema,'Option');

export default OptionModel;
