import mongoose, { Schema, Document } from "mongoose";

export interface IEventInfo extends Document {
  title: string;
  secret_key: string
  type: string; // "DSC" , "BAN"
  type_claim: "WA" | "WEB" | "WAW";
  code: string;
  desc: string;
  sub_desc: string;
  image: string;
  backgroundImage: string;
  video: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  location: string;
  createdAt: Date;
  updatedAt: Date;

  isDeleted: boolean;
}

const EventInfoSchema = new Schema<IEventInfo>(
  {
    title: { type: String, required: true },
    code: { type: String, required: true, unique: true, trim: true },

    secret_key : { type: String, required: true, default: null, unique: true },

    type: { type: String, required: true },
    type_claim: { type: String, required: true, enum: ["WA", "WEB", "WAW"] },

    desc: { type: String, required: true },
    sub_desc: { type: String, required: true },
    image: { type: String, required: false },
    backgroundImage: { type: String, required: false },
    video: { type: String, required: false },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    
    location: { type: String, required: false },
    isDeleted: {
        type: Boolean,
        default: false  
    },

  },
  { timestamps: true }
);

// ✅ Middleware: auto-nonaktifkan promo jika sudah kadaluarsa
EventInfoSchema.pre("save", function (next) {
  if (this.endDate < new Date()) {
    this.isActive = false;
  }
  next();
});

export const EventModel = mongoose.model<IEventInfo>('Event', EventInfoSchema,'Event');
