import mongoose, { Document, Schema } from 'mongoose'

// Status yang diperbolehkan
const VALID_STATUS = ['maintenance', 'rusak', 'bisa', 'tidak'] as const
type StatusType = typeof VALID_STATUS[number]

// Subschema kamar
interface IRoomCondition {
  vila :string
  name: string
  date:string
  status: StatusType
}

// Dokumen utama
export interface IRoomConditionDoc extends Document {
  category: string
  rooms: IRoomCondition[]
  isDeleted: boolean,
  createdAt:String
}

// Schema definisi
const RoomConditionSchema: Schema = new Schema<IRoomConditionDoc>(
  {
    category: {
      type: String,
      required: true,
      trim: true
    },
    rooms: [
      {
        vila: {
          type: String,
          required: true,
          trim: true
        },
        name: {
          type: String,
          required: true,
          trim: true
        },
        date: {
          type: Date,
          trim: true
        },
        status: {
          type: String,
          enum: VALID_STATUS,
          required: true
        }
      }
    ],
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

// Export model
export const RoomConditionModel = mongoose.model<IRoomConditionDoc>(
  'RoomCondition',
  RoomConditionSchema,
  'RoomCondition'
)
