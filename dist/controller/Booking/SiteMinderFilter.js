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
exports.FilterSiteMinder = void 0;
const moment_1 = __importDefault(require("moment"));
const models_SitemMinder_1 = require("../../models/SiteMinder/models_SitemMinder");
const FilterSiteMinder = (checkIn, checkOut) => __awaiter(void 0, void 0, void 0, function* () {
    const dateMinderStart = moment_1.default.utc(checkIn).format('YYYY-MM-DD');
    const dateMinderEnd = moment_1.default.utc(checkOut).subtract(1, 'days').format('YYYY-MM-DD');
    const siteMinders = yield models_SitemMinder_1.SiteMinderModel.find({
        isDeleted: false,
        date: { $gte: dateMinderStart, $lte: dateMinderEnd },
    });
    if (!siteMinders || siteMinders.length === 0) {
        throw new Error("Tidak ada data SiteMinder yang ditemukan untuk tanggal tersebut.");
    }
    return siteMinders;
});
exports.FilterSiteMinder = FilterSiteMinder;
