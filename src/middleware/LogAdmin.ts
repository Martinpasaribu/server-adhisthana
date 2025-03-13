import { Request, Response, NextFunction } from "express";
import { ActivityLogModel, IChangedPrices } from "../models/LogActivity/models_LogActivity";
import AdminModel from "../models/Admin/models_admin";

export const logActivity = (action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {

      let adminId = req.body.adminId || req.session.userId; 
      const ipAddress = req.ip || req.socket.remoteAddress;
      const routePath = req.originalUrl; // Dapatkan route yang diakses
      let type = ""; // Target data yang akan dicatat di log
      let target = ""; // Target data yang akan dicatat di log
      let statement1 = ""; // Target data yang akan dicatat di log
      let statement2 = ""; // Target data yang akan dicatat di log
      let changedPrices: IChangedPrices | null = null; // ⬅️ Inisialisasi awal

      let date = [];
      // Handle jika admin ID tidak ditemukan, coba cari dari username
      if (!adminId && req.body.username) {
        const adminData = await AdminModel.findOne({ username: req.body.username });
        if (adminData) {
          adminId = adminData._id;
        } else {
          return next(); // Skip logging jika admin tidak ditemukan
        }
      }

      if (!adminId) return next();

      // Ambil data admin
      const DataAdmin = await AdminModel.findOne({ _id: adminId });
      if (!DataAdmin) {
        console.log("Data admin tidak ditemukan");
        return next();
      }

      // 🔹 **LOGIKA BERDASARKAN ROUTE**
      switch (true) {
        
        case routePath.startsWith("/api/v1/site/minder/set-minder"):
          type = "Management";
          target = req.body.roomId || "-";
          changedPrices =  req.body.changedPrices || {};

          break;

        case routePath.startsWith("/api/v1/site/minder/set-price-custom"):
          type = "Management"
          target = req.body.roomId || "-";
          statement1 =  req.body.price || "-";
          date =  req.body.dates || [];

          break;

        case routePath.startsWith("/api/v1/auth"):
          type = "Auth"
          target = req.body.email || "-";
          break;

        case routePath.startsWith("/api/v1/admin/customer/deleted-message"):
          type = "Customer"
          target = req.params.MessageId || "-";
          break;

        case routePath.startsWith("/api/v1/admin"):
          target = req.body.adminName || req.params.id || "Tidak ada Admin Data";
          break;

        case routePath.startsWith("/api/v1/booking"):
          target = req.body.bookingCode || req.params.id || "Tidak ada Booking Data";
          break;

        case routePath.startsWith("/api/v1/user"):
          target = req.body.username || req.params.id || "Tidak ada User Data";
          break;

        default:
          target = req.params.id || req.body.name || "Tidak ada Target Data";
          break;
      }

      // Simpan ke database
      await ActivityLogModel.create({
        adminId,
        type,
        username: DataAdmin.username,
        role: DataAdmin.role,
        statement1,
        statement2,
        changedPrices,
        date,
        action,
        target,
        ipAddress,
        routePath, // Tambahkan jalur yang diakses
      });

      console.log("Log Activity:", {
        adminId,
        type,
        username: DataAdmin.username,
        role: DataAdmin.role,
        action,
        statement1,
        statement2,
        date,
        target,
        ipAddress,
        routePath,
      });

      next();
    } catch (error) {
      console.error("Error logging activity:", error);
      next(error);
    }
  };
};







































// import { Request, Response, NextFunction } from "express";
// import { ActivityLogModel } from "../models/LogActivity/models_LogActivity";
// import AdminModel from "../models/Admin/models_admin";


// export const logActivity = (action: string) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       let adminId = req.body.adminId || req.session.userId ; // Ambil ID admin dari body atau token JWT
//       const target = req.params.id || req.body.name || req.params.TransactionId || req.params.MessageId || ""; // Target data yang diubah (opsional)
//       const ipAddress = req.ip || req.socket.remoteAddress;
      
//       let DataElse = req.body.username 
      
//       if (DataElse && !adminId) {
          
//           adminId = await AdminModel.findOne(
//               { username: DataElse }
//             );
            
//             return next(); // Jika tidak ada admin ID, lewati logging
//         }

        
//         if (!adminId) {
//             return next(); // Jika tidak ada admin ID, lewati logging
//         }

//         const DataAdmin = await AdminModel.findOne({ _id:adminId })

//       if (!DataAdmin) {

//           console.log("data admin tidak ditemukan")
//             return next(); // Jika tidak ada admin ID, lewati logging
//       }

//       await ActivityLogModel.create({
//         adminId,
//         username : DataAdmin.username,
//         role : DataAdmin.role,
//         action,
//         target,
//         ipAddress,
//       });

//       console.log("Data admin : ", DataAdmin)
//       next();
//     } catch (error) {
//       console.error("Error logging activity:", error);
//       next(error);
//     }
//   };
// };
