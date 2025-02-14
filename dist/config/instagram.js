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
exports.getDataInstagramPosting = getDataInstagramPosting;
exports.getDataInstagramProfile = getDataInstagramProfile;
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
function getDataInstagramPosting() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
        const INSTAGRAM_USER_ID = process.env.INSTAGRAM_USER_ID;
        try {
            const response = yield axios_1.default.get(`https://graph.instagram.com/me/media?${INSTAGRAM_USER_ID}/media`, {
                params: {
                    fields: 'id,caption,media_type,media_url,permalink',
                    access_token: ACCESS_TOKEN,
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('Error fetching Instagram media:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        }
    });
}
function getDataInstagramProfile() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
        const INSTAGRAM_USER_ID = process.env.INSTAGRAM_USER_ID;
        console.log("acces token now : ", process.env.INSTAGRAM_ACCESS_TOKEN);
        try {
            const response = yield axios_1.default.get(`https://graph.instagram.com/me?${INSTAGRAM_USER_ID}/media`, {
                params: {
                    fields: 'id,username,media_count,followers_count,follows_count,biography,website,profile_picture_url',
                    access_token: ACCESS_TOKEN,
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('Error fetching Instagram media:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        }
    });
}
