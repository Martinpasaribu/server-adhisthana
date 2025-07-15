// Model: BookingModel

import { BookingModel } from "../../../../models/Booking/models_booking"
import { RoomConditionModel } from "../../../../models/RoomCondition/models_RoomCondition"

export async function getRoomsWithIssues() {
  try {
    // Ambil semua data yang belum dihapus
    const allData = await RoomConditionModel.find({
      isDeleted: false
    }).lean()

    const result = []

    for (const item of allData) {
      // Filter hanya rooms dengan status ≠ "bisa"
      const filteredRooms = item.rooms.filter(room => room.status !== 'bisa')

      // Jika ada room yang tidak "bisa", push ke hasil
      if (filteredRooms.length > 0) {
        result.push({
          category: item.category,
          rooms: filteredRooms.map(({ vila, name, status }) => ({
            vila,
            name,
            status
          }))
        })
      }
    }

    return result
  } catch (error) {
    console.error('Gagal mengambil data kamar bermasalah:', error)
    throw error
  }
}



// ✨ Opsional Versi Aggregation MongoDB (lebih cepat)
// Jika kamu ingin versi performa tinggi langsung di MongoDB:

// ts
// Salin
// Edit
// const result = await BookingModel.aggregate([
//   { $match: { isDeleted: false } },
//   {
//     $project: {
//       category: 1,
//       rooms: {
//         $filter: {
//           input: "$rooms",
//           as: "room",
//           cond: { $ne: ["$$room.status", "bisa"] }
//         }
//       }
//     }
//   },
//   { $match: { "rooms.0": { $exists: true } } } // hanya data yang punya room bermasalah
// ])