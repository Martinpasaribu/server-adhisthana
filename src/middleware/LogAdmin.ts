import { Request, Response, NextFunction } from "express";
import { ActivityLogModel, IChangedPrices } from "../models/LogActivity/models_LogActivity";
import AdminModel from "../models/Admin/models_admin";
import UserModel from "../models/User/models_user";
import { BookingModel } from "../models/Booking/models_booking";



const CekUser = async (id: any) => {

  let user = await UserModel.findOne({ _id: id, isDeleted: false }).select("title name email phone");  
  console.log("Update Data user di LOG :", user );

  return user;
};

const CekBooking= async (id: any) => {

  let booking = await BookingModel.findOne({ orderId: id, isDeleted: false }).select("name email phone orderId checkIn checkOut verified reservation night amountTotal otaTotal room createdAt");
  console.log("Update Data user di LOG :", booking );

  return booking;
};




export const logActivity = (action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {

    

    try {

      let user = await CekUser(req.params.id || req.params.MessageId || req.params.UserId);
      let booking = await CekBooking(req.params.TransactionId || req.query.id || req.body.id_TRX);
      let adminId = req.body.adminId || req.session.userId; 
      const ipAddress = req.ip || req.socket.remoteAddress;
      const routePath = req.originalUrl; // Dapatkan route yang diakses
      let type = ""; // Target data yang akan dicatat di log
      let target = ""; // Target data yang akan dicatat di log
      let statement1 = ""; // Target data yang akan dicatat di log
      let statement2 = ""; // Target data yang akan dicatat di log
      let data = "";
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
          target = user ? (`ID  : ${user._id} ,  Name : ${user.name}`) : "-";
          break;

        case routePath.startsWith("/api/v1/admin/customer/deleted"):
          type = "Customer"
          target = user ? (`ID  : ${user._id} ,  Name : ${user.name}`) : "-";
          data = `${user}`
          break;

        case routePath.startsWith("/api/v1/admin/customer/set-block"):
          type = "Customer"
          target = user ? (`ID  : ${user._id} ,  Name : ${user.name}`) : "-";
          data = `${user}`
          break;

        case routePath.startsWith("/api/v1/admin/customer/set-active"):
          type = "Customer"
          target = user ? (`ID  : ${user._id} ,  Name : ${user.name}`) : "-";
          data = `${user}`
          break;

        case routePath.startsWith("/api/v1/admin/customer/update"):
          type = "Customer"
          target = user ? (`ID  : ${user._id} ,  Name : ${user.name}`) : "-";
          const body = req.body;

          // Ambil hanya properti yang bukan indeks angka
          const filteredData = Object.keys(body)
          .filter(key => Number.isNaN(Number(key)))
            .reduce((acc, key) => ({ ...acc, [key]: body[key] }), {}); // Simpan properti lainnya

          statement1 = `New Data : ${JSON.stringify(filteredData, null, 2)}`;

          statement2 = `Old Data : ${user}`
          break;
          
        case routePath.startsWith("/api/v1/admin/booking/set-verified"):
          type = "Booking"
          // const user = await CekUser(req.params.TransactionId);
          target = booking ? (`ID  : ${booking.orderId} ,  Name : ${booking.name}`) : "-";

          break;
          
        case routePath.startsWith("/api/v1/admin/booking/set-checkout"):
          type = "Booking"
          // const user = await CekUser(req.params.TransactionId);
          target = booking ? (`ID : ${booking.orderId} ,  Name : ${booking.name}`) : "-";

          break;

        case routePath.startsWith("/api/v1/reservation/add-reservation"):
          type = "Reservation"
          target = req.body.name || []
          data = `${JSON.stringify(req.body, null, 2)} `|| '-';
          break;

        case routePath.startsWith("/api/v1/reservation/pay-transaction"):
          type = "Reservation"
          target = booking ? (`ID : ${booking.orderId} ,  Name : ${booking.name}`) : "-";
          data = `${booking}`
          break;
          

        case routePath.startsWith("/api/v1/site/minder/del-transaction"):
          type = "Management"
          target = booking ? (`ID : ${booking.orderId} ,  Name : ${booking.name}`) : "-";

          break;

        case routePath.startsWith("/api/v1/site/minder/del-booking"):
          type = "Management"
          target = booking ? (`ID : ${booking.orderId} ,  Name : ${booking.name}`) : "-";
          data = `${booking}`
          break;

        case routePath.startsWith("/api/v1/site/minder/edit-date-transaction"):
          type = "Transaction"
          target = booking ? (`ID : ${booking.orderId} ,  Name : ${booking.name}`) : "-";
          statement1 = `New Date : ${JSON.stringify(req.body.Edit_Date, null, 2)}`;
          statement2 = `Old Date :  In [ ${booking?.checkIn} ] -  Out [ ${booking?.checkOut} ]`
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
        data,
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
        data,
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
