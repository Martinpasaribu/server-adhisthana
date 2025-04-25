
import { Request, Response, NextFunction  } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { RoomStatusModel } from '../../../../models/RoomStatus/models_RoomStatus';

export class RoomStatusService {


  static async SetRoomStatus(data: any) {
    try {
      const {
        id_Trx,
        status,
        bookingKey,
        checkIn,
        checkOut,
        roomType = [],
      } = data;
  
      // Buat array data yang akan disimpan, gabungkan properties-nya
      const statusRooms = roomType.map((room: any) => ({
        bookingKey,
        id_Trx,
        status,
        checkIn,
        checkOut,
        ...room // spread semua properti dari setiap item roomType
      }));
  
      // Simpan semua data yang sudah digabung
      const newRoomStatus = await RoomStatusModel.insertMany(statusRooms);

      // Ambil semua _id ke dalam array
      const insertedIds = newRoomStatus.map(item => item._id);
      
      return {
        message: "Successfully created room statuses",
        status: true,
        data: newRoomStatus,
        roomStatusKey: insertedIds, // ✅ array berisi semua _id
      };

    } catch (error) {
      console.error("Error creating Room status:", error);
      return {
        status: false,
        message: error instanceof Error ? error.message : "Internal Server Error"
      };
    }
  }
  

}