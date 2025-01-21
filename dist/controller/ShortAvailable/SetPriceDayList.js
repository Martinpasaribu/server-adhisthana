"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetPriceDayList = void 0;
const SetPriceDayList = (cart, siteMinders, date) => {
    const priceList = cart.map((cartItem) => {
        const { _id } = cartItem;
        // Filter data siteMinders berdasarkan roomId dari cart
        const roomPrices = siteMinders.filter((minder) => minder.roomId.toString() === _id.toString());
        // Hitung total harga untuk roomId ini
        const roomTotal = roomPrices.reduce((sum, minder) => sum + minder.price, 0);
        console.log(`RoomId: ${_id}, Date for ${date.In} / ${date.Out} price: ${roomTotal}`);
        // Return object { id, price } untuk setiap room
        return {
            id: _id,
            price: roomTotal
        };
    });
    return priceList;
};
exports.SetPriceDayList = SetPriceDayList;
