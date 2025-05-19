import { FilterAvailable, FilterAvailable02 } from "../ShortAvailable/FilterAvailableRoom"


export const SetAvailableCount = async (rooms : any, checkInDate: any , checkOutDate : any) => {

    try {
        
        const RoomsAvailableCount = await FilterAvailable02(checkInDate, checkOutDate);

        const FilterAvailableCount = rooms.map((room: any) => {
            // Temukan elemen RoomsAvailableCount dengan roomId yang cocok
            const availableRoom = RoomsAvailableCount.find(
              (data: any) => data._id.toString() === room.roomId
            );

            // console.log("Available room:", availableRoom);
            
            return {
              ...room,
              availableCount: availableRoom ? availableRoom.availableCount : 0, // Jika ditemukan, gunakan availableCount; jika tidak, default 0
            };
          });

          // console.log("FilterAvailableCount :", FilterAvailableCount)
          return FilterAvailableCount ;

    } catch (error) {
        console.error("Error in SetAvailableCount:", error);
        throw new Error('Function SetAvailableCount not implemented.');
    }


}