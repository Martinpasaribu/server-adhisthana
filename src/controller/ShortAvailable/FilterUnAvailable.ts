import RoomModel from "../../models/Room/models_room";

export const FilterUnAvailable = async (CartRoomAfterFilter: any) => {
    // Mengambil semua data dari RoomModel
    const rooms = await RoomModel.find();

    // Filter data yang tidak ada di CartRoomAfterFilter
    const resultRoom = rooms.filter((room: any) => {
        return !CartRoomAfterFilter.some((cartItem: any) => cartItem._id.toString() === room._id.toString());
    });


    return resultRoom;
};
