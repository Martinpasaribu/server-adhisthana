
import { Request, Response, NextFunction  } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import RoomModel from '../../models/Room/models_room';


import { ShortAvailableController } from '../ShortAvailable/controller_short';
import { SiteMinderModel } from '../../models/SiteMinder/models_SitemMinder';

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
       
        
}