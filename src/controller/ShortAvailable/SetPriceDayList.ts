export const SetPriceDayList = (cart: any, siteMinders: any, date: any) => {
    const priceList = cart.map((cartItem: any) => {
        const { _id } = cartItem;

        // Filter data siteMinders berdasarkan roomId dari cart
        const roomPrices = siteMinders.filter((minder: any) => minder.roomId.toString() === _id.toString());

        // Hitung total harga untuk roomId ini
        const roomTotal = roomPrices.reduce((sum: any, minder: any) => sum + minder.price, 0);

        
        // console.log(`RoomId: ${_id}, Date for ${date.In} / ${date.Out} price: ${roomTotal}`);

        // Return object { id, price } untuk setiap room
        return {
            id: _id,
            price: roomTotal
        };
    });

    return priceList;
};
