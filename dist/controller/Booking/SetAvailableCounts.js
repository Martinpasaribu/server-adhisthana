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
exports.SetAvailableCount = void 0;
const FilterAvailableRoom_1 = require("../ShortAvailable/FilterAvailableRoom");
const SetAvailableCount = (rooms, checkInDate, checkOutDate) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const RoomsAvailableCount = yield (0, FilterAvailableRoom_1.FilterAvailable)(checkInDate, checkOutDate);
        const FilterAvailableCount = rooms.map((room) => {
            // Temukan elemen RoomsAvailableCount dengan roomId yang cocok
            const availableRoom = RoomsAvailableCount.find((data) => data._id.toString() === room.roomId);
            // console.log("Available room:", availableRoom);
            return Object.assign(Object.assign({}, room), { availableCount: availableRoom ? availableRoom.availableCount : 0 });
        });
        // console.log("FilterAvailableCount :", FilterAvailableCount)
        return FilterAvailableCount;
    }
    catch (error) {
        console.error("Error in SetAvailableCount:", error);
        throw new Error('Function SetAvailableCount not implemented.');
    }
});
exports.SetAvailableCount = SetAvailableCount;
