// nanoid.ts
import { nanoid } from 'nanoid';

export const generateBookingId = async () => {
    const { nanoid } = await import('nanoid');
    return nanoid();
    // return bookingId;
};
