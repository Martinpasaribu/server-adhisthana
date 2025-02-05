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
exports.RoomController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const models_room_1 = __importDefault(require("../../../models/Room/models_room"));
class RoomController {
    static addRoom(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const RoomReq = req.body;
            try {
                const newRoom = new models_room_1.default(RoomReq);
                const savedRoom = yield newRoom.save();
                res.status(201).json({
                    requestId: (0, uuid_1.v4)(),
                    data: {
                        acknowledged: true,
                        insertedId: savedRoom._id
                    },
                    message: "Successfully Add Room.",
                    success: true
                });
            }
            catch (error) {
                res.status(400).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message,
                    success: false
                });
            }
        });
    }
    static getRoom(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let data;
                data = yield models_room_1.default.find({ isDeleted: false });
                res.status(201).json({
                    requestId: (0, uuid_1.v4)(),
                    data: data,
                    message: "Successfully Fetch Data Room.",
                    success: true
                });
            }
            catch (error) {
                res.status(400).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message,
                    success: false
                });
            }
        });
    }
    static getRoomByParams(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let data;
            const { id } = req.params;
            try {
                new mongoose_1.default.Types.ObjectId(id),
                    data = yield models_room_1.default.find({ _id: id, isDeleted: false });
                res.status(201).json({
                    requestId: (0, uuid_1.v4)(),
                    data: data,
                    message: "Successfully Fetch Data Room by Params.",
                    success: true
                });
            }
            catch (error) {
                res.status(400).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message,
                    RoomId: `Room id : ${id}`,
                    success: false
                });
            }
        });
    }
    static deletedRoomPermanent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const deletedRoom = yield models_room_1.default.findOneAndDelete({ _id: id });
                res.status(201).json({
                    requestId: (0, uuid_1.v4)(),
                    data: deletedRoom,
                    message: "Successfully DeletedPermanent Data Room as Cascade .",
                    success: true
                });
            }
            catch (error) {
                res.status(400).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message,
                    success: false
                });
            }
        });
    }
    static updatePacketAll(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const updateData = req.body;
            try {
                const updatedPacket = yield models_room_1.default.findOneAndUpdate({ _id: id }, updateData, { new: true, runValidators: true });
                if (!updatedPacket) {
                    return res.status(404).json({
                        requestId: (0, uuid_1.v4)(),
                        success: false,
                        message: "Packet not found",
                    });
                }
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    success: true,
                    message: "Successfully updated Packet data",
                    data: updatedPacket
                });
            }
            catch (error) {
                res.status(400).json({
                    requestId: (0, uuid_1.v4)(),
                    success: false,
                    message: error.message,
                });
            }
        });
    }
    ;
    static updateRoomPart(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const updateData = req.body;
            // if (updateData._id) {
            //     delete updateData._id;
            // }
            try {
                const updatedRoom = yield models_room_1.default.findOneAndUpdate(
                // new mongoose.Types.ObjectId(id),        
                { _id: id }, updateData, { new: true, runValidators: true });
                if (!updatedRoom) {
                    return res.status(404).json({
                        requestId: (0, uuid_1.v4)(),
                        success: false,
                        message: "Room not found",
                    });
                }
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    success: true,
                    message: "Successfully updated Room data",
                    data: updatedRoom
                });
            }
            catch (error) {
                res.status(400).json({
                    requestId: (0, uuid_1.v4)(),
                    success: false,
                    message: error.message,
                });
            }
        });
    }
    ;
    static getAllRoom(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let data;
                data = yield models_room_1.default.find({
                    isDeleted: false,
                }, {
                    name: true,
                    _id: true,
                    available: true
                });
                res.status(201).json({
                    requestId: (0, uuid_1.v4)(),
                    data: data,
                    message: "Successfully Fetch Data Room.",
                    success: true
                });
            }
            catch (error) {
                res.status(400).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message,
                    success: false
                });
            }
        });
    }
}
exports.RoomController = RoomController;
