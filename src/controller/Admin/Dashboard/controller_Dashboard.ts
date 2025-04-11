import { v4 as uuidv4 } from 'uuid';
import RoomModel from '../../../models/Room/models_room';
import { TransactionModel } from '../../../models/Transaction/models_transaksi';
import UserModel from '../../../models/User/models_user';
import { ShortAvailableModel } from '../../../models/ShortAvailable/models_ShortAvailable';
import AdminModel from '../../../models/Admin/models_admin';

export class DashboardController {




    static async ChartTransaction(req: any, res: any) {
        try {
          // Ambil semua transaksi dari database
          const transactions = await TransactionModel.find({ isDeleted : false});
    
          if (transactions.length === 0) {
            return res.status(200).json({
              requestId: uuidv4(),
              data: {},
              success: true,
            });
          }
    
          // Objek untuk menyimpan hasil per tahun
          const yearlyData: Record<string, number[]> = {};
    
          // Iterasi transaksi untuk mengelompokkan berdasarkan tahun & bulan
          transactions.forEach((transaction) => {

            if (transaction.createdAt) {
              const transactionDate = new Date(transaction.checkIn);
              const transactionYear = transactionDate.getFullYear();
              const monthIndex = transactionDate.getMonth(); // 0 = Januari, 11 = Desember
    
              // Jika tahun belum ada di objek, buat array 12 bulan dengan default 0
              if (!yearlyData[transactionYear]) {
                yearlyData[transactionYear] = new Array(12).fill(0);
              }
    
              // Tambahkan transaksi ke bulan yang sesuai (hanya menghitung jumlahnya)
              yearlyData[transactionYear][monthIndex] += 1;
            }
          });
    
          // Kirim hasil response
          res.status(200).json({
            requestId: uuidv4(),
            data: yearlyData,
            success: true,
          });
        } catch (error) {
          res.status(500).json({
            requestId: uuidv4(),
            message: `Failed to fetch transaction data: ${error}`,
            success: false,
          });
        }
      }

    static async ChartPriceTransaction(req: any, res: any) {
        try {
          // Ambil semua transaksi dari database
          const transactions = await TransactionModel.find({ isDeleted : false});
    
          if (transactions.length === 0) {
            return res.status(200).json({
              requestId: uuidv4(),
              data: {},
              success: true,
            });
          }
    
          // Objek untuk menyimpan hasil per tahun
          const yearlyData: Record<string, number[]> = {};
    
          // Iterasi transaksi untuk mengelompokkan berdasarkan tahun & bulan
          transactions.forEach((transaction) => {
            if (transaction.createdAt) {
              const transactionDate = new Date(transaction.createdAt);
              const transactionYear = transactionDate.getFullYear();
              const monthIndex = transactionDate.getMonth(); // 0 = Januari, 11 = Desember
    
              // Jika tahun belum ada di objek, buat array 12 bulan dengan default 0
              if (!yearlyData[transactionYear]) {
                yearlyData[transactionYear] = new Array(12).fill(0);
              }
    
              // Tambahkan transaksi ke bulan yang sesuai
              yearlyData[transactionYear][monthIndex] += transaction.grossAmount;
            }
          });
    
          // Kirim hasil response
          res.status(200).json({
            requestId: uuidv4(),
            data: yearlyData,
            success: true,
          });
        } catch (error) {
          res.status(500).json({
            requestId: uuidv4(),
            message: `Failed to fetch transaction data: ${error}`,
            success: false,
          });
        }
      }

    static async TotalProduct(req: any, res: any) {

      try {
        
        // Query untuk TransactionModel (ambil semua data)
        const room = await RoomModel.find({ isDeleted : false});

        // Kirim hasil response
        res.status(200).json({
          requestId: uuidv4(),
          data: room.length,
          success: true
        });
    
      } catch (error) {
        res.status(500).json({
            requestId: uuidv4(),
            message: `Failed to fetch total room ${error}`,
            success: false 
        });
      }
    }

    static async TotalUser(req: any, res: any) {

      try {
        
        
        const user = await UserModel.find({ isDeleted : false});

        // Kirim hasil response
        res.status(200).json({
          requestId: uuidv4(),
          data: user.length,
          success: true
        });
    
      } catch (error) {
        res.status(500).json({
            requestId: uuidv4(),
            message: `Failed to fetch total user ${error}`,
            success: false 
        });
      }
    }

    static async TotalUserAdmin(req: any, res: any) {

      try {
        
        
        const user = await AdminModel.find({ isDeleted : false});

        // Kirim hasil response
        res.status(200).json({
          requestId: uuidv4(),
          data: user.length,
          success: true
        });
    
      } catch (error) {
        res.status(500).json({
            requestId: uuidv4(),
            message: `Failed to fetch total user ${error}`,
            success: false 
        });
      }
    }

    static async MostPurchased(req: any, res: any) {



      try {

        const RoomSold = await ShortAvailableModel.find({ isDeleted : false}).select('products');


        const roomCount: Record<string, number> = {}; 
  
        RoomSold.forEach(transaction => {
          transaction.products.forEach((product : any) => {
            if (roomCount[product.name]) {
              roomCount[product.name] += product.quantity;
            } else {
              roomCount[product.name] = product.quantity;
            }
          });
        });
  
        // Mengubah hasil ke dalam bentuk array
        const resultArray = Object.values(roomCount);
  
        console.log("cek : ", resultArray)
        
        // Kirim hasil response
        res.status(200).json({

          requestId: uuidv4(),
          data: resultArray,
          success: true
          
        });
    
      } catch (error) {

        res.status(500).json({
            requestId: uuidv4(),
            message: `Failed to fetch most purchased ${error}`,
            success: false 
        });
      }
    }





}