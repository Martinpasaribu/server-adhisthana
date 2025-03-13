import mongoose, { Schema, Document } from "mongoose";

export interface IChangedPrices {
  [roomId: string]: {
    [date: string]: {
      oldPrice: number;
      newPrice: number;
    };
  };
}



interface IActivityLog extends Document {
  adminId: string;
  action: string;
  username: string;
  type:string;
  role: string;
  target?: string;
  statement1?: string;
  statement2?: string;
  date?: string[]; // 🔹 Ubah ke array string langsung
  changedPrices?: IChangedPrices;
  timestamp: Date;
  ipAddress?: string;
}

const ActivityLogSchema: Schema = new Schema({
  adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
  action: { type: String, required: true },
  type: { type: String }, // Data yang dimodifikasi (opsional)
  target: { type: String }, // Data yang dimodifikasi (opsional)
  username: { type: String }, // Data yang dimodifikasi (opsional)
  statement1: { type: String }, // Data yang dimodifikasi (opsional)
  statement2: { type: String }, // Data yang dimodifikasi (opsional)
  date: [{ type: String }], // 🔹 Ubah jadi array string, bukan array objek
  role: { type: String }, // Data yang dimodifikasi (opsional)
  changedPrices: { type: Schema.Types.Mixed, default: {} }, // ✅ Simpan sebagai objek fleksibel
  timestamp: { type: Date, default: Date.now },
  ipAddress: { type: String }, // IP admin yang melakukan aksi
  isDeleted: {
      type: Boolean,
      default: false,
  },
});


export const ActivityLogModel = mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema, 'ActivityLog');
