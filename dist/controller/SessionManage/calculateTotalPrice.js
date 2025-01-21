"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTotalPrice = void 0;
const calculateTotalPrice = (cart, siteMinders) => {
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
};
exports.calculateTotalPrice = calculateTotalPrice;
