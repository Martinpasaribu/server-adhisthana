
// Helper function untuk generate date range
interface Room {
    roomId:string;
    name:string;
    priceTotal:number;
    ota:number;
    quantity:number;
}

interface SiteMinder {
    roomId: string;
    date: string;
    price: number;
    
}

export const UpdateRefund = async (DataRoom: Room[], DataByDate: SiteMinder[], night: number, checkin: Date) => {
  if (!DataRoom.length) {
    throw new Error("Data booking tidak ditemukan");
  }

  // Menghitung total harga berdasarkan roomId dan tanggal check-in
  return DataRoom.reduce((total, room) => {
    let totalHargaRoom = 0;

    // Menghitung harga per malam
    for (let i = 0; i < night; i++) {
      // Mendapatkan tanggal untuk malam ke-i (misalnya, jika check-in 1 Maret dan malam ke-0 adalah 1 Maret, malam ke-1 adalah 2 Maret, dll)
      const currentDate = new Date(checkin);
      currentDate.setDate(currentDate.getDate() + i); // Menambahkan i hari ke tanggal check-in

      // Cari harga berdasarkan roomId dan tanggal yang sesuai
      const harga = DataByDate.find((data) => data.roomId === room.roomId && new Date(data.date).toDateString() === currentDate.toDateString())?.price || 0;
      totalHargaRoom += harga;  // Menambahkan harga per malam
    }

    // Menghitung total harga dengan mempertimbangkan jumlah kamar
    return total + totalHargaRoom * room.quantity;
  }, 0);
};
