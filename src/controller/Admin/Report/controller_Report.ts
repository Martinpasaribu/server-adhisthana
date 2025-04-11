// controllers/reportController.ts

import ReportModel from '../../../models/Report/models_report';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';

export class ReportController {

    static async SaveReport (req: Request, res: Response) {
      
        try {

        const { date } = req.params
        
        const requestDate = new Date(date);
        const today = new Date();

        if (
          requestDate.getDate() !== today.getDate() ||
          requestDate.getMonth() !== today.getMonth() ||
          requestDate.getFullYear() !== today.getFullYear()
        ) {
          return res.status(400).json({
            requestId: uuidv4(),
            success: false,
            message: "Cannot change data other than today!",
            data: null,
          });
        }


        const { villa, incharge, mu_checkout, mu_extend, request, complain, lf, creatorId } = req.body;
    
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0); // jam 00:00:00
    
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999); // jam 23:59:59
    
        // Cari apakah report hari ini sudah ada
        const existingReport = await ReportModel.findOne({
          creatorId,
          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay
          },
          isDeleted: false
        });
    
        if (existingReport) {
          // Update data jika sudah ada
          existingReport.villa = villa;
          existingReport.incharge = incharge;
          existingReport.mu_checkout = mu_checkout;
          existingReport.mu_extend = mu_extend;
          existingReport.request = request;
          existingReport.complain = complain;
          existingReport.lf = lf;
          await existingReport.save();
    
          return res.status(200).json({ message: 'Report updated', data: existingReport });
        
        } else {
          // Buat baru jika belum ada

          const newReport = await ReportModel.create({
            villa,
            incharge,
            mu_checkout,
            mu_extend,
            request,
            complain,
            lf,
            creatorId,
            createAt: Date.now(),
          });
    
          return res.status(201).json({ message: 'Report created', data: newReport });
        }
    
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err });
      }
    };

    static async GetTodayReport (req: Request, res: Response){

        try {

            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0); // mulai dari jam 00:00:00
        
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999); // sampai jam 23:59:59
        
            const todayReport = await ReportModel.findOne({
                
                createdAt: {
                    $gte: startOfDay,
                    $lte: endOfDay
                },

                isDeleted: false
            });
        
            if (!todayReport) {
                
                return res.status(200).json({
                    requestId: uuidv4(),
                    data: todayReport,
                    message: 'No report found for today',
                    success: true
                  });

            }
        
            // Kirim hasil response
            return res.status(200).json({
              requestId: uuidv4(),
              data: todayReport,
              success: true
            });

        } catch (error) {

            console.error('Error fetching today report:', error);
            
            return res.status(500).json({
                requestId: uuidv4(),
                data: null,
                message: (error as Error).message || "Internal Server Error",
                success: false
            });
        }
    };
  
    static async GetReportByDate (req: Request, res: Response){

      try {

        const { date } = req.params;

        if (!date || isNaN(new Date(date).getTime())) {
            return res.status(400).json({
                requestId: uuidv4(),
                data: null,
                message: "Invalid Date",
                success: false
            });
        }
        

          const startOfDay = new Date(date);
          startOfDay.setHours(0, 0, 0, 0); // mulai dari jam 00:00:00
      
          const endOfDay = new Date(date);
          endOfDay.setHours(23, 59, 59, 999); // sampai jam 23:59:59
      
          const todayReport = await ReportModel.findOne({
              
              createdAt: {
                  $gte: startOfDay,
                  $lte: endOfDay
              },

              isDeleted: false
          });
      
          if (!todayReport) {
              
              return res.status(200).json({
                  requestId: uuidv4(),
                  data: [],
                  message: `No report found for ${startOfDay}`,
                  success: true
                });

          }
      
          // Kirim hasil response
          return res.status(200).json({
            requestId: uuidv4(),
            data: todayReport,
            message: `Data Report : ${startOfDay}`,
            success: true
          });

      } catch (error) {

          console.error('Error fetching today report:', error);
          
          return res.status(400).json({
              requestId: uuidv4(),
              data: null,
              message: (error as Error).message || "Internal Server Error",
              success: false
          });
      }
  };
}

