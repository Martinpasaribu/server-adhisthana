

export const SetResponseShort = (Rooms : any , PriceDaily : any) => {

    Rooms.forEach((result : any) => {
        const matchedPrice = PriceDaily.find((priceDay : any) => priceDay.id.equals(result._id));
        if (matchedPrice) {
          result.priceDateList = matchedPrice.price;
        }
      });

      return Rooms

}