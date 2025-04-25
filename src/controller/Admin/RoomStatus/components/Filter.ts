import { RoomStatusModel } from "../../../../models/RoomStatus/models_RoomStatus";


export const FilterAvailableWithRoomStatus = async (checkIn: any, checkOut: any) => {
    const In = new Date(checkIn);
    const Out = new Date(checkOut);

    const RoomStatus = await RoomStatusModel.find(
        {
            $or: [
                {
                    checkIn: { $lte: Out.toISOString() },
                    checkOut: { $gte: In.toISOString() },
                },
            ],
            isDeleted: false,
        }
    ).select('name code number'); // ⬅ Hanya ambil field ini

    console.log(`Result Filter Room Status : from ${In} -  ${Out} below : ${RoomStatus} `)
    return RoomStatus.length > 0 ? RoomStatus : [];
};

export const CompareDataHasBeenUsedWithRoomStatus = async (dataTraining: any[], dataSample: any[]) => {
    // Ambil semua code dari dataSample
    const sampleCodes = dataSample.map(sample => sample.code);
  
    // Loop setiap dataTraining untuk filter roomType-nya
    const updatedTraining = dataTraining.map(training => {
      const filteredRoomTypes = (training.roomType || []).filter((room : any) =>
        !sampleCodes.includes(room.code)
      );
      return {
        ...training,
        roomType: filteredRoomTypes,
      };
    });
  
    return updatedTraining;
  };
  

  export const CompareSameDataWithRoomStatus = async (dataTraining: any[], dataSample: any[]) => {
    // Ambil semua code dari dataSample
    const sampleCodes = dataSample.map(sample => sample.code);
  
    const updatedTraining = dataTraining.map(training => {
      const filteredRoomTypes = (training.roomType || []).filter((room: any) =>
        sampleCodes.includes(room.code)
      );
  
      return {
        ...training,
        roomType: filteredRoomTypes,
      };
    });
  
    // Ambil semua roomType yang cocok saja (gabungan dari semua training)
    const sameRoomTypeOnly = updatedTraining
      .flatMap(training => training.roomType || []);
  
    return {
      fullData: updatedTraining,
      sameRoomTypeOnly,
    };
  };
  
  

// export const GetDataSameWithRoomStatus = async (dataTraining: any, dataSample: any[]) => {
    
//     const resultCompare = dataTraining.roomType.filter((trainingItem : any) =>
//         dataSample.some(sampleItem => sampleItem.code === trainingItem.code)
//     );

//     return resultCompare.length > 0 ? resultCompare : null;
// };


// export const GetDataRoomStatusNoActive = async (dataTraining: any[], dataSample: any[]) => {
//     console.log("Cek updateRoomsAvailable: ", dataTraining);
//     console.log("Cek DataSample: ", dataSample);

//     // Kalau dataSample kosong atau tidak ada, langsung kembalikan dataTraining
//     if (!dataSample || dataSample.length === 0) {
//         return dataTraining;
//     }

//     const resultCompare = dataTraining.flatMap((room: any) => {
//         if (!Array.isArray(room.roomType)) return [];

//         const filteredRoomTypes = room.roomType.filter((trainingItem: any) =>
//             dataSample.some((sampleItem: any) => sampleItem.code !== trainingItem.code)
//         );

//         if (filteredRoomTypes.length === 0) return [];

//         return filteredRoomTypes.map((roomType: any) => ({
//             ...room,
//             ...roomType,
//         }));
//     });

//     console.log("Filtered and mapped result: ", resultCompare);

//     return resultCompare.length > 0 ? resultCompare : null;
// };




  