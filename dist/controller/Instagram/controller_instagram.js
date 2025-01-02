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
exports.InstagramController = void 0;
const uuid_1 = require("uuid");
const instagram_1 = require("../../config/instagram");
const models_instagram_1 = __importDefault(require("../../models/Instagram/models_instagram"));
class InstagramController {
    static update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Dapatkan data dari API
                const dataProfile = yield (0, instagram_1.getDataInstagramProfile)();
                const dataContent = yield (0, instagram_1.getDataInstagramPosting)();
                console.log('Data fetch sementara: ', { dataProfile, dataContent });
                // Mencari data pertama di database
                const existingData = yield models_instagram_1.default.findOne();
                if (existingData) {
                    // Jika ada, update data profile dan content yang sudah ada
                    existingData.profile = dataProfile;
                    existingData.content = dataContent;
                    yield existingData.save(); // Simpan perubahan
                    res.status(200).json({
                        message: 'Data updated successfully',
                        data: existingData
                    });
                }
                else {
                    // Jika tidak ada, tambahkan data baru
                    const newInstagramData = new models_instagram_1.default({
                        profile: dataProfile,
                        content: dataContent,
                    });
                    yield newInstagramData.save(); // Simpan data baru
                    res.status(201).json({
                        message: 'Data created successfully',
                        data: newInstagramData
                    });
                }
            }
            catch (error) {
                console.error('Error in update:', error.message);
                res.status(500).send('Error fetching Instagram data');
            }
        });
    }
    static getData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let data;
                data = yield models_instagram_1.default.find({ isDeleted: false });
                res.status(201).json({
                    requestId: (0, uuid_1.v4)(),
                    data: data,
                    message: "Successfully Fetch Data Instagram.",
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
exports.InstagramController = InstagramController;
