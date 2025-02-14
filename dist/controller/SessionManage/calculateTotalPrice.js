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
exports.FilterRoomToCheckout = exports.calculateTotalPrice = void 0;
const calculateTotalPrice = (cart, siteMinders) => __awaiter(void 0, void 0, void 0, function* () {
    let grandTotal = 0; // Untuk menyimpan total keseluruhan
    cart.forEach((cartItem) => {
        const { roomId, quantity } = cartItem;
        // Filter data siteMinders berdasarkan roomId dari cart
        const roomPrices = siteMinders.filter((minder) => minder.roomId === roomId);
        // Hitung total harga untuk roomId ini
        const roomTotal = roomPrices.reduce((sum, minder) => sum + minder.price, 0);
        // Kalikan dengan jumlah quantity dari cart
        const totalForThisRoom = roomTotal * quantity;
        console.log(`RoomId: ${roomId}, Total Price for ${quantity} rooms: ${totalForThisRoom}`);
        // Tambahkan ke grandTotal
        grandTotal += totalForThisRoom;
    });
    return grandTotal;
});
exports.calculateTotalPrice = calculateTotalPrice;
const FilterRoomToCheckout = (cart, siteMinders) => __awaiter(void 0, void 0, void 0, function* () {
    return cart.map((cartItem) => {
        const { roomId, quantity } = cartItem;
        // Filter data siteMinders berdasarkan roomId dari cart
        const roomPrices = siteMinders.filter((minder) => minder.roomId === roomId);
        // Hitung total harga untuk roomId ini
        const roomTotal = roomPrices.reduce((sum, minder) => sum + minder.price, 0);
        // Kalikan dengan jumlah quantity dari cart
        const totalForThisRoom = roomTotal * quantity;
        return {
            roomId: roomId,
            quantity: quantity,
            price: totalForThisRoom,
        };
    });
});
exports.FilterRoomToCheckout = FilterRoomToCheckout;
