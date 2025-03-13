
import { Request, Response, NextFunction  } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ActivityLogModel } from '../../../models/LogActivity/models_LogActivity';


export class LoggingController {

        static async GetAllLogging(req: Request, res: Response) {

          try {
           

            const ActivityLog = await ActivityLogModel.find({ isDeleted:false });
            
            // Kirim hasil response
            res.status(200).json({
              requestId: uuidv4(),
              data: ActivityLog,
              success: true
            });
        
          } catch (error) {
            res.status(500).json({ message: "Failed to fetch ActivityLog", error });
          }
        }
 

        static async GetLogsPagination (req: Request, res: Response) {

          try {
           
            let { page, limit } = req.query;

            const pageNumber = parseInt(page as string) || 1;
            const limitNumber = parseInt(limit as string) || 10;
            const skip = (pageNumber - 1) * limitNumber;

            // Ambil data log dengan pagination
            const logs = await ActivityLogModel.find()
            .skip(skip)
            .limit(limitNumber)
            .sort({ timestamp: -1 }); // Urutkan dari yang terbaru

            // Hitung total data
            const totalLogs = await ActivityLogModel.countDocuments();
         
            // Kirim hasil response
            res.status(200).json({
              requestId: uuidv4(),
              data: logs,
              totalPages: Math.ceil(totalLogs / limitNumber),
              totalAllLog: totalLogs,
              currentPage: pageNumber,
              success: true
            });
        
          } catch (error) {
            res.status(500).json({ message: "Failed to fetch ActivityLog Pagination", error });
          }
        }

        
}