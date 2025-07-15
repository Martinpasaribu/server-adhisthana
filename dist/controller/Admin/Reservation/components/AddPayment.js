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
exports.AddPayment = void 0;
const mongodb_1 = require("mongodb");
const models_booking_1 = require("../../../../models/Booking/models_booking");
const AddPayment = (payment, id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield models_booking_1.BookingModel.updateOne({ _id: new mongodb_1.ObjectId(id), isDeleted: false }, { $push: { payment } }, { runValidators: true });
        if (result.modifiedCount === 0) {
            throw new Error("Booking not found, isDeleted=true, or payment not modified");
        }
        return result.modifiedCount === 1 ? true : false;
    }
    catch (error) {
        console.error("❌ Failed to push payment:", error); // ⬅️ sangat penting!
        throw new Error(`  "Failed to update payment", ${error.message}`);
    }
});
exports.AddPayment = AddPayment;
