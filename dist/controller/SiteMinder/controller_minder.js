"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetMinderController = void 0;
const uuid_1 = require("uuid");
const models_SitemMinder_1 = require("../../models/SiteMinder/models_SitemMinder");
const models_ShortAvailable_1 = require("../../models/ShortAvailable/models_ShortAvailable");
class SetMinderController {
    static SetUpPrice(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                yield models_SitemMinder_1.SiteMinderModel.bulkWrite(bulkOperations);
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: `Prices saved`,
                    success: true,
                });
            }
            catch (error) {
                res.status(500).json({ message: 'Failed to save prices', error });
            }
        });
    }
    static GetAllPriceByYear(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { year } = req.query;
                if (!year) {
                    return res.status(400).json({ message: 'Year are required' });
                }
                const startDate = new Date(`${year}-01-01`); // Awal tahun
                const endDate = new Date(`${year}-12-31`); // Akhir
                endDate.setMonth(endDate.getMonth() + 1);
                const prices = yield models_SitemMinder_1.SiteMinderModel.find({
                    date: {
                        $gte: startDate.toISOString().split('T')[0],
                        $lt: endDate.toISOString().split('T')[0],
                    },
                });
                const formattedPrices = {};
                prices.forEach(({ roomId, date, price }) => {
                    if (!formattedPrices[roomId]) {
                        formattedPrices[roomId] = {};
                    }
                    formattedPrices[roomId][date] = price;
                });
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: formattedPrices,
                    message: `Set from year ${year} `,
                    success: true,
                });
            }
            catch (error) {
                res.status(500).json({ message: 'Failed to fetch prices', error });
            }
        });
    }
    static GetAllPrice(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { year, month } = req.query;
                if (!year || !month) {
                    return res.status(400).json({ message: 'Year and month are required' });
                }
                const startDate = new Date(`${year}-${month}-01`);
                const endDate = new Date(startDate);
                endDate.setMonth(endDate.getMonth() + 1);
                const prices = yield models_SitemMinder_1.SiteMinderModel.find({
                    date: {
                        $gte: startDate.toISOString().split('T')[0],
                        $lt: endDate.toISOString().split('T')[0],
                    },
                });
                const formattedPrices = {};
                prices.forEach(({ roomId, date, price }) => {
                    if (!formattedPrices[roomId]) {
                        formattedPrices[roomId] = {};
                    }
                    formattedPrices[roomId][date] = price;
                });
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: formattedPrices,
                    message: `Successfully retrieved rooms. From year: ${year} month: ${month}`,
                    success: true,
                });
            }
            catch (error) {
                res.status(500).json({ message: 'Failed to fetch prices', error });
            }
        });
    }
    static GetAllRoom(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const generateDateRange = (start, end) => {
                    const dates = [];
                    let currentDate = new Date(start);
                    while (currentDate < end) {
                        dates.push(currentDate.toISOString().split("T")[0]);
                        currentDate.setDate(currentDate.getDate() + 1);
                    }
                    return dates;
                };
                const dateRange = generateDateRange(startDate, endDate);
                // Fetch data from the database
                const roomData = yield models_ShortAvailable_1.ShortAvailableModel.find({ isDeleted: false });
                const resultFilter = {};
                roomData.forEach((room) => {
                    room.products.forEach((product) => {
                        const roomId = product.roomId;
                        if (!resultFilter[roomId]) {
                            resultFilter[roomId] = {};
                            dateRange.forEach((date) => {
                                resultFilter[roomId][date] = 0; // Set default value to 0
                            });
                        }
                        const checkIn = new Date(room.checkIn).toISOString().split("T")[0];
                        const checkOut = new Date(room.checkOut).toISOString().split("T")[0];
                        const validDates = generateDateRange(new Date(checkIn), new Date(checkOut));
                        validDates.forEach((date) => {
                            if (resultFilter[roomId][date] !== undefined) {
                                resultFilter[roomId][date] += product.quantity;
                            }
                        });
                    });
                });
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: resultFilter,
                    message: `Successfully retrieved rooms. From year: ${year} month: ${month}`,
                    success: true,
                });
            }
            catch (error) {
                res.status(500).json({ message: "Failed to fetch Room", error });
            }
        });
    }
}
exports.SetMinderController = SetMinderController;
