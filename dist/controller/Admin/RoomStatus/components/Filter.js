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
exports.CompareSameDataWithRoomStatus = exports.CompareDataHasBeenUsedWithRoomStatus = exports.FilterAvailableWithRoomStatus = void 0;
const models_RoomStatus_1 = require("../../../../models/RoomStatus/models_RoomStatus");
const FilterAvailableWithRoomStatus = (checkIn, checkOut) => __awaiter(void 0, void 0, void 0, function* () {
    const In = new Date(checkIn);
    const Out = new Date(checkOut);
    const RoomStatus = yield models_RoomStatus_1.RoomStatusModel.find({
        $or: [
            {
                checkIn: { $lte: Out.toISOString() },
                checkOut: { $gte: In.toISOString() },
            },
        ],
        isDeleted: false,
    }).select('name code number'); // ⬅ Hanya ambil field ini
    console.log(`Result Filter Room Status : from ${In} -  ${Out} below : ${RoomStatus} `);
    return RoomStatus.length > 0 ? RoomStatus : [];
});
exports.FilterAvailableWithRoomStatus = FilterAvailableWithRoomStatus;
const CompareDataHasBeenUsedWithRoomStatus = (dataTraining, dataSample) => __awaiter(void 0, void 0, void 0, function* () {
    // Ambil semua code dari dataSample
    const sampleCodes = dataSample.map(sample => sample.code);
    // Loop setiap dataTraining untuk filter roomType-nya
    const updatedTraining = dataTraining.map(training => {
        const filteredRoomTypes = (training.roomType || []).filter((room) => !sampleCodes.includes(room.code));
        return Object.assign(Object.assign({}, training), { roomType: filteredRoomTypes });
    });
    return updatedTraining;
});
exports.CompareDataHasBeenUsedWithRoomStatus = CompareDataHasBeenUsedWithRoomStatus;
const CompareSameDataWithRoomStatus = (dataTraining, dataSample) => __awaiter(void 0, void 0, void 0, function* () {
    // Ambil semua code dari dataSample
    const sampleCodes = dataSample.map(sample => sample.code);
    const updatedTraining = dataTraining.map(training => {
        const filteredRoomTypes = (training.roomType || []).filter((room) => sampleCodes.includes(room.code));
        return Object.assign(Object.assign({}, training), { roomType: filteredRoomTypes });
    });
    // Ambil semua roomType yang cocok saja (gabungan dari semua training)
    const sameRoomTypeOnly = updatedTraining
        .flatMap(training => training.roomType || []);
    return {
        fullData: updatedTraining,
        sameRoomTypeOnly,
    };
});
exports.CompareSameDataWithRoomStatus = CompareSameDataWithRoomStatus;
// export const GetDataSameWithRoomStatus = async (dataTraining: any, dataSample: any[]) => {
//     const resultCompare = dataTraining.roomType.filter((trainingItem : any) =>
//         dataSample.some(sampleItem => sampleItem.code === trainingItem.code)
//     );
//     return resultCompare.length > 0 ? resultCompare : null;
// };
// export const GetDataRoomStatusNoActive = async (dataTraining: any[], dataSample: any[]) => {
//     console.log("Cek updateRoomsAvailable: ", dataTraining);
//     console.log("Cek DataSample: ", dataSample);
//     // Kalau dataSample kosong atau tidak ada, langsung kembalikan dataTraining
//     if (!dataSample || dataSample.length === 0) {
//         return dataTraining;
//     }
//     const resultCompare = dataTraining.flatMap((room: any) => {
//         if (!Array.isArray(room.roomType)) return [];
//         const filteredRoomTypes = room.roomType.filter((trainingItem: any) =>
//             dataSample.some((sampleItem: any) => sampleItem.code !== trainingItem.code)
//         );
//         if (filteredRoomTypes.length === 0) return [];
//         return filteredRoomTypes.map((roomType: any) => ({
//             ...room,
//             ...roomType,
//         }));
//     });
//     console.log("Filtered and mapped result: ", resultCompare);
//     return resultCompare.length > 0 ? resultCompare : null;
// };
