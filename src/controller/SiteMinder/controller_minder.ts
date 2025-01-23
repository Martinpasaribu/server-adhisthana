
import { Request, Response, NextFunction  } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import RoomModel from '../../models/Room/models_room';


import { ShortAvailableController } from '../ShortAvailable/controller_short';
import { SiteMinderModel } from '../../models/SiteMinder/models_SitemMinder';
import { ShortAvailableModel } from '../../models/ShortAvailable/models_ShortAvailable';

export class SetMinderController {


        static async SetUpPrice(req: Request, res: Response) {
            
            try {
                const { prices } = req.body;
            
                if (!prices || typeof prices !== 'object') {
                  return res.status(400).json({ message: 'Invalid data format' });
                }
            
                const bulkOperations = [];
                for (const roomId in prices) {
                  for (const date in prices[roomId]) {
                    const price = prices[roomId][date];
                    bulkOperations.push({
                      updateOne: {
                        filter: { roomId, date },
                        update: { $set: { price } },
                        upsert: true,
                      },
                    });
                  }
                }
            
                await SiteMinderModel.bulkWrite(bulkOperations);


                res.status(200).json({
                  requestId: uuidv4(),
                  data: null,
                  message: `Prices saved`,
                  success: true,

              });


              } catch (error) {
                res.status(500).json({ message: 'Failed to save prices', error });
              }

        }

        static async GetAllPriceByYear(req: Request, res: Response) {

            try {
                const { year } = req.query;
            
                if (!year ) {
                  return res.status(400).json({ message: 'Year are required' });
                }
            
                const startDate = new Date(`${year}-01-01`); // Awal tahun
                const endDate = new Date(`${year}-12-31`); // Akhir

                endDate.setMonth(endDate.getMonth() + 1);
            
                const prices = await SiteMinderModel.find({
                  date: {
                    $gte: startDate.toISOString().split('T')[0],
                    $lt: endDate.toISOString().split('T')[0],
                  },
                });
            
                const formattedPrices: Record<string, Record<string, number>> = {};
                prices.forEach(({ roomId, date, price }) => {
                  if (!formattedPrices[roomId]) {
                    formattedPrices[roomId] = {};
                  }
                  formattedPrices[roomId][date] = price;
                });
            
                res.status(200).json({
                    requestId: uuidv4(),
                    data: formattedPrices,
                    message: `Set from year ${year} `,
                    success: true,
                });

              } catch (error) {
                res.status(500).json({ message: 'Failed to fetch prices', error });
              }

        }
       
        static async GetAllPrice(req: Request, res: Response) {

            try {
                const { year, month } = req.query;
            
                if (!year || !month) {
                  return res.status(400).json({ message: 'Year and month are required' });
                }
            
                const startDate = new Date(`${year}-${month}-01`);
                const endDate = new Date(startDate);

                endDate.setMonth(endDate.getMonth() + 1);
            
                const prices = await SiteMinderModel.find({
                  date: {
                    $gte: startDate.toISOString().split('T')[0],
                    $lt: endDate.toISOString().split('T')[0],
                  },
                });
            
                const formattedPrices: Record<string, Record<string, number>> = {};
                prices.forEach(({ roomId, date, price }) => {
                  if (!formattedPrices[roomId]) {
                    formattedPrices[roomId] = {};
                  }
                  formattedPrices[roomId][date] = price;
                });
            
                res.status(200).json({
                    requestId: uuidv4(),
                    data: formattedPrices,
                    message: `Successfully retrieved rooms. From year: ${year} month: ${month}`,
                    success: true,
                });

              } catch (error) {
                res.status(500).json({ message: 'Failed to fetch prices', error });
              }

        }
       
       
        static async GetAllRoom(req: Request, res: Response) {
          try {
            const { year, month } = req.query;
      
            if (!year || !month) {
              return res
                .status(400)
                .json({ message: "Year and month are required" });
            }
      
            const startDate = new Date(`${year}-${month}-01`);
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 1);
      
            // Generate all dates within the range
            const generateDateRange = (start: Date, end: Date) => {
              const dates: string[] = [];
              let currentDate = new Date(start);
              while (currentDate < end) {
                dates.push(currentDate.toISOString().split("T")[0]);
                currentDate.setDate(currentDate.getDate() + 1);
              }
              return dates;
            };
      
            const dateRange = generateDateRange(startDate, endDate);
      
            // Fetch data from the database
            const roomData = await ShortAvailableModel.find({ isDeleted: false });
      
            const resultFilter: Record<string, Record<string, number>> = {};
      
            roomData.forEach((room: any) => {
              room.products.forEach((product: any) => {
                const roomId = product.roomId;
                if (!resultFilter[roomId]) {
                  resultFilter[roomId] = {};
                  dateRange.forEach((date) => {
                    resultFilter[roomId][date] = 0; // Set default value to 0
                  });
                }
      
                const checkIn = new Date(room.checkIn).toISOString().split("T")[0];
                const checkOut = new Date(room.checkOut).toISOString().split("T")[0];
      
                const validDates = generateDateRange(
                  new Date(checkIn),
                  new Date(checkOut)
                );
      
                validDates.forEach((date) => {
                  if (resultFilter[roomId][date] !== undefined) {
                    resultFilter[roomId][date] += product.quantity;
                  }
                });
              });
            });
      
            res.status(200).json({
              requestId: uuidv4(),
              data: resultFilter,
              message: `Successfully retrieved rooms. From year: ${year} month: ${month}`,
              success: true,
            });
          } catch (error) {
            res.status(500).json({ message: "Failed to fetch Room", error });
          }
        }
       
        

        
}