"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetResponseShort = void 0;
const SetResponseShort = (Rooms, PriceDaily) => {
    Rooms.forEach((result) => {
        const matchedPrice = PriceDaily.find((priceDay) => priceDay.id.equals(result._id));
        if (matchedPrice) {
            result.priceDateList = matchedPrice.price;
        }
    });
    return Rooms;
};
exports.SetResponseShort = SetResponseShort;
