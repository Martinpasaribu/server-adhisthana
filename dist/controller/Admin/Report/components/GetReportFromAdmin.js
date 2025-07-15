"use strict";
// Model: BookingModel
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
exports.GetReportFromAdmin = GetReportFromAdmin;
const models_reportDaily_1 = __importDefault(require("../../../../models/Report/models_reportDaily"));
function GetReportFromAdmin(_a) {
    return __awaiter(this, arguments, void 0, function* ({ title, content, category, creator }) {
        try {
            const result = yield models_reportDaily_1.default.create({ title, content, category, creator });
            return result;
        }
        catch (error) {
            console.error('Failed to create Daily Report:', error);
            throw error;
        }
    });
}
