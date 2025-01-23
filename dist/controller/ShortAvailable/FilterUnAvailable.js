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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterUnAvailable = void 0;
const models_room_1 = __importDefault(require("../../models/Room/models_room"));
const FilterUnAvailable = (CartRoomAfterFilter) => __awaiter(void 0, void 0, void 0, function* () {
    // Mengambil semua data dari RoomModel
    const rooms = yield models_room_1.default.find();
    // Filter data yang tidak ada di CartRoomAfterFilter
    const resultRoom = rooms.filter((room) => {
        return !CartRoomAfterFilter.some((cartItem) => cartItem._id.toString() === room._id.toString());
    });
    return resultRoom;
});
exports.FilterUnAvailable = FilterUnAvailable;
