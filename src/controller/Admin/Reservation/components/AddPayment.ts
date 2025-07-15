import { ObjectId } from "mongodb";
import IPayment, { BookingModel } from "../../../../models/Booking/models_booking";

export const  AddPayment = async (payment : IPayment, id: string) => {

    try {

        const result = await BookingModel.updateOne(

            { _id: new ObjectId(id), isDeleted: false },
            { $push: { payment } },
            { runValidators: true }

        );

        if (result.modifiedCount === 0) {
            throw new Error("Booking not found, isDeleted=true, or payment not modified");
        }

    return result.modifiedCount === 1 ? true : false

    } catch (error) {

    console.error("❌ Failed to push payment:", error); // ⬅️ sangat penting!

        throw new Error(`  "Failed to update payment", ${(error as Error).message}`);

    }

}