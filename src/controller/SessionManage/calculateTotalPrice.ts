



export const calculateTotalPrice = async (cart :any, siteMinders : any) => {
    let grandTotal = 0; // Untuk menyimpan total keseluruhan

    cart.forEach((cartItem : any) => {
        
        const { roomId, quantity } = cartItem;

        // Filter data siteMinders berdasarkan roomId dari cart
        const roomPrices = siteMinders.filter((minder : any) => minder.roomId === roomId);

        // Hitung total harga untuk roomId ini
        const roomTotal = roomPrices.reduce((sum : any, minder : any) => sum + minder.price, 0);

        // Kalikan dengan jumlah quantity dari cart
        const totalForThisRoom = roomTotal * quantity;

        console.log(`RoomId: ${roomId}, Total Price for ${quantity} rooms: ${totalForThisRoom}`);

        // Tambahkan ke grandTotal
        grandTotal += totalForThisRoom;
    });

    return grandTotal;
};

export const FilterRoomToCheckout = async (cart: any[], siteMinders: any[]) => {
    return cart.map((cartItem: any) => {
      const { roomId, quantity } = cartItem;
  
      // Filter data siteMinders berdasarkan roomId dari cart
      const roomPrices = siteMinders.filter((minder: any) => minder.roomId === roomId);
  
      // Hitung total harga untuk roomId ini
      const roomTotal = roomPrices.reduce((sum: number, minder: any) => sum + minder.price, 0);
  
      // Kalikan dengan jumlah quantity dari cart
      const totalForThisRoom = roomTotal * quantity;
  
      return {
        roomId: roomId,
        quantity: quantity,
        price: totalForThisRoom,
      };
    });
  };
  
